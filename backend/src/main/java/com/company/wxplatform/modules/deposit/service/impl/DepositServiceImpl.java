package com.company.wxplatform.modules.deposit.service.impl;

import com.company.wxplatform.common.exception.BusinessException;
import com.company.wxplatform.modules.deposit.entity.Deposit;
import com.company.wxplatform.modules.deposit.entity.DepositFlow;
import com.company.wxplatform.modules.deposit.repository.DepositFlowRepository;
import com.company.wxplatform.modules.deposit.repository.DepositRepository;
import com.company.wxplatform.modules.message.service.MessageService;
import com.company.wxplatform.modules.deposit.service.DepositService;
import com.company.wxplatform.modules.order.repository.OrderRepository;
import com.company.wxplatform.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class DepositServiceImpl implements DepositService {

    @Autowired
    private DepositRepository depositRepository;

    @Autowired
    private DepositFlowRepository depositFlowRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MessageService messageService;

    @Override
    public Deposit createDeposit(Deposit deposit) {
        if (deposit == null) {
            throw new BusinessException("押金数据不能为空");
        }
        if (deposit.getUserId() == null) {
            throw new BusinessException("用户ID不能为空");
        }
        if (deposit.getDepositAmount() == null || deposit.getDepositAmount() <= 0) {
            throw new BusinessException("押金金额必须大于0");
        }
        if (deposit.getDepositType() == null) {
            throw new BusinessException("押金类型不能为空");
        }
        if (!userRepository.existsById(deposit.getUserId())) {
            throw new BusinessException("用户不存在: " + deposit.getUserId());
        }
        if (deposit.getRelatedOrderId() != null) {
            if (deposit.getRelatedOrderId() <= 0) {
                deposit.setRelatedOrderId(null);
            } else if (!orderRepository.existsById(deposit.getRelatedOrderId())) {
                throw new BusinessException("关联订单不存在: " + deposit.getRelatedOrderId());
            }
        }

        deposit.setDepositStatus(1);
        deposit.setPayTime(new Date());
        Deposit saved = depositRepository.save(deposit);
        createDepositFlow(saved.getDepositId(), 1, saved.getDepositAmount(), null, "Deposit paid");
        return saved;
    }

    @Override
    public Deposit updateDeposit(Deposit deposit) {
        return depositRepository.save(deposit);
    }

    @Override
    public Optional<Deposit> getDepositById(Long depositId) {
        return depositRepository.findById(depositId);
    }

    @Override
    public List<Deposit> getDepositList(int page, int size, Long userId, Integer depositType, Integer depositStatus, Long relatedOrderId) {
        org.springframework.data.jpa.domain.Specification<Deposit> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }
            if (depositType != null) {
                predicates.add(cb.equal(root.get("depositType"), depositType));
            }
            if (depositStatus != null) {
                predicates.add(cb.equal(root.get("depositStatus"), depositStatus));
            }
            if (relatedOrderId != null) {
                predicates.add(cb.equal(root.get("relatedOrderId"), relatedOrderId));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return depositRepository.findAll(spec, PageRequest.of(page - 1, size)).getContent();
    }

    @Override
    public List<Deposit> getDepositsByUserId(Long userId, int page, int size) {
        return depositRepository.findByUserId(userId);
    }

    @Override
    public List<Deposit> getDepositsByStatus(Integer status, int page, int size) {
        return depositRepository.findByDepositStatus(status);
    }

    @Override
    public List<Deposit> getDepositsByType(Integer type, int page, int size) {
        return depositRepository.findByDepositType(type);
    }

    @Override
    public int getDepositCount() {
        return (int) depositRepository.count();
    }

    @Override
    public Deposit payDeposit(Long depositId) {
        Deposit deposit = getRequiredDeposit(depositId);
        deposit.setDepositStatus(1);
        deposit.setPayTime(new Date());
        Deposit saved = depositRepository.save(deposit);
        createDepositFlow(saved.getDepositId(), 1, saved.getDepositAmount(), null, "Deposit paid");
        return saved;
    }

    @Override
    public Deposit freezeDeposit(Long depositId, Long orderId) {
        Deposit deposit = getRequiredDeposit(depositId);
        deposit.setDepositStatus(2);
        deposit.setFreezeTime(new Date());
        deposit.setRelatedOrderId(orderId);
        Deposit saved = depositRepository.save(deposit);
        createDepositFlow(saved.getDepositId(), 2, saved.getDepositAmount(), null, "Deposit frozen");
        return saved;
    }

    @Override
    public Deposit unfreezeDeposit(Long depositId) {
        Deposit deposit = getRequiredDeposit(depositId);
        deposit.setDepositStatus(1);
        deposit.setUnfreezeTime(new Date());
        Deposit saved = depositRepository.save(deposit);
        createDepositFlow(saved.getDepositId(), 3, saved.getDepositAmount(), null, "Deposit unfrozen");
        return saved;
    }

    @Override
    public Deposit refundDeposit(Long depositId, Double refundAmount, String refundReason, Long adminId) {
        Deposit deposit = getRequiredDeposit(depositId);
        double amount = refundAmount == null ? deposit.getDepositAmount() : refundAmount;

        deposit.setDepositStatus(amount < deposit.getDepositAmount() ? 4 : 3);
        deposit.setRefundApplyTime(new Date());
        deposit.setRefundAuditTime(new Date());
        deposit.setRefundCompleteTime(new Date());
        deposit.setAuditAdminId(adminId);

        Deposit saved = depositRepository.save(deposit);
        createDepositFlow(saved.getDepositId(), 4, amount, adminId, refundReason == null ? "Deposit refunded" : refundReason);

        // 退款成功后，推送一条用户站内消息
        String title = "\u62bc\u91d1\u9000\u8fd8\u901a\u77e5";
        String content = String.format("\u60a8\u7684\u62bc\u91d1\u5df2\u9000\u8fd8\uff0c\u91d1\u989d\uff1a%.2f\u5143\u3002", amount);
        messageService.createUserMessage(saved.getUserId(), title, content);
        return saved;
    }

    @Override
    public List<DepositFlow> getDepositFlows(Long depositId) {
        return depositFlowRepository.findByDepositId(depositId);
    }

    private Deposit getRequiredDeposit(Long depositId) {
        return depositRepository.findById(depositId).orElseThrow(() -> new RuntimeException("Deposit not found"));
    }

    private void createDepositFlow(Long depositId, Integer opType, Double amount, Long operatorId, String note) {
        DepositFlow flow = new DepositFlow();
        flow.setDepositId(depositId);
        flow.setOperationType(opType);
        flow.setOperationAmount(amount == null ? 0 : amount);
        flow.setBeforeBalance(0.0);
        flow.setAfterBalance(0.0);
        flow.setOperatorId(operatorId);
        flow.setOperationTime(new Date());
        flow.setOperationNote(note);
        depositFlowRepository.save(flow);
    }
}
