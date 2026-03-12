package com.company.wxplatform.modules.vehicle.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "vehicle")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "vehicle_code", unique = true, nullable = false)
    private String vehicleCode;

    @Column(name = "vehicle_number", unique = true, nullable = false)
    private String vehicleNumber;

    @Column(name = "vin", unique = true, nullable = false)
    private String vin;

    @Column(name = "license_plate", unique = true)
    private String licensePlate;

    @Column(name = "brand", nullable = false)
    private String brand;

    @Column(name = "model", nullable = false)
    private String model;

    @Column(name = "vehicle_type", nullable = false)
    private Integer vehicleType; // 1-两轮，2-三轮，3-四轮

    @Column(name = "battery_type", nullable = false)
    private Integer batteryType; // 1-铅酸，2-锂电

    @Column(name = "battery_capacity")
    private Double batteryCapacity; // Ah

    @Column(name = "range_mileage")
    private Double rangeMileage; // km

    @Column(name = "hourly_price")
    private Double hourlyPrice; // 元/小时

    @Column(name = "max_speed")
    private Double maxSpeed; // km/h

    @Column(name = "seat_count")
    private Integer seatCount;

    @Column(name = "weight")
    private Double weight; // kg

    @Column(name = "purchase_time")
    private Date purchaseTime;

    @Column(name = "purchase_price")
    private Double purchasePrice;

    @Column(name = "store_id")
    private Long storeId;

    @Column(name = "launch_time")
    private Date launchTime;

    @Column(name = "front_image_url")
    private String frontImageUrl;

    @Column(name = "side_image_url")
    private String sideImageUrl;

    @Column(name = "interior_image_url")
    private String interiorImageUrl;

    @Column(name = "tags")
    private String tags;

    @Column(name = "status", columnDefinition = "int default 1")
    private Integer status;

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

    public Double getBatteryCapacity() {
        return batteryCapacity;
    }

    public void setBatteryCapacity(Double batteryCapacity) {
        this.batteryCapacity = batteryCapacity;
    }

    public Double getRangeMileage() {
        return rangeMileage;
    }

    public void setRangeMileage(Double rangeMileage) {
        this.rangeMileage = rangeMileage;
    }

    public Double getHourlyPrice() {
        return hourlyPrice;
    }

    public void setHourlyPrice(Double hourlyPrice) {
        this.hourlyPrice = hourlyPrice;
    }

    public Double getMaxSpeed() {
        return maxSpeed;
    }

    public void setMaxSpeed(Double maxSpeed) {
        this.maxSpeed = maxSpeed;
    }

    public Integer getSeatCount() {
        return seatCount;
    }

    public void setSeatCount(Integer seatCount) {
        this.seatCount = seatCount;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Date getPurchaseTime() {
        return purchaseTime;
    }

    public void setPurchaseTime(Date purchaseTime) {
        this.purchaseTime = purchaseTime;
    }

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Date getLaunchTime() {
        return launchTime;
    }

    public void setLaunchTime(Date launchTime) {
        this.launchTime = launchTime;
    }

    public String getFrontImageUrl() {
        return frontImageUrl;
    }

    public void setFrontImageUrl(String frontImageUrl) {
        this.frontImageUrl = frontImageUrl;
    }

    public String getSideImageUrl() {
        return sideImageUrl;
    }

    public void setSideImageUrl(String sideImageUrl) {
        this.sideImageUrl = sideImageUrl;
    }

    public String getInteriorImageUrl() {
        return interiorImageUrl;
    }

    public void setInteriorImageUrl(String interiorImageUrl) {
        this.interiorImageUrl = interiorImageUrl;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
