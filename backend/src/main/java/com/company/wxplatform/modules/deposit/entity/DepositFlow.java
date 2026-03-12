package com.company.wxplatform.modules.deposit.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "deposit_flow")
public class DepositFlow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flow_id")
    private Long flowId;

    @Column(name = "deposit_id", nullable = false)
    private Long depositId;

    @Column(name = "operation_type", nullable = false)
    private Integer operationType; // 1: 缴纳, 2: 冻结, 3: 解冻, 4: 退还

    @Column(name = "operation_amount", nullable = false)
    private Double operationAmount;

    @Column(name = "before_balance")
    private Double beforeBalance;

    @Column(name = "after_balance")
    private Double afterBalance;

    @Column(name = "operator_id")
    private Long operatorId;

    @Column(name = "operation_time", nullable = false)
    private Date operationTime;

    @Column(name = "operation_ip")
    private String operationIp;

    @Column(name = "operation_note")
    private String operationNote;

    public Long getFlowId() {
        return flowId;
    }

    public void setFlowId(Long flowId) {
        this.flowId = flowId;
    }

    public Long getDepositId() {
        return depositId;
    }

    public void setDepositId(Long depositId) {
        this.depositId = depositId;
    }

    public Integer getOperationType() {
        return operationType;
    }

    public void setOperationType(Integer operationType) {
        this.operationType = operationType;
    }

    public Double getOperationAmount() {
        return operationAmount;
    }

    public void setOperationAmount(Double operationAmount) {
        this.operationAmount = operationAmount;
    }

    public Double getBeforeBalance() {
        return beforeBalance;
    }

    public void setBeforeBalance(Double beforeBalance) {
        this.beforeBalance = beforeBalance;
    }

    public Double getAfterBalance() {
        return afterBalance;
    }

    public void setAfterBalance(Double afterBalance) {
        this.afterBalance = afterBalance;
    }

    public Long getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(Long operatorId) {
        this.operatorId = operatorId;
    }

    public Date getOperationTime() {
        return operationTime;
    }

    public void setOperationTime(Date operationTime) {
        this.operationTime = operationTime;
    }

    public String getOperationIp() {
        return operationIp;
    }

    public void setOperationIp(String operationIp) {
        this.operationIp = operationIp;
    }

    public String getOperationNote() {
        return operationNote;
    }

    public void setOperationNote(String operationNote) {
        this.operationNote = operationNote;
    }
}
