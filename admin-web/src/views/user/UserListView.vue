<template>
  <el-card>
    <template #header>
      <div class="header">
        <span>用户列表</span>
        <el-button type="primary" plain @click="loadUsers">刷新</el-button>
      </div>
    </template>
    <el-table :data="users" v-loading="loading" style="width: 100%">
      <el-table-column type="index" :label="'\u5e8f\u53f7'" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column label="用户类型" width="120">
        <template #default="scope">
          {{ getUserTypeText(scope.row.userType) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row)">{{ getStatusText(scope.row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="登录时间" width="200" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { fetchUsers, type UserSummary } from "@/api/modules/user";

const loading = ref(false);
const users = ref<UserSummary[]>([]);

// 将用户类型转换为中文
function getUserTypeText(userType: string): string {
  switch (userType) {
    case 'admin':
      return '管理员';
    case 'user':
      return '普通用户';
    default:
      return userType;
  }
}

// 将状态转换为中文
function getStatusText(row: UserSummary): string {
  const lastLogin = row.lastLoginTime ? new Date(row.lastLoginTime).getTime() : 0;
  const now = Date.now();
  if (lastLogin && now - lastLogin <= 5 * 60 * 1000) {
    return "\u5728\u7ebf";
  }
  return "\u79bb\u7ebf";
}

function getStatusType(row: UserSummary): "success" | "info" {
  const lastLogin = row.lastLoginTime ? new Date(row.lastLoginTime).getTime() : 0;
  const now = Date.now();
  if (lastLogin && now - lastLogin <= 5 * 60 * 1000) {
    return "success";
  }
  return "info";
}

async function loadUsers() {
  loading.value = true;
  try {
    const res = await fetchUsers();
    users.value = res.data;
  } catch (err: any) {
    ElMessage.error(err.message || "加载用户失败");
  } finally {
    loading.value = false;
  }
}

onMounted(loadUsers);
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

