<template>
  <el-row :gutter="16">
    <el-col :xs="24" :sm="12" :lg="8">
      <el-card>
        <h3>总用户数</h3>
        <p class="value">{{ stats.totalUsers }}</p>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :lg="8">
      <el-card>
        <h3>日活跃用户</h3>
        <p class="value">{{ stats.dailyActiveUsers }}</p>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :lg="8">
      <el-card>
        <h3>今日新增</h3>
        <p class="value">{{ stats.todayNewUsers }}</p>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import http from '@/api/http';

interface Stats {
  totalUsers: number;
  dailyActiveUsers: number;
  todayNewUsers: number;
}

const stats = ref<Stats>({
  totalUsers: 0,
  dailyActiveUsers: 0,
  todayNewUsers: 0
});

const fetchStats = async () => {
  try {
    const response = await http.get('/api/dashboard/stats');
    if (response.success) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
h3 {
  margin: 0;
  color: #111827;
}

.value {
  margin: 12px 0 0;
  font-size: 28px;
  font-weight: 700;
  color: #2563eb;
}
</style>

