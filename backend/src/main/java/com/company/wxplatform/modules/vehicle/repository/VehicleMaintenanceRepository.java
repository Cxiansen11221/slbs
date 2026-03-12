package com.company.wxplatform.modules.vehicle.repository;

import com.company.wxplatform.modules.vehicle.entity.VehicleMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleMaintenanceRepository extends JpaRepository<VehicleMaintenance, Long> {

    List<VehicleMaintenance> findByVehicleId(Long vehicleId);

}
