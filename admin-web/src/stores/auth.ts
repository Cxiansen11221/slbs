import { defineStore } from "pinia";

type LoginPayload = {
  token: string;
  username: string;
  role: string;
};

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || "",
    username: localStorage.getItem(USER_KEY) || "",
    role: "ADMIN"
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token)
  },
  actions: {
    setLogin(payload: LoginPayload) {
      this.token = payload.token;
      this.username = payload.username;
      this.role = payload.role;
      localStorage.setItem(TOKEN_KEY, payload.token);
      localStorage.setItem(USER_KEY, payload.username);
    },
    logout() {
      this.token = "";
      this.username = "";
      this.role = "ADMIN";
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
});

