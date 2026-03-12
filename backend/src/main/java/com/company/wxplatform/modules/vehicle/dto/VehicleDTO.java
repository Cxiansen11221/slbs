package com.company.wxplatform.modules.vehicle.dto;

import com.company.wxplatform.modules.vehicle.entity.Vehicle;
import com.company.wxplatform.modules.vehicle.entity.VehicleStatus;

public class VehicleDTO {
    private Long vehicleId;
    private String vehicleCode;
    private String vehicleNumber;
    private String vin;
    private String licensePlate;
    private String brand;
    private String model;
    private Integer vehicleType;
    private Integer batteryType;
    private Double price;
    private Integer status;
    private Integer batteryLevel;

    public VehicleDTO(Vehicle vehicle, VehicleStatus status) {
        this.vehicleId = vehicle.getVehicleId();
        this.vehicleCode = vehicle.getVehicleCode();
        this.vehicleNumber = vehicle.getVehicleNumber();
        this.vin = vehicle.getVin();
        this.licensePlate = vehicle.getLicensePlate();
        this.brand = vehicle.getBrand();
        this.model = vehicle.getModel();
        this.vehicleType = vehicle.getVehicleType();
        this.batteryType = vehicle.getBatteryType();
        this.price = vehicle.getHourlyPrice() != null ? vehicle.getHourlyPrice() : resolveHourlyPrice(vehicle.getVehicleType());

        if (status != null) {
            this.status = status.getCurrentStatus();
            this.batteryLevel = status.getBatteryPercentage();
        } else {
            this.status = 1;
            this.batteryLevel = 100;
        }
    }

    private Double resolveHourlyPrice(Integer vehicleType) {
        if (vehicleType == null) {
            return 8.0;
        }
        return switch (vehicleType) {
            case 1 -> 8.0;
            case 2 -> 10.0;
            case 3 -> 12.0;
            default -> 9.0;
        };
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleCode() {
        return vehicleCode;
    }

    public void setVehicleCode(String vehicleCode) {
        this.vehicleCode = vehicleCode;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(Integer vehicleType) {
        this.vehicleType = vehicleType;
    }

    public Integer getBatteryType() {
        return batteryType;
    }

    public void setBatteryType(Integer batteryType) {
        this.batteryType = batteryType;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getBatteryLevel() {
        return batteryLevel;
    }

    public void setBatteryLevel(Integer batteryLevel) {
        this.batteryLevel = batteryLevel;
    }
}
