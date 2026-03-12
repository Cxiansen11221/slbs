import http from "@/api/http";

export type UserSummary = {
  id: number;
  username: string;
  nickname: string;
  status: string;
  userType: string;
  lastLoginTime?: string;
};

export function fetchUsers() {
  return http.get<any, { data: UserSummary[] }>("/api/admin/users");
}

