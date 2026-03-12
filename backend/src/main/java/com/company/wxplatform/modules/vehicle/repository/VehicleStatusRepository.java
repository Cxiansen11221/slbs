package com.company.wxplatform.modules.vehicle.repository;

import com.company.wxplatform.modules.vehicle.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleStatusRepository extends JpaRepository<VehicleStatus, Long> {

    Optional<VehicleStatus> findByVehicleId(Long vehicleId);

}
