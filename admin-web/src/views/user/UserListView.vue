<template>
  <el-card>
    <template #header>
      <div class="header">
        <span>用户列表</span>
        <el-button type="primary" plain @click="loadUsers">刷新</el-button>
      </div>
    </template>
    <el-table :data="users" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column label="用户类型" width="120">
        <template #default="scope">
          {{ getUserTypeText(scope.row.userType) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="scope">
          {{ getStatusText(scope.row.status) }}
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
function getStatusText(status: string): string {
  switch (status) {
    case 'active':
      return '活跃';
    case 'inactive':
      return '非活跃';
    default:
      return status;
  }
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

