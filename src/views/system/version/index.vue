<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="版本标题" prop="title">
              <el-input v-model="queryParams.title" placeholder="请输入版本标题" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:version:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:version:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:version:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:version:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="versionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="" align="center" prop="versionId" v-if="true" />
        <el-table-column label="版本标题" align="center" prop="title" />
        <el-table-column label="版本内容" align="center" prop="content" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:version:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:version:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改版本管理对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="versionFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="版本标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入版本标题" />
        </el-form-item>
        <el-form-item label="版本内容">
          <editor v-model="form.content" :min-height="192"/>
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

<script setup name="Version" lang="ts">
import { listVersion, getVersion, delVersion, addVersion, updateVersion } from '@/api/system/version';
import { VersionVO, VersionQuery, VersionForm } from '@/api/system/version/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const versionList = ref<VersionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const versionFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: VersionForm = {
  versionId: undefined,
  title: undefined,
  content: undefined,
}
const data = reactive<PageData<VersionForm, VersionQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    content: undefined,
    params: {
    }
  },
  rules: {
    versionId: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    title: [
      { required: true, message: "版本标题不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "版本内容不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询版本管理列表 */
const getList = async () => {
  loading.value = true;
  const res = await listVersion(queryParams.value);
  versionList.value = res.rows;
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
  versionFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: VersionVO[]) => {
  ids.value = selection.map(item => item.versionId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加版本管理";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: VersionVO) => {
  reset();
  const _versionId = row?.versionId || ids.value[0]
  const res = await getVersion(_versionId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改版本管理";
}

/** 提交按钮 */
const submitForm = () => {
  versionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.versionId) {
        await updateVersion(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addVersion(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: VersionVO) => {
  const _versionIds = row?.versionId || ids.value;
  await proxy?.$modal.confirm('是否确认删除版本管理编号为"' + _versionIds + '"的数据项？').finally(() => loading.value = false);
  await delVersion(_versionIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/version/export', {
    ...queryParams.value
  }, `version_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
