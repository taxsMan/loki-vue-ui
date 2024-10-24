<template>
  <el-slider v-model="modeValueIns" :style="property.style" :max="property.max" @change="handleChange" />
</template>
<script setup lang="ts">
defineComponent({
  name: 'SliderPlus'
});

interface event {
  onChange?: Function;
}

const attrs = useAttrs() as event;
const props = withDefaults(defineProps<
  {
    modelValue: string | number,
    max: number,
    style: string,
  }
>(), {
  modelValue: 1,
  max: undefined,
  style: undefined
});
const emits = defineEmits(['update:modeValue']);

const property = reactive({
  style: props.style,
  max: props.max
});

const modeValueIns = ref(Number(props.modelValue));

watch(() => props.modelValue, value => {
  modeValueIns.value = Number(value);
});
watch(() => modeValueIns, value => {
  emits('update:modeValue', value);
});

const handleChange = (e: any) => {
  attrs?.onChange(e);
};


defineOptions({ inheritAttrs: false });
</script>

<style scoped lang="scss">

</style>
