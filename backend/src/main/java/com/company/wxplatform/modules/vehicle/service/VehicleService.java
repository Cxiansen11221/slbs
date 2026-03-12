package com.company.wxplatform.modules.vehicle.service;

import com.company.wxplatform.modules.vehicle.entity.Vehicle;
import com.company.wxplatform.modules.vehicle.entity.VehicleMaintenance;
import com.company.wxplatform.modules.vehicle.entity.VehicleStatus;
import com.company.wxplatform.modules.vehicle.dto.VehicleDTO;

import java.util.List;
import java.util.Optional;

public interface VehicleService {

    // 车辆基础信息管理
    Vehicle createVehicle(Vehicle vehicle);
    Vehicle updateVehicle(Vehicle vehicle);
    void deleteVehicle(Long vehicleId);
    Optional<Vehicle> getVehicleById(Long vehicleId);
    List<Vehicle> getVehicleList(int page, int size);
    List<VehicleDTO> getVehicleDTOList(int page, int size, String vehicleNumber, String brand, Integer status);
    int getVehicleCount();

    // 车辆状态管理
    VehicleStatus getVehicleStatus(Long vehicleId);
    VehicleStatus updateVehicleStatus(VehicleStatus status);

    // 车辆维修管理
    VehicleMaintenance createMaintenanceRecord(VehicleMaintenance maintenance);
    VehicleMaintenance updateMaintenanceRecord(VehicleMaintenance maintenance);
    List<VehicleMaintenance> getMaintenanceRecordsByVehicleId(Long vehicleId);
    List<VehicleMaintenance> getMaintenanceRecords(int page, int size);

}
