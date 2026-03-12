package com.company.wxplatform.modules.deposit.service;

import com.company.wxplatform.modules.deposit.entity.Deposit;
import com.company.wxplatform.modules.deposit.entity.DepositFlow;

import java.util.List;
import java.util.Optional;

public interface DepositService {

    // 押金管理
    Deposit createDeposit(Deposit deposit);
    Deposit updateDeposit(Deposit deposit);
    Optional<Deposit> getDepositById(Long depositId);
    List<Deposit> getDepositList(int page, int size, Long userId, Integer depositType, Integer depositStatus, Long relatedOrderId);
    List<Deposit> getDepositsByUserId(Long userId, int page, int size);
    List<Deposit> getDepositsByStatus(Integer status, int page, int size);
    List<Deposit> getDepositsByType(Integer type, int page, int size);
    int getDepositCount();

    // 押金操作
    Deposit payDeposit(Long depositId);
    Deposit freezeDeposit(Long depositId, Long orderId);
    Deposit unfreezeDeposit(Long depositId);
    Deposit refundDeposit(Long depositId, Double refundAmount, String refundReason, Long adminId);

    // 押金流水
    List<DepositFlow> getDepositFlows(Long depositId);

}
