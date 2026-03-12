package com.company.wxplatform.modules.order.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "take_return_record")
public class TakeReturnRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    // 取车信息
    @Column(name = "taker_id")
    private Long takerId;

    @Column(name = "pickup_store_id")
    private Long pickupStoreId;

    @Column(name = "pickup_location")
    private String pickupLocation;

    @Column(name = "pickup_battery_level")
    private Integer pickupBatteryLevel;

    @Column(name = "pickup_vehicle_status")
    private String pickupVehicleStatus;

    @Column(name = "pickup_note")
    private String pickupNote;

    // 还车信息
    @Column(name = "returner_id")
    private Long returnerId;

    @Column(name = "return_store_id")
    private Long returnStoreId;

    @Column(name = "return_location")
    private String returnLocation;

    @Column(name = "return_battery_level")
    private Integer returnBatteryLevel;

    @Column(name = "return_vehicle_status")
    private String returnVehicleStatus;

    @Column(name = "return_inspector")
    private String returnInspector;

    @Column(name = "return_note")
    private String returnNote;

    public Long getRecordId() {
        return recordId;
    }

    public void setRecordId(Long recordId) {
        this.recordId = recordId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getTakerId() {
        return takerId;
    }

    public void setTakerId(Long takerId) {
        this.takerId = takerId;
    }

    public Long getPickupStoreId() {
        return pickupStoreId;
    }

    public void setPickupStoreId(Long pickupStoreId) {
        this.pickupStoreId = pickupStoreId;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public Integer getPickupBatteryLevel() {
        return pickupBatteryLevel;
    }

    public void setPickupBatteryLevel(Integer pickupBatteryLevel) {
        this.pickupBatteryLevel = pickupBatteryLevel;
    }

    public String getPickupVehicleStatus() {
        return pickupVehicleStatus;
    }

    public void setPickupVehicleStatus(String pickupVehicleStatus) {
        this.pickupVehicleStatus = pickupVehicleStatus;
    }

    public String getPickupNote() {
        return pickupNote;
    }

    public void setPickupNote(String pickupNote) {
        this.pickupNote = pickupNote;
    }

    public Long getReturnerId() {
        return returnerId;
    }

    public void setReturnerId(Long returnerId) {
        this.returnerId = returnerId;
    }

    public Long getReturnStoreId() {
        return returnStoreId;
    }

    public void setReturnStoreId(Long returnStoreId) {
        this.returnStoreId = returnStoreId;
    }

    public String getReturnLocation() {
        return returnLocation;
    }

    public void setReturnLocation(String returnLocation) {
        this.returnLocation = returnLocation;
    }

    public Integer getReturnBatteryLevel() {
        return returnBatteryLevel;
    }

    public void setReturnBatteryLevel(Integer returnBatteryLevel) {
        this.returnBatteryLevel = returnBatteryLevel;
    }

    public String getReturnVehicleStatus() {
        return returnVehicleStatus;
    }

    public void setReturnVehicleStatus(String returnVehicleStatus) {
        this.returnVehicleStatus = returnVehicleStatus;
    }

    public String getReturnInspector() {
        return returnInspector;
    }

    public void setReturnInspector(String returnInspector) {
        this.returnInspector = returnInspector;
    }

    public String getReturnNote() {
        return returnNote;
    }

    public void setReturnNote(String returnNote) {
        this.returnNote = returnNote;
    }
}
