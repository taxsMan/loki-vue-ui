<template>

  <el-dialog v-model="ctx.visible" :title="title??'提交任务'" width="50%">
    <el-form :model="form">
      <el-form-item label="消息通知">
        <el-checkbox-group v-model="form.messageType">
          <el-checkbox v-for="it in ctx.messageType" :label="it.label" :value="it.value" :disabled="it.disable"/>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="抄送">

      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="handleCompleteTask"> 提交</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
const {proxy} = getCurrentInstance() as ComponentInternalInstance;
import {completeTask, startWorkFlow as startWorkFlowRequest} from '@/api/workflow/task';

interface ITaskParameters {
  businessKey: string;
  tableName: string;
  taskId?: string | number | undefined;
  taskVariables?: any;
}

interface iProps {
  // 弹框标题
  title?: string;
  // 弹框显示
  visible?: boolean;
  // 流程实例
  workFlowInstance?: {
    processInstanceId: string;
    taskId: string | number | undefined;
  };

  // 提交成功后 重定向
  successRedirect?: any;
  // 提交失败后 重定向
  failedRedirect?: any
}

interface iForm {
  // 提交参数
  variables?: any;
  // 消息类型
  messageType: Array<string | number>;
  // 任务标识
  taskId: string | null;
}

interface IAttr {
  callback?: (status: number | boolean | string, msg: string) => void;
}

/*------------------------------------------------------------------------------*/
// 参数定义
/*------------------------------------------------------------------------------*/
const props = defineProps<iProps>();
const attrs: IAttr = useAttrs();
const emits = defineEmits(['update:variables']);
const ctx = reactive({
      visible: false,
      /// 消息类型
      messageType: [
        {value: 1, label: '站内信', disable: true},
        {value: 2, label: '邮件', disable: false},
        {value: 3, label: '短信', disable: false}
      ]
    })
;

const form = ref<iForm>({
  variables: {},
  messageType: [1],
  taskId: '',
});


/*------------------------------------------------------------------------------*/
// 处理逻辑
/*------------------------------------------------------------------------------*/
function init() {
  ctx.visible = props.visible;
}

/**
 * 启动流程任务
 */
async function handleCompleteTask() {
  const res = await completeTask(form.value);
  if (res.code == 200 && props.successRedirect) {
    proxy.$router.push(props.successRedirect);
  } else if (props.failedRedirect) {
    proxy.$router.push(props.failedRedirect);
  }
  ctx.visible = false;
  proxy?.$modal.msgSuccess(res.msg ?? "提交失败");

}

/**
 * 开始一个任务流
 */
async function startWorkFlow(params: ITaskParameters) {

  try {
    if (!params.taskId) {
      const res = (await startWorkFlowRequest(params)).data;
      form.value.taskId = res.taskId;

    } else {
      form.value.taskId = params.taskId as string ?? undefined;
    }
    if (!form.value.taskId) {
      (() => {
        throw "taskId invalid"
      })();
    }
    form.value.variables = {
      entity: params.taskVariables
    };
  } catch (e) {
    console.error(e.toString())
    return false;
  }
}

/*------------------------------------------------------------------------------*/
// 页面周期
/*------------------------------------------------------------------------------*/

watch(() => props, () => init(), {deep: true});
watch(() => ctx.visible, () => emits('update:variables', ctx.visible));
onMounted(() => init());
defineExpose({startWorkFlow})
</script>
<style scoped lang="scss">

</style>
