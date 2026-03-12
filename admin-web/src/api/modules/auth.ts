import http from "@/api/http";

export type AdminLoginResponse = {
  token: string;
  expiresIn: number;
  role: string;
  username: string;
};

export function login(username: string, password: string) {
  console.log('Login request:', { username, password });
  return http.post<{ success: boolean; message: string; data: AdminLoginResponse }>('/api/admin/auth/login', {
    username,
    password
  });
}

