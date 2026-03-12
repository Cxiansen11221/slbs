package com.company.wxplatform.modules.order.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "order_payment")
public class OrderPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "payment_method")
    private Integer paymentMethod; // 1: 微信, 2: 支付宝, 3: 银行卡

    @Column(name = "payment_amount", nullable = false)
    private Double paymentAmount;

    @Column(name = "payment_no")
    private String paymentNo; // 第三方支付流水号

    @Column(name = "payment_time")
    private Date paymentTime;

    @Column(name = "refund_apply_time")
    private Date refundApplyTime;

    @Column(name = "refund_complete_time")
    private Date refundCompleteTime;

    @Column(name = "refund_amount")
    private Double refundAmount;

    @Column(name = "refund_reason")
    private String refundReason;

    @Column(name = "refund_status")
    private Integer refundStatus; // 1: 未退款, 2: 退款中, 3: 已退款

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Integer getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(Integer paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Double getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(Double paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public String getPaymentNo() {
        return paymentNo;
    }

    public void setPaymentNo(String paymentNo) {
        this.paymentNo = paymentNo;
    }

    public Date getPaymentTime() {
        return paymentTime;
    }

    public void setPaymentTime(Date paymentTime) {
        this.paymentTime = paymentTime;
    }

    public Date getRefundApplyTime() {
        return refundApplyTime;
    }

    public void setRefundApplyTime(Date refundApplyTime) {
        this.refundApplyTime = refundApplyTime;
    }

    public Date getRefundCompleteTime() {
        return refundCompleteTime;
    }

    public void setRefundCompleteTime(Date refundCompleteTime) {
        this.refundCompleteTime = refundCompleteTime;
    }

    public Double getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(Double refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getRefundReason() {
        return refundReason;
    }

    public void setRefundReason(String refundReason) {
        this.refundReason = refundReason;
    }

    public Integer getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(Integer refundStatus) {
        this.refundStatus = refundStatus;
    }
}
