package com.company.wxplatform.modules.deposit.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "deposit")
public class Deposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deposit_id")
    private Long depositId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "deposit_amount", nullable = false)
    private Double depositAmount;

    @Column(name = "deposit_type")
    private Integer depositType; // 1: 车辆押金, 2: 违章押金

    @Column(name = "deposit_status", nullable = false)
    private Integer depositStatus; // 1: 已缴纳, 2: 已冻结, 3: 已退还, 4: 部分退还

    @Column(name = "pay_time")
    private Date payTime;

    @Column(name = "freeze_time")
    private Date freezeTime;

    @Column(name = "unfreeze_time")
    private Date unfreezeTime;

    @Column(name = "refund_apply_time")
    private Date refundApplyTime;

    @Column(name = "refund_audit_time")
    private Date refundAuditTime;

    @Column(name = "refund_complete_time")
    private Date refundCompleteTime;

    @Column(name = "related_order_id")
    private Long relatedOrderId;

    @Column(name = "audit_admin_id")
    private Long auditAdminId;

    @Column(name = "refund_method")
    private Integer refundMethod; // 1: 原路返回, 2: 银行卡

    @Column(name = "refund_bank_card")
    private String refundBankCard; // 脱敏处理的银行卡号

    public Long getDepositId() {
        return depositId;
    }

    public void setDepositId(Long depositId) {
        this.depositId = depositId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(Double depositAmount) {
        this.depositAmount = depositAmount;
    }

    public Integer getDepositType() {
        return depositType;
    }

    public void setDepositType(Integer depositType) {
        this.depositType = depositType;
    }

    public Integer getDepositStatus() {
        return depositStatus;
    }

    public void setDepositStatus(Integer depositStatus) {
        this.depositStatus = depositStatus;
    }

    public Date getPayTime() {
        return payTime;
    }

    public void setPayTime(Date payTime) {
        this.payTime = payTime;
    }

    public Date getFreezeTime() {
        return freezeTime;
    }

    public void setFreezeTime(Date freezeTime) {
        this.freezeTime = freezeTime;
    }

    public Date getUnfreezeTime() {
        return unfreezeTime;
    }

    public void setUnfreezeTime(Date unfreezeTime) {
        this.unfreezeTime = unfreezeTime;
    }

    public Date getRefundApplyTime() {
        return refundApplyTime;
    }

    public void setRefundApplyTime(Date refundApplyTime) {
        this.refundApplyTime = refundApplyTime;
    }

    public Date getRefundAuditTime() {
        return refundAuditTime;
    }

    public void setRefundAuditTime(Date refundAuditTime) {
        this.refundAuditTime = refundAuditTime;
    }

    public Date getRefundCompleteTime() {
        return refundCompleteTime;
    }

    public void setRefundCompleteTime(Date refundCompleteTime) {
        this.refundCompleteTime = refundCompleteTime;
    }

    public Long getRelatedOrderId() {
        return relatedOrderId;
    }

    public void setRelatedOrderId(Long relatedOrderId) {
        this.relatedOrderId = relatedOrderId;
    }

    public Long getAuditAdminId() {
        return auditAdminId;
    }

    public void setAuditAdminId(Long auditAdminId) {
        this.auditAdminId = auditAdminId;
    }

    public Integer getRefundMethod() {
        return refundMethod;
    }

    public void setRefundMethod(Integer refundMethod) {
        this.refundMethod = refundMethod;
    }

    public String getRefundBankCard() {
        return refundBankCard;
    }

    public void setRefundBankCard(String refundBankCard) {
        this.refundBankCard = refundBankCard;
    }
}
