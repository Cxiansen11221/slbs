package com.company.wxplatform.modules.order.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "order_code", unique = true, nullable = false)
    private String orderCode;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "create_time", nullable = false)
    private Date createTime;

    @Column(name = "create_ip")
    private String createIp;

    @Column(name = "rental_type")
    private Integer rentalType; // 1: 时租, 2: 日租, 3: 周租, 4: 月租

    @Column(name = "expected_pickup_time")
    private Date expectedPickupTime;

    @Column(name = "expected_return_time")
    private Date expectedReturnTime;

    @Column(name = "actual_pickup_time")
    private Date actualPickupTime;

    @Column(name = "actual_return_time")
    private Date actualReturnTime;

    @Column(name = "rental_duration")
    private Integer rentalDuration; // 租赁时长（分钟/小时/天）

    @Column(name = "base_rent")
    private Double baseRent;

    @Column(name = "service_fee")
    private Double serviceFee;

    @Column(name = "insurance_fee")
    private Double insuranceFee;

    @Column(name = "penalty_fee")
    private Double penaltyFee;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "actual_pay_amount")
    private Double actualPayAmount;

    @Column(name = "order_status", nullable = false)
    private Integer orderStatus; // 1: 待支付, 2: 已支付, 3: 已取车, 4: 已还车, 5: 已取消, 6: 已退款, 7: 异常

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "cancel_time")
    private Date cancelTime;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public String getCreateIp() {
        return createIp;
    }

    public void setCreateIp(String createIp) {
        this.createIp = createIp;
    }

    public Integer getRentalType() {
        return rentalType;
    }

    public void setRentalType(Integer rentalType) {
        this.rentalType = rentalType;
    }

    public Date getExpectedPickupTime() {
        return expectedPickupTime;
    }

    public void setExpectedPickupTime(Date expectedPickupTime) {
        this.expectedPickupTime = expectedPickupTime;
    }

    public Date getExpectedReturnTime() {
        return expectedReturnTime;
    }

    public void setExpectedReturnTime(Date expectedReturnTime) {
        this.expectedReturnTime = expectedReturnTime;
    }

    public Date getActualPickupTime() {
        return actualPickupTime;
    }

    public void setActualPickupTime(Date actualPickupTime) {
        this.actualPickupTime = actualPickupTime;
    }

    public Date getActualReturnTime() {
        return actualReturnTime;
    }

    public void setActualReturnTime(Date actualReturnTime) {
        this.actualReturnTime = actualReturnTime;
    }

    public Integer getRentalDuration() {
        return rentalDuration;
    }

    public void setRentalDuration(Integer rentalDuration) {
        this.rentalDuration = rentalDuration;
    }

    public Double getBaseRent() {
        return baseRent;
    }

    public void setBaseRent(Double baseRent) {
        this.baseRent = baseRent;
    }

    public Double getServiceFee() {
        return serviceFee;
    }

    public void setServiceFee(Double serviceFee) {
        this.serviceFee = serviceFee;
    }

    public Double getInsuranceFee() {
        return insuranceFee;
    }

    public void setInsuranceFee(Double insuranceFee) {
        this.insuranceFee = insuranceFee;
    }

    public Double getPenaltyFee() {
        return penaltyFee;
    }

    public void setPenaltyFee(Double penaltyFee) {
        this.penaltyFee = penaltyFee;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Double getActualPayAmount() {
        return actualPayAmount;
    }

    public void setActualPayAmount(Double actualPayAmount) {
        this.actualPayAmount = actualPayAmount;
    }

    public Integer getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(Integer orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }

    public Date getCancelTime() {
        return cancelTime;
    }

    public void setCancelTime(Date cancelTime) {
        this.cancelTime = cancelTime;
    }
}
