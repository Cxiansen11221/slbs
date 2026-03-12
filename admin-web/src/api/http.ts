import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";

console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 10000
});

function isSilent(config: any): boolean {
  return Boolean(config && (config.silent === true || config.__silent === true));
}

http.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => {
    const body = response.data;
    console.log("Response body:", body);
    if (body?.success === false) {
      const errorMessage = body.message || "请求失败";
      if (!isSilent(response.config)) {
        ElMessage.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }
    return body;
  },
  (error) => {
    let errorMessage = "网络错误";
    console.error("HTTP Error:", error);
    console.error("Error config:", error?.config);

    if (error?.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      switch (error.response.status) {
        case 401:
          errorMessage = "未授权，请重新登录";
          useAuthStore().logout();
          break;
        case 403:
          errorMessage = "访问被拒绝";
          break;
        case 404:
          errorMessage = "资源不存在";
          break;
        case 500:
          errorMessage = "服务器内部错误";
          break;
        default:
          errorMessage = error.response.data?.message || `请求失败，状态码：${error.response.status}`;
      }
    } else if (error?.request) {
      console.error("No response received:", error.request);
      errorMessage = "服务器无响应，请检查后端服务是否运行";
    } else if (error?.message) {
      errorMessage = error.message;
    }

    if (!isSilent(error?.config)) {
      ElMessage.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

export default http;
