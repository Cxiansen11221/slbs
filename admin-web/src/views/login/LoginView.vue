<template>
  <div class="page">
    <el-card class="card">
      <template #header>
        <div class="title">管理员登录</div>
      </template>
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-position="top"
        @keyup.enter="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名" 
            prefix-icon="User"
            :disabled="loading"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock" 
            show-password
            :disabled="loading"
          />
        </el-form-item>
        <el-button 
          type="primary" 
          :loading="loading" 
          @click="handleSubmit" 
          style="width: 100%"
        >
          登录
        </el-button>
      </el-form>
      <div class="hint">
        <p class="version">系统版本：1.0.0</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { login } from "@/api/modules/auth";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({
  username: "admin",
  password: "123456"
});

const rules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名长度在 3-20 之间", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少 6 位", trigger: "blur" }
  ]
};

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      const res = await login(form.username, form.password);
      console.log('Login response:', res);
      authStore.setLogin(res.data);
      ElMessage.success("登录成功");
      router.push({ name: "dashboard" });
    } catch (err: any) {
      // 错误处理已在 http 拦截器中处理
    } finally {
      loading.value = false;
    }
  });
}

onMounted(() => {
  // 检查是否已登录
  if (authStore.token) {
    router.push({ name: "dashboard" });
  }
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  width: min(90vw, 420px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #333;
}

.hint {
  margin: 16px 0 0;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.version {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.7;
}

:deep(.el-card__header) {
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-button--primary) {
  margin-top: 8px;
}
</style>

