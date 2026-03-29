package com.company.wxplatform.modules.vehicle.service.impl;

import com.company.wxplatform.modules.vehicle.dto.VehicleDTO;
import com.company.wxplatform.modules.vehicle.entity.Vehicle;
import com.company.wxplatform.modules.vehicle.entity.VehicleMaintenance;
import com.company.wxplatform.modules.vehicle.entity.VehicleStatus;
import com.company.wxplatform.modules.vehicle.repository.VehicleMaintenanceRepository;
import com.company.wxplatform.modules.vehicle.repository.VehicleRepository;
import com.company.wxplatform.modules.vehicle.repository.VehicleStatusRepository;
import com.company.wxplatform.modules.vehicle.service.VehicleService;
import com.company.wxplatform.modules.message.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VehicleServiceImpl implements VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleStatusRepository vehicleStatusRepository;

    @Autowired
    private VehicleMaintenanceRepository vehicleMaintenanceRepository;

    @Autowired
    private MessageService messageService;

    @Override
    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicle == null) {
            throw new RuntimeException("Vehicle object cannot be null");
        }
        if (vehicle.getVehicleNumber() == null || vehicle.getVehicleNumber().isBlank()) {
            throw new RuntimeException("Vehicle number cannot be empty");
        }
        if (vehicle.getVin() == null || vehicle.getVin().isBlank()) {
            throw new RuntimeException("VIN cannot be empty");
        }

        if (vehicleRepository.findByVehicleNumber(vehicle.getVehicleNumber()).isPresent()) {
            throw new RuntimeException("Vehicle number already exists");
        }
        if (vehicleRepository.findByVin(vehicle.getVin()).isPresent()) {
            throw new RuntimeException("VIN already exists");
        }

        if (vehicle.getStatus() == null) {
            vehicle.setStatus(1);
        }
        if (vehicle.getHourlyPrice() == null || vehicle.getHourlyPrice() <= 0) {
            vehicle.setHourlyPrice(resolveHourlyPrice(vehicle.getVehicleType()));
        }

        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        VehicleStatus status = new VehicleStatus();
        status.setVehicleId(savedVehicle.getVehicleId());
        status.setCurrentStatus(1);
        status.setBatteryPercentage(100);
        status.setTotalRentalCount(0);
        status.setTotalMileage(0.0);
        status.setLastStatusUpdateTime(new Date());
        vehicleStatusRepository.save(status);

        return savedVehicle;
    }

    @Override
    public Vehicle updateVehicle(Vehicle vehicle) {
        if (vehicle == null || vehicle.getVehicleId() == null) {
            throw new RuntimeException("Vehicle and vehicle ID cannot be null");
        }
        Vehicle existing = vehicleRepository.findById(vehicle.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        if (vehicle.getHourlyPrice() == null || vehicle.getHourlyPrice() <= 0) {
            vehicle.setHourlyPrice(existing.getHourlyPrice() != null ? existing.getHourlyPrice() : resolveHourlyPrice(vehicle.getVehicleType()));
        }
        Vehicle saved = vehicleRepository.save(vehicle);
        if (vehicle.getStatus() != null) {
            vehicleStatusRepository.findByVehicleId(saved.getVehicleId()).ifPresent(status -> {
                status.setCurrentStatus(vehicle.getStatus());
                updateVehicleStatus(status);
            });
        }
        return saved;
    }

    @Override
    public void deleteVehicle(Long vehicleId) {
        vehicleRepository.deleteById(vehicleId);
    }

    @Override
    public Optional<Vehicle> getVehicleById(Long vehicleId) {
        return vehicleRepository.findById(vehicleId);
    }

    @Override
    public Optional<VehicleDTO> getVehicleDTOById(Long vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .map(vehicle -> new VehicleDTO(
                        vehicle,
                        vehicleStatusRepository.findByVehicleId(vehicle.getVehicleId()).orElse(null)
                ));
    }

    @Override
    public List<Vehicle> getVehicleList(int page, int size) {
        return vehicleRepository.findAll(PageRequest.of(page - 1, size)).getContent();
    }

    @Override
    public List<VehicleDTO> getVehicleDTOList(int page, int size, String vehicleNumber, String brand, Integer status) {
        org.springframework.data.jpa.domain.Specification<Vehicle> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (vehicleNumber != null && !vehicleNumber.isBlank()) {
                predicates.add(cb.like(root.get("vehicleNumber"), "%" + vehicleNumber + "%"));
            }
            if (brand != null && !brand.isBlank()) {
                predicates.add(cb.like(root.get("brand"), "%" + brand + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        List<Vehicle> vehicles = vehicleRepository.findAll(spec, PageRequest.of(page - 1, size)).getContent();
        return vehicles.stream()
                .map(v -> new VehicleDTO(v, vehicleStatusRepository.findByVehicleId(v.getVehicleId()).orElse(null)))
                .collect(Collectors.toList());
    }

    @Override
    public int getVehicleCount() {
        return (int) vehicleRepository.count();
    }

    @Override
    public VehicleStatus getVehicleStatus(Long vehicleId) {
        return vehicleStatusRepository.findByVehicleId(vehicleId).orElse(null);
    }

    @Override
    public VehicleStatus updateVehicleStatus(VehicleStatus status) {
        if (status == null) {
            return null;
        }
        status.setLastStatusUpdateTime(new Date());
        return vehicleStatusRepository.save(status);
    }

    @Override
    public VehicleMaintenance createMaintenanceRecord(VehicleMaintenance maintenance) {
        if (maintenance.getReportTime() == null) {
            maintenance.setReportTime(new Date());
        }
        if (maintenance.getMaintenanceStatus() == null) {
            maintenance.setMaintenanceStatus(1);
        }
        VehicleMaintenance saved = vehicleMaintenanceRepository.save(maintenance);
        Long reporterId = saved.getReporterId();
        if (reporterId != null) {
            String title = "报修已提交";
            String content = "我们已收到您的车辆报修，工单编号：" + saved.getMaintenanceId() + "。";
            messageService.createUserMessage(reporterId, title, content);
        }
        return saved;
    }

    @Override
    public VehicleMaintenance updateMaintenanceRecord(VehicleMaintenance maintenance) {
        Integer prevStatus = null;
        Long reporterId = null;
        Long maintenanceId = maintenance == null ? null : maintenance.getMaintenanceId();
        if (maintenanceId != null) {
            VehicleMaintenance existing = vehicleMaintenanceRepository.findById(maintenanceId).orElse(null);
            if (existing != null) {
                prevStatus = existing.getMaintenanceStatus();
                reporterId = existing.getReporterId();
            }
        }

        VehicleMaintenance saved = vehicleMaintenanceRepository.save(maintenance);
        Integer nextStatus = saved.getMaintenanceStatus();
        if (reporterId != null && nextStatus != null && (prevStatus == null || !nextStatus.equals(prevStatus))) {
            String title = "报修进度更新";
            String statusText = switch (nextStatus) {
                case 1 -> "待维修";
                case 2 -> "维修中";
                case 3 -> "已完成";
                default -> "处理中";
            };
            String content = "您的报修工单状态已更新为：" + statusText + "。工单编号：" + saved.getMaintenanceId() + "。";
            messageService.createUserMessage(reporterId, title, content);
        }
        return saved;
    }

    @Override
    public List<VehicleMaintenance> getMaintenanceRecordsByVehicleId(Long vehicleId) {
        return vehicleMaintenanceRepository.findByVehicleId(vehicleId);
    }

    @Override
    public List<VehicleMaintenance> getMaintenanceRecords(int page, int size) {
        return vehicleMaintenanceRepository.findAll(PageRequest.of(page - 1, size)).getContent();
    }

    private double resolveHourlyPrice(Integer vehicleType) {
        if (vehicleType == null) return 8.0;
        return switch (vehicleType) {
            case 1 -> 8.0;
            case 2 -> 10.0;
            case 3 -> 12.0;
            default -> 9.0;
        };
    }
}
