import showConfig from '../assets/showConfig';
import type { ModdleElement } from 'bpmn';
import useModelerStore from '@/store/modules/modeler';
import { MultiInstanceTypeEnum } from '@/enums/bpmn/IndexEnums';

interface Options {
  element: ModdleElement;
}


export interface TaskData {
  id: string; // 节点ID
  name: string; // 节点名称
  dueDate: string; // 日期？
  multiInstanceType: string; //  ?
  allocationType: string; //  ？
  specifyDesc: string;// ?
  $type: string; //节点类型
  extensionElements: {
    $type: string; // 扩展类型

  };// 扩展对象
  priority: number; // 优先级
  candidateUsers: string;//候选人
}

export default (ops: Options) => {
  const { element } = ops;
  const { getModeling, getModdle } = useModelerStore();
  const modeling = getModeling();
  const moddle = getModdle();

  /**
   * 当前节点类型
   */
  const elementType = computed(() => {
    const bizObj = element.businessObject;
    return bizObj.eventDefinitions ? bizObj.eventDefinitions[0].$type : bizObj.$type;
  });

  /**
   * 用于控制面板字段显示与隐藏的配置
   */
  const config = computed(() => showConfig[elementType.value] || {});

  /**
   * 创建一个节点
   * @param elementType 节点类型
   * @param properties 属性
   * @param parent 父节点
   */
  const createModdleElement = (elementType: string, properties: any, parent: ModdleElement) => {
    const element = moddle.create(elementType, properties);
    parent && (element.$parent = parent);
    return element;
  };

  /**
   * 获取扩展属性，如果不存在会自动创建
   */
  const getExtensionElements = (create = true) => {
    let extensionElements = element.businessObject.get<ModdleElement>('extensionElements');
    if (!extensionElements && create) {
      extensionElements = createModdleElement('bpmn:ExtensionElements', { values: [] }, element.businessObject);
      modeling.updateModdleProperties(element, element.businessObject, { extensionElements });
    }
    return extensionElements;
  };

  /**
   * 获取extensionElements下的properties
   * @param extensionElements 可选参数，默认获取当前Element下的extensionElements下的Properties
   */
  const getPropertiesElements = (extensionElements?: ModdleElement) => {
    if (!extensionElements) {
      extensionElements = getExtensionElements();
    }
    let propertiesElements = extensionElements.values.find((item) => item.$type === 'flowable:properties');
    if (!propertiesElements) {
      propertiesElements = createModdleElement('flowable:properties', { values: [] }, extensionElements);
      modeling.updateModdleProperties(element, extensionElements, {
        values: [...extensionElements.get<[]>('values'), propertiesElements]
      });
    }
    return propertiesElements;
  };

  /**
   * 更新节点属性
   * @param properties 属性值
   */
  const updateProperties = (properties: any) => {
    modeling.updateProperties(element, properties);
  };

  /**
   * 更新节点信息
   * @param updateElement 需要更新的节点
   * @param properties 属性
   */
  const updateModdleProperties = (updateElement, properties: any) => {
    modeling.updateModdleProperties(element, updateElement, properties);
  };

  /**
   * 更新Property属性
   * @param name key值
   * @param value 值
   */
  const updateProperty = (name: string, value: string) => {
    const propertiesElements = getPropertiesElements();

    let propertyElements = propertiesElements.values.find((item) => item.name === name);
    if (!propertyElements) {
      propertyElements = createModdleElement('flowable:property', { name: name, value: value }, propertiesElements);
      modeling.updateModdleProperties(element, propertiesElements, {
        values: [...propertiesElements.get('values'), propertyElements]
      });
    } else {
      propertyElements.name = name;
      propertyElements.value = value;
    }
    return propertyElements;
  };

  /**
   * 设置节点属性
   * @param value
   * @param key
   * @param prefix
   */
  const setProperty = (value: string, key: string, prefix: string = 'flowable') => {
    let property = {};
    property[(prefix ? `${prefix}:` : '') + key] = value && value.length > 0 ? value : undefined;
    updateProperties(property);
  };

  /**
   * 设置节点
   * @param nodeName
   * @param nodeValue
   */
  const setNode = (nodeName: string, nodeValue: any = undefined) => {
    let extensionElements = getExtensionElements();
    if (extensionElements.values) {
      extensionElements.values = extensionElements.values.filter((item: any) => item.$type !== `flowable:${nodeName}`);
    } else {
      extensionElements.values = [];
    }

    if (nodeValue) {
      const nodeElement = createModdleElement(`flowable:${nodeName}`, { body: '' }, extensionElements);
      if (extensionElements.values.push(nodeElement))
        nodeElement.body = JSON.stringify(nodeValue);
    } else {
      extensionElements = undefined;
    }
    updateProperties({ extensionElements: extensionElements });
  };


  const idChange = (newVal: string) => {
    if (newVal) {
      updateProperties({ id: newVal });
    }
  };
  const nameChange = (newVal: string) => {
    if (newVal) {
      updateProperties({ name: newVal });
    }
  };
  const formKeyChange = (newVal: string) => {
    updateProperties({ formKey: newVal });
  };
  const constant = {
    MultiInstanceType: [
      { id: '373d4b81-a0d1-4eb8-8685-0d2fb1b468e2', label: '无', value: MultiInstanceTypeEnum.NONE },
      { id: 'b5acea7c-b7e5-46b0-8778-390db091bdab', label: '串行', value: MultiInstanceTypeEnum.SERIAL },
      { id: 'b4f0c683-1ccc-43c4-8380-e1b998986caf', label: '并行', value: MultiInstanceTypeEnum.PARALLEL }
    ]
  };

  return {
    elementType,
    constant,
    showConfig: config,

    updateProperties,
    updateProperty,
    updateModdleProperties,

    createModdleElement,
    idChange,
    nameChange,
    formKeyChange,
    getExtensionElements,
    getPropertiesElements,


    setNode, /// 设置节点
    setProperty /// 设置节点属性

  };
};


