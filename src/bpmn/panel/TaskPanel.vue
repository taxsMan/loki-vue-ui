<template>
  <el-form ref="formRef" size="default" :model="formData" :rules="formRules" label-width="60px">
    <el-collapse v-model="ctx.showCollapse">
      <el-collapse-item title="节点" :name="1">
        <el-form-item label="ID">
          <el-input v-model="formData.id" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="formData.name" @change="setProperty(formData.name,'name',null)" />
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="代理" :name="2">
        <el-form-item label="字段">
          <el-input v-model="formData.field" @blur="setProperty(formData.field, 'field')" />
        </el-form-item>
        <el-form-item label="代理人">
          <el-input v-model="formData.assignee" @blur="setProperty(formData.assignee,'assignee')" />
        </el-form-item>
        <el-form-item label="候选人" prop="formKey">
          <el-badge :value="selectUserLength" :max="99">
            <el-button size="small" type="primary" @click="openUserSelect">选择人员</el-button>
          </el-badge>
        </el-form-item>
        <el-form-item label="表单">
          <select-plus v-model="formData.formKey" clearable :options="ctx.forms" @change="selectForms"
                       label="formName" value="id" />
        </el-form-item>
        <el-form-item label="优先级">
          <slider-plus v-model="formData.priority" @change="handlePriority"
                       style="width: 98%" :max="10" />
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </el-form>
  <UserSelect ref="userSelectRef" :data="formData.candidateUsers" @confirm-call-back="userSelectCallBack"></UserSelect>
</template>
<script setup lang="ts">

import { formRules, initFormData, PropType } from '@/bpmn/panel/TaskPanel';
import type { TaskPanel } from 'bpmnDesign';
import useParseElement from '@/bpmn/hooks/useParseElement';
import usePanel from '@/bpmn/hooks/usePanel';
import UserSelect from '@/components/UserSelect/index.vue';
import { UserVO } from '@/api/system/user/types';
import SelectPlus from '@/components/Form/select-plus.vue';
import { selectListFormManage } from '@/api/workflow/formManage';
import SliderPlus from '@/components/Form/slider-plus.vue';


/**
 * 组件参数导入
 */
const props = withDefaults(defineProps<PropType>(), {});
const { setNode, setProperty } = usePanel({ element: toRaw(props.element) });

/**
 * 解析数据
 */
const { parseData } = useParseElement({
  element: toRaw(props.element)
});

/**
 * 表单数据
 */
const formData = ref({ ...initFormData, ...parseData<TaskPanel>() });

/**
 * context 页面交互数据
 */
const ctx = ref({
  // 展开折叠面板项
  showCollapse: [1, 2],
  // 表单列表
  forms: [],
  selectUserList: []
});


const userSelectRef = ref<InstanceType<typeof UserSelect>>();

/*----------------------------------------------------------------*/
// 数据中间件
/*----------------------------------------------------------------*/

const selectUserLength = computed(() => {
  if (formData.value.candidateUsers) {
    return formData.value.candidateUsers.split(',').length;
  } else {
    return 0;
  }
});

/*----------------------------------------------------------------*/
// 处理方法
/*----------------------------------------------------------------*/
/**
 * 打开人员选择弹框
 */
const openUserSelect = () => {

  ctx.value.selectUserList = [];
  userSelectRef.value.open();
};
/**
 * 设置节点受理（审核）人
 * @param data
 */
const userSelectCallBack = (data: UserVO[]) => {
  const userIds = data.length > 0 ? data.map(it => it.userId).join(',') : undefined;
  const userList = data.length > 0 ? data.map(it => {
    return { userId: it.userId, userName: it.userName };
  }) : undefined;

  formData.value.candidateUsers = userIds ? String(userIds) : null;
  setProperty(userIds, 'candidateUsers');
  setNode('extCandidateUsers', userList);
};
/**
 * 选取表单
 * @param value
 */
const selectForms = (value: string) => {
  setProperty(value ? `static:${value}` : undefined, 'formKey');
};
const handlePriority = (value: string | number) => {
  setProperty(String(value), 'priority');
};

/**
 * 获取表单列表
 */
const forms = async () => {
  const res = await selectListFormManage();
  ctx.value.forms = res.data;
};

const removal = (value: string, facade: string = 'static:') => {
  if (typeof value === 'string' && value.indexOf(facade) >= 0) {

    return value.replace(facade, '');
  }
  return value;
};
/*----------------------------------------------------------------*/
// 绑定函数
/*----------------------------------------------------------------*/


/*----------------------------------------------------------------*/
// 生命周期处理
/*----------------------------------------------------------------*/
watch(()=>formData.value.formKey,(value)=>{
  formData.value.formKey = removal(formData.value.formKey);
  console.log("watch",value);
})
onMounted(() => {
  formData.value.formKey = removal(formData.value.formKey);
  console.log(formData.value.formKey);
  nextTick(() => {
    forms();
  });
});
onUpdated(()=>{
  console.log(formData.value.formKey);
})

</script>

<style lang="scss" scoped>
:deep(.el-collapse-item__header) {
  font-weight: bold;
  font-size: 14pt;
}
</style>
