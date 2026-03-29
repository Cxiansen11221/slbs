package com.company.wxplatform.modules.viewed.service.impl;

import com.company.wxplatform.modules.vehicle.entity.Vehicle;
import com.company.wxplatform.modules.vehicle.entity.VehicleStatus;
import com.company.wxplatform.modules.vehicle.repository.VehicleRepository;
import com.company.wxplatform.modules.vehicle.repository.VehicleStatusRepository;
import com.company.wxplatform.modules.viewed.entity.UserViewed;
import com.company.wxplatform.modules.viewed.repository.UserViewedRepository;
import com.company.wxplatform.modules.viewed.service.ViewedService;
import com.company.wxplatform.modules.viewed.vo.ViewedItemVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ViewedServiceImpl implements ViewedService {

    private final UserViewedRepository userViewedRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleStatusRepository vehicleStatusRepository;

    public ViewedServiceImpl(
            UserViewedRepository userViewedRepository,
            VehicleRepository vehicleRepository,
            VehicleStatusRepository vehicleStatusRepository
    ) {
        this.userViewedRepository = userViewedRepository;
        this.vehicleRepository = vehicleRepository;
        this.vehicleStatusRepository = vehicleStatusRepository;
    }

    @Override
    @Transactional
    public void save(Long userId, Long vehicleId) {
        Optional<UserViewed> opt = userViewedRepository.findByUserIdAndVehicleId(userId, vehicleId);
        UserViewed entity = opt.orElseGet(UserViewed::new);
        entity.setUserId(userId);
        entity.setVehicleId(vehicleId);
        entity.setViewedAt(new Date());
        userViewedRepository.save(entity);
    }

    @Override
    public List<ViewedItemVO> findAll(Long userId) {
        List<UserViewed> list = userViewedRepository.findByUserIdOrderByViewedAtDesc(userId);
        List<ViewedItemVO> result = new ArrayList<>();
        for (UserViewed item : list) {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findById(item.getVehicleId());
            if (vehicleOpt.isEmpty()) {
                continue;
            }
            Vehicle vehicle = vehicleOpt.get();
            VehicleStatus status = vehicleStatusRepository.findByVehicleId(vehicle.getVehicleId()).orElse(null);
            Double hourPrice = vehicle.getHourlyPrice() != null ? vehicle.getHourlyPrice() : resolveHourlyPrice(vehicle.getVehicleType());
            Double monthPrice = hourPrice * 24 * 30;
            String region = status == null ? "附近网点" : safe(status.getCurrentLocation());
            String address = status == null ? "地址待补充" : safe(status.getCurrentLocation());
            String distance = vehicle.getRangeMileage() == null ? "--" : String.valueOf(vehicle.getRangeMileage());
            result.add(new ViewedItemVO(
                    vehicle.getVehicleId(),
                    buildVehicleName(vehicle),
                    safe(vehicle.getFrontImageUrl()),
                    mapVehicleType(vehicle.getVehicleType()),
                    hourPrice,
                    monthPrice,
                    region,
                    address,
                    distance,
                    item.getViewedAt() == null ? System.currentTimeMillis() : item.getViewedAt().getTime()
            ));
        }
        return result;
    }

    @Override
    public long count(Long userId) {
        return userViewedRepository.countByUserId(userId);
    }

    private String buildVehicleName(Vehicle vehicle) {
        String brand = vehicle.getBrand() == null ? "EV" : vehicle.getBrand();
        String model = vehicle.getModel() == null ? "" : vehicle.getModel();
        return (brand + " " + model).trim();
    }

    private String mapVehicleType(Integer vehicleType) {
        if (vehicleType == null) return "标准型";
        return switch (vehicleType) {
            case 1 -> "标准型";
            case 2 -> "轻享型";
            case 3 -> "长续航";
            default -> "标准型";
        };
    }

    private Double resolveHourlyPrice(Integer vehicleType) {
        if (vehicleType == null) return 8.0;
        return switch (vehicleType) {
            case 1 -> 8.0;
            case 2 -> 10.0;
            case 3 -> 12.0;
            default -> 9.0;
        };
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }
}
