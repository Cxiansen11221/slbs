<template>
  <el-card class="content-card">
    <template #header>
      <div class="header">
        <span>公告管理</span>
        <el-button type="primary" plain @click="refreshAll">刷新</el-button>
      </div>
    </template>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="公告" name="notices">
        <div class="toolbar">
          <el-button type="primary" @click="openNoticeDialog()">新增公告</el-button>
        </div>
        <el-table :data="notices" v-loading="noticeLoading" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="tag" label="标签" width="140" />
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="desc" label="内容" />
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button size="small" @click="openNoticeDialog(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="handleDeleteNotice(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="推荐专区" name="recommends">
        <div class="toolbar">
          <el-button type="primary" @click="openRecommendDialog()">新增推荐</el-button>
        </div>
        <el-table :data="recommends" v-loading="recommendLoading" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="desc" label="内容" />
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button size="small" @click="openRecommendDialog(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="handleDeleteRecommend(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>

  <el-dialog v-model="noticeDialogVisible" title="公告" width="520">
    <el-form :model="noticeForm" label-width="90px">
      <el-form-item label="标签">
        <el-input v-model="noticeForm.tag" placeholder="如：公告/活动/通知" />
      </el-form-item>
      <el-form-item label="标题">
        <el-input v-model="noticeForm.title" placeholder="请输入公告标题" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="noticeForm.desc" type="textarea" :rows="3" placeholder="请输入公告内容" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="noticeDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="noticeSaving" @click="saveNotice">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="recommendDialogVisible" title="推荐专区" width="520">
    <el-form :model="recommendForm" label-width="90px">
      <el-form-item label="标题">
        <el-input v-model="recommendForm.title" placeholder="请输入推荐标题" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="recommendForm.desc" type="textarea" :rows="3" placeholder="请输入推荐内容" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="recommendDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="recommendSaving" @click="saveRecommend">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  fetchNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  fetchRecommends,
  createRecommend,
  updateRecommend,
  deleteRecommend,
  type NoticeItem,
  type RecommendItem
} from "@/api/modules/homeContent";

const activeTab = ref<"notices" | "recommends">("notices");

const notices = ref<NoticeItem[]>([]);
const recommends = ref<RecommendItem[]>([]);
const noticeLoading = ref(false);
const recommendLoading = ref(false);

const noticeDialogVisible = ref(false);
const recommendDialogVisible = ref(false);
const noticeSaving = ref(false);
const recommendSaving = ref(false);

const noticeForm = ref<NoticeItem>({
  id: undefined,
  tag: "",
  title: "",
  desc: ""
});

const recommendForm = ref<RecommendItem>({
  id: undefined,
  title: "",
  desc: ""
});

function resetNoticeForm(item?: NoticeItem) {
  noticeForm.value = {
    id: item?.id,
    tag: item?.tag || "",
    title: item?.title || "",
    desc: item?.desc || ""
  };
}

function resetRecommendForm(item?: RecommendItem) {
  recommendForm.value = {
    id: item?.id,
    title: item?.title || "",
    desc: item?.desc || ""
  };
}

function openNoticeDialog(item?: NoticeItem) {
  resetNoticeForm(item);
  noticeDialogVisible.value = true;
}

function openRecommendDialog(item?: RecommendItem) {
  resetRecommendForm(item);
  recommendDialogVisible.value = true;
}

async function loadNotices() {
  noticeLoading.value = true;
  try {
    const res = await fetchNotices();
    notices.value = res.data || [];
  } catch (err: any) {
    ElMessage.error(err.message || "加载公告失败");
  } finally {
    noticeLoading.value = false;
  }
}

async function loadRecommends() {
  recommendLoading.value = true;
  try {
    const res = await fetchRecommends();
    recommends.value = res.data || [];
  } catch (err: any) {
    ElMessage.error(err.message || "加载推荐失败");
  } finally {
    recommendLoading.value = false;
  }
}

async function saveNotice() {
  if (!noticeForm.value.title || !noticeForm.value.desc) {
    ElMessage.warning("请填写标题和内容");
    return;
  }
  noticeSaving.value = true;
  try {
    if (noticeForm.value.id) {
      await updateNotice(noticeForm.value.id, noticeForm.value);
    } else {
      await createNotice(noticeForm.value);
    }
    ElMessage.success("保存成功");
    noticeDialogVisible.value = false;
    await loadNotices();
  } catch (err: any) {
    ElMessage.error(err.message || "保存失败");
  } finally {
    noticeSaving.value = false;
  }
}

async function saveRecommend() {
  if (!recommendForm.value.title || !recommendForm.value.desc) {
    ElMessage.warning("请填写标题和内容");
    return;
  }
  recommendSaving.value = true;
  try {
    if (recommendForm.value.id) {
      await updateRecommend(recommendForm.value.id, recommendForm.value);
    } else {
      await createRecommend(recommendForm.value);
    }
    ElMessage.success("保存成功");
    recommendDialogVisible.value = false;
    await loadRecommends();
  } catch (err: any) {
    ElMessage.error(err.message || "保存失败");
  } finally {
    recommendSaving.value = false;
  }
}

function handleDeleteNotice(item: NoticeItem) {
  if (!item.id) return;
  ElMessageBox.confirm("确认删除该公告吗？", "提示", { type: "warning" })
    .then(async () => {
      await deleteNotice(item.id as number);
      ElMessage.success("已删除");
      loadNotices();
    })
    .catch(() => {});
}

function handleDeleteRecommend(item: RecommendItem) {
  if (!item.id) return;
  ElMessageBox.confirm("确认删除该推荐吗？", "提示", { type: "warning" })
    .then(async () => {
      await deleteRecommend(item.id as number);
      ElMessage.success("已删除");
      loadRecommends();
    })
    .catch(() => {});
}

function refreshAll() {
  loadNotices();
  loadRecommends();
}

onMounted(() => {
  refreshAll();
});
</script>

<style scoped>
.content-card :deep(.el-card__body) {
  padding-top: 10px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar {
  margin-bottom: 12px;
}
</style>
