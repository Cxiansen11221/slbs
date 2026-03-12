package com.company.wxplatform.modules.collection.service.impl;

import com.company.wxplatform.modules.collection.entity.UserCollection;
import com.company.wxplatform.modules.collection.repository.UserCollectionRepository;
import com.company.wxplatform.modules.collection.service.CollectionService;
import com.company.wxplatform.modules.collection.vo.CollectionItemVO;
import com.company.wxplatform.modules.vehicle.entity.Vehicle;
import com.company.wxplatform.modules.vehicle.entity.VehicleStatus;
import com.company.wxplatform.modules.vehicle.repository.VehicleRepository;
import com.company.wxplatform.modules.vehicle.repository.VehicleStatusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class CollectionServiceImpl implements CollectionService {

    private final UserCollectionRepository userCollectionRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleStatusRepository vehicleStatusRepository;

    public CollectionServiceImpl(
            UserCollectionRepository userCollectionRepository,
            VehicleRepository vehicleRepository,
            VehicleStatusRepository vehicleStatusRepository
    ) {
        this.userCollectionRepository = userCollectionRepository;
        this.vehicleRepository = vehicleRepository;
        this.vehicleStatusRepository = vehicleStatusRepository;
    }

    @Override
    public List<CollectionItemVO> findAll(Long userId) {
        List<UserCollection> list = userCollectionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<CollectionItemVO> result = new ArrayList<>();
        for (UserCollection item : list) {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findById(item.getVehicleId());
            if (vehicleOpt.isEmpty()) {
                continue;
            }
            Vehicle vehicle = vehicleOpt.get();
            VehicleStatus status = vehicleStatusRepository.findByVehicleId(vehicle.getVehicleId()).orElse(null);
            result.add(new CollectionItemVO(
                    vehicle.getVehicleId(),
                    buildVehicleName(vehicle),
                    "¥--/小时",
                    mapVehicleType(vehicle.getVehicleType()),
                    vehicle.getBrand() == null ? "未知品牌" : vehicle.getBrand(),
                    mapStatus(status == null ? null : status.getCurrentStatus()),
                    status == null || status.getCurrentLocation() == null ? "地址待补充" : status.getCurrentLocation(),
                    vehicle.getFrontImageUrl() == null ? "" : vehicle.getFrontImageUrl()
            ));
        }
        return result;
    }

    @Override
    @Transactional
    public void save(Long userId, Long vehicleId) {
        if (userCollectionRepository.existsByUserIdAndVehicleId(userId, vehicleId)) {
            return;
        }
        UserCollection entity = new UserCollection();
        entity.setUserId(userId);
        entity.setVehicleId(vehicleId);
        entity.setCreatedAt(new Date());
        userCollectionRepository.save(entity);
    }

    @Override
    @Transactional
    public void delete(Long userId, Long vehicleId) {
        userCollectionRepository.deleteByUserIdAndVehicleId(userId, vehicleId);
    }

    @Override
    public long count(Long userId) {
        return userCollectionRepository.countByUserId(userId);
    }

    private String buildVehicleName(Vehicle vehicle) {
        String brand = vehicle.getBrand() == null ? "电动车" : vehicle.getBrand();
        String model = vehicle.getModel() == null ? "" : vehicle.getModel();
        return (brand + " " + model).trim();
    }

    private String mapVehicleType(Integer vehicleType) {
        if (vehicleType == null) {
            return "电动车";
        }
        return switch (vehicleType) {
            case 1 -> "标准型";
            case 2 -> "轻享型";
            case 3 -> "长续航";
            default -> "电动车";
        };
    }

    private String mapStatus(Integer status) {
        if (status == null) {
            return "未知状态";
        }
        return switch (status) {
            case 1 -> "可用";
            case 2 -> "已租";
            case 3 -> "维修中";
            case 4 -> "报废";
            case 5 -> "待清洗";
            default -> "未知状态";
        };
    }
}
