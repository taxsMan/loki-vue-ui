<template>
  <el-select
    v-if="ctx.visible"
    v-model="vModel"
    v-loading="ctx.loading"
    @change="handleChange"
    :style="style??``"
    :clearable="clearable??true">
    <template v-if="vOption && vOption.length>0">
      <el-option v-for="it in vOption" :key="it[value]??null" :label="it[label]??null" :value="String(it[value])">
        <span style="float: left">{{ it[label] }}</span>
        <span
          v-if="describe"
          style="
          float: right;
          color: var(--el-text-color-secondary);
          font-size: 13px;
        "
        >
        {{ it[describe] }}
      </span>
      </el-option>

    </template>
  </el-select>
</template>
<script setup lang="ts">

interface event {
  onChange?: Function;
}

const attrs = useAttrs() as event;
const ctx = reactive({
  loading: false,
  visible: true
});

interface props {
  modelValue?: string;
  options: Array<Object> | Function;
  label: string;
  value: string;
  clearable?: string | undefined;
  describe?: string;
  style?: any;
}

const props = defineProps<props>();
const emits = defineEmits(['update:modelValue']);
const vModel = ref();
const vOption = ref();

const init = () => {
  vModel.value = props.modelValue;
  if (typeof props.options === 'function') {
    if (props.options.constructor.name === 'AsyncFunction') {
      props.options().then(res => {
        vOption.value = res;
      });
    } else {
      vOption.value = props.options();
    }
  } else if (props.options instanceof Array) {
    vOption.value = props.options;
    ctx.loading = false;
  } else {
    ctx.loading = false;
  }
};

watch(() => vModel.value, (value) => emits('update:modelValue', value));

watch(() => props.options, () => init());


const handleChange = (e: any) => {
  typeof attrs.onChange === 'function' && attrs.onChange(e);
};

onMounted(() => init());

defineOptions({ inheritAttrs: false });
</script>


<style scoped lang="scss">

</style>
