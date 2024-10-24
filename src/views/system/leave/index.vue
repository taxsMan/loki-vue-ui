<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker clearable
                v-model="queryParams.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择开始时间"
              />
            </el-form-item>
            <el-form-item label="结束时间" prop="endDate">
              <el-date-picker clearable
                v-model="queryParams.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择结束时间"
              />
            </el-form-item>
            <el-form-item label="请假天数" prop="leaveDays">
              <el-input v-model="queryParams.leaveDays" placeholder="请输入请假天数" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="" prop="ids">
              <el-input v-model="queryParams.ids" placeholder="请输入" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:leave:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:leave:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:leave:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:leave:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="leaveList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键" align="center" prop="id" v-if="true" />
        <el-table-column label="请假类型" align="center" prop="leaveType" />
        <el-table-column label="开始时间" align="center" prop="startDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="endDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="请假天数" align="center" prop="leaveDays" />
        <el-table-column label="请假原因" align="center" prop="remark" />
        <el-table-column label="状态" align="center" prop="status" />
        <el-table-column label="" align="center" prop="ids" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:leave:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:leave:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改请假申请对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="leaveFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker clearable
            v-model="form.startDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker clearable
            v-model="form.endDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="请假天数" prop="leaveDays">
          <el-input v-model="form.leaveDays" placeholder="请输入请假天数" />
        </el-form-item>
        <el-form-item label="请假原因" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入请假原因" />
        </el-form-item>
        <el-form-item label="" prop="ids">
          <el-input v-model="form.ids" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Leave" lang="ts">
import { listLeave, getLeave, delLeave, addLeave, updateLeave } from '@/api/system/leave';
import { LeaveVO, LeaveQuery, LeaveForm } from '@/api/system/leave/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const leaveList = ref<LeaveVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const leaveFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LeaveForm = {
  id: undefined,
  leaveType: undefined,
  startDate: undefined,
  endDate: undefined,
  leaveDays: undefined,
  remark: undefined,
  status: undefined,
  ids: undefined
}
const data = reactive<PageData<LeaveForm, LeaveQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    leaveType: undefined,
    startDate: undefined,
    endDate: undefined,
    leaveDays: undefined,
    status: undefined,
    ids: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    leaveType: [
      { required: true, message: "请假类型不能为空", trigger: "change" }
    ],
    startDate: [
      { required: true, message: "开始时间不能为空", trigger: "blur" }
    ],
    endDate: [
      { required: true, message: "结束时间不能为空", trigger: "blur" }
    ],
    leaveDays: [
      { required: true, message: "请假天数不能为空", trigger: "blur" }
    ],
    remark: [
      { required: true, message: "请假原因不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    ids: [
      { required: true, message: "不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询请假申请列表 */
const getList = async () => {
  loading.value = true;
  const res = await listLeave(queryParams.value);
  leaveList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  leaveFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: LeaveVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加请假申请";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: LeaveVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getLeave(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改请假申请";
}

/** 提交按钮 */
const submitForm = () => {
  leaveFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateLeave(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addLeave(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: LeaveVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除请假申请编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delLeave(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/leave/export', {
    ...queryParams.value
  }, `leave_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
