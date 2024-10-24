<template>

  <el-dialog v-model="ctx.variables" :title="title??'提交任务'" width="50%">
    <el-form :model="form">
      <el-form-item label="消息通知">
        <el-checkbox-group v-model="form.messageType">
          <el-checkbox v-for="it in ctx.messageType" :label="it.label" :value="it.value" :disabled="it.disable" />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="抄送">

      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="buttonDisabled" type="primary" @click="handleCompleteTask"> 提交</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
interface ITaskParameters{
  businessKey:string;
}
interface iProps {
  title?: string;
  variables?: boolean;
  taskParameters: ITaskParameters;

}

interface iForm {
  messageType: number | string;
}

/*------------------------------------------------------------------------------*/
// 参数定义
/*------------------------------------------------------------------------------*/
const props = defineProps<iProps>();
const emits = defineEmits(['update:variables']);
const ctx = reactive({
    variables: false,
    /// 消息类型
    messageType: [
      { value: 1, label: '站内信', disable: true },
      { value: 2, label: '邮件', disable: false },
      { value: 3, label: '短信', disable: false }
    ]
  })
;

const form = ref({ messageType: [1] });


/*------------------------------------------------------------------------------*/
// 处理逻辑
/*------------------------------------------------------------------------------*/
function init() {
  ctx.variables = props.variables;
}

async function handleCompleteTask() {

}

/*------------------------------------------------------------------------------*/
// 页面周期
/*------------------------------------------------------------------------------*/

watch(() => props, () => init(), { deep: true });
watch(() => ctx.variables, () => emits('update:variables', ctx.variables));
onMounted(() => init());
</script>
<style scoped lang="scss">

</style>
