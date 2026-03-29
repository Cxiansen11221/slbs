import http from "@/api/http";

export type NoticeItem = {
  id?: number;
  tag: string;
  title: string;
  desc: string;
};

export type RecommendItem = {
  id?: number;
  title: string;
  desc: string;
};

export function fetchNotices() {
  return http.get<any, { data: NoticeItem[] }>("/api/vehicle/home-content/notices");
}

export function createNotice(payload: NoticeItem) {
  return http.post<any, { data: NoticeItem }>("/api/vehicle/home-content/notices", payload);
}

export function updateNotice(id: number, payload: NoticeItem) {
  return http.put<any, { data: NoticeItem }>(`/api/vehicle/home-content/notices/${id}`, payload);
}

export function deleteNotice(id: number) {
  return http.delete<any, { data: void }>(`/api/vehicle/home-content/notices/${id}`);
}

export function fetchRecommends() {
  return http.get<any, { data: RecommendItem[] }>("/api/vehicle/home-content/recommends");
}

export function createRecommend(payload: RecommendItem) {
  return http.post<any, { data: RecommendItem }>("/api/vehicle/home-content/recommends", payload);
}

export function updateRecommend(id: number, payload: RecommendItem) {
  return http.put<any, { data: RecommendItem }>(`/api/vehicle/home-content/recommends/${id}`, payload);
}

export function deleteRecommend(id: number) {
  return http.delete<any, { data: void }>(`/api/vehicle/home-content/recommends/${id}`);
}
