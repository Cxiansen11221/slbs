import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/LoginView.vue"),
    meta: { public: true }
  },
  {
    path: "/",
    component: () => import("@/layouts/AdminLayout.vue"),
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("@/views/dashboard/DashboardView.vue")
      },
      {
        path: "users",
        name: "users",
        component: () => import("@/views/user/UserListView.vue")
      },
      {
        path: "vehicles",
        name: "vehicles",
        component: () => import("@/views/vehicle/VehicleListView.vue")
      },
      {
        path: "orders",
        name: "orders",
        component: () => import("@/views/order/OrderListView.vue")
      },
      {
        path: "deposits",
        name: "deposits",
        component: () => import("@/views/deposit/DepositListView.vue")
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.public) {
    return true;
  }
  if (!authStore.isLoggedIn) {
    return { name: "login" };
  }
  return true;
});

export default router;

