package com.company.wxplatform.modules.vehicle.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "vehicle_maintenance")
public class VehicleMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Long maintenanceId;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "reporter_id")
    private Long reporterId;

    @Column(name = "report_time")
    private Date reportTime;

    @Column(name = "fault_type")
    private Integer faultType; // 1: 电池故障, 2: 轮胎损坏, 3: 电机故障

    @Column(name = "fault_description")
    private String faultDescription;

    @Column(name = "maintenance_staff_id")
    private Long maintenanceStaffId;

    @Column(name = "maintenance_start_time")
    private Date maintenanceStartTime;

    @Column(name = "maintenance_end_time")
    private Date maintenanceEndTime;

    @Column(name = "maintenance_cost")
    private Double maintenanceCost;

    @Column(name = "replaced_parts")
    private String replacedParts;

    @Column(name = "maintenance_status")
    private Integer maintenanceStatus; // 1: 待维修, 2: 维修中, 3: 已完成

    @Column(name = "maintenance_note")
    private String maintenanceNote;

    public Long getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(Long maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }

    public Date getReportTime() {
        return reportTime;
    }

    public void setReportTime(Date reportTime) {
        this.reportTime = reportTime;
    }

    public Integer getFaultType() {
        return faultType;
    }

    public void setFaultType(Integer faultType) {
        this.faultType = faultType;
    }

    public String getFaultDescription() {
        return faultDescription;
    }

    public void setFaultDescription(String faultDescription) {
        this.faultDescription = faultDescription;
    }

    public Long getMaintenanceStaffId() {
        return maintenanceStaffId;
    }

    public void setMaintenanceStaffId(Long maintenanceStaffId) {
        this.maintenanceStaffId = maintenanceStaffId;
    }

    public Date getMaintenanceStartTime() {
        return maintenanceStartTime;
    }

    public void setMaintenanceStartTime(Date maintenanceStartTime) {
        this.maintenanceStartTime = maintenanceStartTime;
    }

    public Date getMaintenanceEndTime() {
        return maintenanceEndTime;
    }

    public void setMaintenanceEndTime(Date maintenanceEndTime) {
        this.maintenanceEndTime = maintenanceEndTime;
    }

    public Double getMaintenanceCost() {
        return maintenanceCost;
    }

    public void setMaintenanceCost(Double maintenanceCost) {
        this.maintenanceCost = maintenanceCost;
    }

    public String getReplacedParts() {
        return replacedParts;
    }

    public void setReplacedParts(String replacedParts) {
        this.replacedParts = replacedParts;
    }

    public Integer getMaintenanceStatus() {
        return maintenanceStatus;
    }

    public void setMaintenanceStatus(Integer maintenanceStatus) {
        this.maintenanceStatus = maintenanceStatus;
    }

    public String getMaintenanceNote() {
        return maintenanceNote;
    }

    public void setMaintenanceNote(String maintenanceNote) {
        this.maintenanceNote = maintenanceNote;
    }
}
