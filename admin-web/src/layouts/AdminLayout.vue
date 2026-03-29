<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">易租车管理端</div>
      <nav>
        <RouterLink to="/">仪表盘</RouterLink>
        <RouterLink to="/users">用户管理</RouterLink>
        <RouterLink to="/vehicles">车辆管理</RouterLink>
        <RouterLink to="/orders">订单管理</RouterLink>
        <RouterLink to="/deposits">押金管理</RouterLink>
              <RouterLink to="/content">{{ "公告管理" }}</RouterLink>
              <RouterLink to="/maintenance">{{ "\u7ef4\u4fee\u7ba1\u7406" }}</RouterLink>
      </nav>
    </aside>
    <main class="main">
      <header class="header">
        <span>{{ authStore.username || "访客" }}</span>
        <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
      </header>
      <section class="content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push({ name: "login" });
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: #f7fbff;
  color: var(--text-strong);
  padding: 24px 16px;
  border-right: 1px solid #e1eef7;
}

.brand {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2c3a4f;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

a {
  color: #4c5d73;
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background-color 0.12s ease, color 0.12s ease, transform 0.12s ease;
}

a.router-link-active {
  color: #2d4a5b;
  background: #e8f2fa;
  font-weight: 600;
}

.main {
  display: grid;
  grid-template-rows: 64px 1fr;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #e1eef7;
  background: #f9fbff;
  color: #2c3a4f;
}

.content {
  padding: 20px;
  background: #f5faff;
}
</style>
