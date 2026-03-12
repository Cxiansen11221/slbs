package com.company.wxplatform.modules.vehicle.repository;

import com.company.wxplatform.modules.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    Optional<Vehicle> findByVehicleCode(String vehicleCode);
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
    Optional<Vehicle> findByVin(String vin);
    Optional<Vehicle> findByLicensePlate(String licensePlate);

}
