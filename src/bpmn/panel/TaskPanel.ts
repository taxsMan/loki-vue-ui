import type { ModdleElement } from 'bpmn';
import { AllocationTypeEnum, MultiInstanceTypeEnum, SpecifyDescEnum } from '@/enums/bpmn/IndexEnums';

export interface PropType {
  element: ModdleElement;
}


export const formRules = ref<ElFormRules>({
  id: [{ required: true, message: '请输入', trigger: 'blur' }],
  name: [{ required: true, message: '请输入', trigger: 'blur' }]
});

export const initFormData = {
  id: '',
  name: '',
  dueDate: '',
  multiInstanceType: MultiInstanceTypeEnum.NONE,
  allocationType: AllocationTypeEnum.USER,
  specifyDesc: SpecifyDescEnum.SPECIFY_SINGLE
};


