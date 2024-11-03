<template>
  <div class="p-2">
    <el-card shadow="never">
      <div style="display: flex; justify-content: space-between">
        <div>
          <el-button v-if="submitButtonShow" :loading="buttonLoading" type="info" @click="submitForm('draft')">暂存
          </el-button>
          <el-button v-if="submitButtonShow" :loading="buttonLoading" type="primary" @click="submitForm('submit')">提
            交
          </el-button>
          <el-button v-if="approvalButtonShow" :loading="buttonLoading" type="primary" @click="approvalVerifyOpen">
            审批
          </el-button>
          <el-button v-if="form && form.id && form.status !== 'draft'" type="primary" @click="handleApprovalRecord">
            流程进度
          </el-button>
        </div>
        <div>
          <el-button style="float: right" @click="goBack()">返回</el-button>
        </div>
      </div>
    </el-card>
    <el-card shadow="never" style="height: 78vh; overflow-y: auto">
      <el-form ref="leaveFormRef" v-loading="loading" :disabled="routeParams.type === 'view'" :model="form"
               :rules="rules" label-width="80px">
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="form.leaveType" placeholder="请选择请假类型" style="width: 100%">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="请假时间">
          <el-date-picker
              v-model="leaveTime"
              type="daterange"
              range-separator="To"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              @change="changeLeaveTime()"
          />
        </el-form-item>
        <el-form-item label="请假天数" prop="leaveDays">
          <el-input v-model="form.leaveDays" disabled type="number" placeholder="请输入请假天数"/>
        </el-form-item>
        <el-form-item label="请假原因" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入请假原因"/>
        </el-form-item>
        <el-form-item label="批准人" prop="ids">
          <el-input v-model="form.ids"/>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 提交组件 -->
    <process-submit
        ref="processSubmitRef"
        v-model:visible="visible"
        :task-parameters="taskVariables"
        success-redirect="/demo/leave"
    />
    <!--    <submitVerify ref="submitVerifyRef" :variables="variables" :task-variables="taskVariables" @submit-callback="submitCallback" />-->
    <!-- 审批记录 -->
    <approvalRecord ref="approvalRecordRef"/>
  </div>
</template>

<script setup name="Leave" lang="ts">
import {addLeave, getLeave, updateLeave} from '@/api/workflow/leave';
import {LeaveForm, LeaveQuery, LeaveVO} from '@/api/workflow/leave/types';
import {startWorkFlow} from '@/api/workflow/task';
import SubmitVerify from '@/components/Process/submitVerify.vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
import {StartProcessBo} from '@/api/workflow/workflowCommon/types';
import ProcessSubmit from '@/components/Process/processSubmit.vue';

const {proxy} = getCurrentInstance() as ComponentInternalInstance;

const buttonLoading = ref(false);
const loading = ref(true);
const leaveTime = ref<Array<string>>([]);
const visible = ref(false);

// 任务流组件
const processSubmitRef = ref(null);
//路由参数
const routeParams = ref<Record<string, any>>({});
const options = [
  {
    value: '1',
    label: '事假'
  },
  {
    value: '2',
    label: '调休'
  },
  {
    value: '3',
    label: '病假'
  },
  {
    value: '4',
    label: '婚假'
  }
];
//提交组件
const submitVerifyRef = ref<InstanceType<typeof SubmitVerify>>();
//审批记录组件
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>();

const leaveFormRef = ref<ElFormInstance>();

const submitFormData = ref<StartProcessBo>({
  businessKey: '',
  tableName: '',
  variables: {}
});
const taskVariables = ref<Record<string, any>>({});

const initFormData: LeaveForm = {
  id: undefined,
  leaveType: undefined,
  startDate: undefined,
  endDate: undefined,
  leaveDays: undefined,
  remark: undefined,
  status: undefined,
  ids: undefined
};
const data = reactive<PageData<LeaveForm, LeaveQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    startLeaveDays: undefined,
    endLeaveDays: undefined
  },
  rules: {
    id: [{required: true, message: '主键不能为空', trigger: 'blur'}],
    leaveType: [{required: true, message: '请假类型不能为空', trigger: 'blur'}],
    leaveTime: [{required: true, message: '请假时间不能为空', trigger: 'blur'}],
    leaveDays: [{required: true, message: '请假天数不能为空', trigger: 'blur'}],
    ids: [{required: true, message: '审批人不能为空', trigger: 'blur'}]
  }
});

const {form, rules} = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  leaveTime.value = [];
  leaveFormRef.value?.resetFields();
};

const changeLeaveTime = () => {
  const startDate = new Date(leaveTime.value[0]).getTime();
  const endDate = new Date(leaveTime.value[1]).getTime();
  const diffInMilliseconds = endDate - startDate;
  form.value.leaveDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)) + 1;
};
/** 获取详情 */
const getInfo = () => {
  loading.value = true;
  buttonLoading.value = false;
  nextTick(async () => {
    const res = await getLeave(routeParams.value.id);
    Object.assign(form.value, res.data);
    leaveTime.value = [];
    leaveTime.value.push(form.value.startDate);
    leaveTime.value.push(form.value.endDate);
    loading.value = false;
    buttonLoading.value = false;
  });
};

/** 提交按钮 */
const submitForm = (status: string) => {

  if (leaveTime.value.length === 0) {
    proxy?.$modal.msgError('请假时间不能为空');
    return;
  }
  try {
    leaveFormRef.value?.validate(async (valid: boolean) => {
      // 参数验证
      if (!valid) return;
      form.value.startDate = leaveTime.value[0];
      form.value.endDate = leaveTime.value[1];

      let res = (form.value.id ? await updateLeave(form.value) : await addLeave(form.value)).data ?? form.value;


      // 暂存
      if(status === 'draft') {
        proxy.$router.push('/demo/leave');
        return
      }

      if (res.id) {
        taskVariables.value = form.value;
        visible.value = true;
        await processSubmitRef.value.startWorkFlow({

          businessKey: res.id as string,
          tableName: "test_leave",
          taskVariables: form.value
        });
      }
      return;

    });
  } finally {
    buttonLoading.value = false;
  }
};

//审批记录
const handleApprovalRecord = () => {
  approvalRecordRef.value.init(form.value.id);
};

//返回
const goBack = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.go(-1);
};
//审批
const approvalVerifyOpen = async () => {
  submitVerifyRef.value.openDialog(routeParams.value.taskId);
};
//校验提交按钮是否显示
const submitButtonShow = computed(() => {
  return (
      routeParams.value.type === 'add' ||
      (routeParams.value.type === 'update' &&
          form.value.status &&
          (form.value.status === 'draft' || form.value.status === 'cancel' || form.value.status === 'back'))
  );
});

//校验审批按钮是否显示
const approvalButtonShow = computed(() => {
  return routeParams.value.type === 'approval' && form.value.status && form.value.status === 'waiting';
});


onMounted(() => {
  nextTick(async () => {
    routeParams.value = proxy.$route.query;
    reset();
    loading.value = false;
    if (routeParams.value.type === 'update' || routeParams.value.type === 'view' || routeParams.value.type === 'approval') {
      getInfo();
    }
  });
});
</script>
