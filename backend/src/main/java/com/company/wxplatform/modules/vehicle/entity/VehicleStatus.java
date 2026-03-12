package com.company.wxplatform.modules.vehicle.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "vehicle_status")
public class VehicleStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "status_id")
    private Long statusId;

    @Column(name = "vehicle_id", unique = true, nullable = false)
    private Long vehicleId;

    @Column(name = "current_status", nullable = false)
    private Integer currentStatus; // 1-可租，2-已租，3-维修中，4-报废，5-待清洁

    @Column(name = "current_location")
    private String currentLocation;

    @Column(name = "store_id")
    private Long storeId;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "battery_percentage")
    private Integer batteryPercentage; // 电量百分比

    @Column(name = "last_status_update_time")
    private Date lastStatusUpdateTime;

    @Column(name = "total_rental_count")
    private Integer totalRentalCount;

    @Column(name = "total_mileage")
    private Double totalMileage; // 累计行驶里程

    @Column(name = "last_maintenance_time")
    private Date lastMaintenanceTime;

    @Column(name = "next_maintenance_mileage")
    private Double nextMaintenanceMileage;

    public Long getStatusId() {
        return statusId;
    }

    public void setStatusId(Long statusId) {
        this.statusId = statusId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Integer getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(Integer currentStatus) {
        this.currentStatus = currentStatus;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Integer getBatteryPercentage() {
        return batteryPercentage;
    }

    public void setBatteryPercentage(Integer batteryPercentage) {
        this.batteryPercentage = batteryPercentage;
    }

    public Date getLastStatusUpdateTime() {
        return lastStatusUpdateTime;
    }

    public void setLastStatusUpdateTime(Date lastStatusUpdateTime) {
        this.lastStatusUpdateTime = lastStatusUpdateTime;
    }

    public Integer getTotalRentalCount() {
        return totalRentalCount;
    }

    public void setTotalRentalCount(Integer totalRentalCount) {
        this.totalRentalCount = totalRentalCount;
    }

    public Double getTotalMileage() {
        return totalMileage;
    }

    public void setTotalMileage(Double totalMileage) {
        this.totalMileage = totalMileage;
    }

    public Date getLastMaintenanceTime() {
        return lastMaintenanceTime;
    }

    public void setLastMaintenanceTime(Date lastMaintenanceTime) {
        this.lastMaintenanceTime = lastMaintenanceTime;
    }

    public Double getNextMaintenanceMileage() {
        return nextMaintenanceMileage;
    }

    public void setNextMaintenanceMileage(Double nextMaintenanceMileage) {
        this.nextMaintenanceMileage = nextMaintenanceMileage;
    }
}
