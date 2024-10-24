/**
 * 组件间双向绑定 方案
 */
export function definePropsPlus<TypeProps>(props?:TypeProps) {

  console.log(props);
  const { modelValue } = defineProps<{ modelValue?: any }>();
  const emits = defineEmits(['update:modelValue']);
  const model = ref(modelValue);
  watch(() => modelValue, (value) => model.value = value);
  watch(() => model.value, (value) => emits('update:modelValue', value));
}


