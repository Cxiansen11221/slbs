import http from "@/api/http";

export type MaintenanceRecord = {
  maintenanceId: number;
  vehicleId: number;
  reporterId?: number;
  reportTime?: string;
  faultType?: number;
  faultDescription?: string;
  maintenanceStatus?: number;
  maintenanceNote?: string;
  maintenanceCost?: number;
  maintenanceStartTime?: string;
  maintenanceEndTime?: string;
};

export function fetchMaintenanceList(params: { page: number; size: number }) {
  return http.get<any, { data: MaintenanceRecord[] }>("/api/vehicle/maintenance/list", {
    params
  });
}

export function updateMaintenance(id: number, payload: Partial<MaintenanceRecord>) {
  return http.put<any, { data: MaintenanceRecord }>(`/api/vehicle/maintenance/${id}`, payload);
}
