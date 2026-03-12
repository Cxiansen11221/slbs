package com.company.wxplatform.modules.deposit.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.deposit.entity.Deposit;
import com.company.wxplatform.modules.deposit.entity.DepositFlow;
import com.company.wxplatform.modules.deposit.service.DepositService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deposit")
public class DepositController {

    private final DepositService depositService;

    public DepositController(DepositService depositService) {
        this.depositService = depositService;
    }

    // 押金管理
    @PostMapping("/create")
    public ApiResponse<Deposit> createDeposit(@RequestBody Deposit deposit) {
        return ApiResponse.success("Create deposit success", depositService.createDeposit(deposit));
    }

    @PutMapping("/{id}")
    public ApiResponse<Deposit> updateDeposit(@PathVariable Long id, @RequestBody Deposit deposit) {
        deposit.setDepositId(id);
        return ApiResponse.success("Update deposit success", depositService.updateDeposit(deposit));
    }

    @GetMapping("/{id}")
    public ApiResponse<Deposit> getDepositById(@PathVariable Long id) {
        return depositService.getDepositById(id)
                .map(deposit -> ApiResponse.success("Get deposit success", deposit))
                .orElse(ApiResponse.error("Deposit not found"));
    }

    @GetMapping("/list")
    public ApiResponse<List<Deposit>> getDepositList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Integer depositType,
            @RequestParam(required = false) Integer depositStatus,
            @RequestParam(required = false) Long relatedOrderId) {
        return ApiResponse.success("Get deposit list success", depositService.getDepositList(page, size, userId, depositType, depositStatus, relatedOrderId));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<Deposit>> getDepositsByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Get user deposits success", depositService.getDepositsByUserId(userId, page, size));
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<Deposit>> getDepositsByStatus(
            @PathVariable Integer status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Get deposits by status success", depositService.getDepositsByStatus(status, page, size));
    }

    @GetMapping("/type/{type}")
    public ApiResponse<List<Deposit>> getDepositsByType(
            @PathVariable Integer type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Get deposits by type success", depositService.getDepositsByType(type, page, size));
    }

    @GetMapping("/count")
    public ApiResponse<Integer> getDepositCount() {
        return ApiResponse.success("Get deposit count success", depositService.getDepositCount());
    }

    // 押金操作
    @PostMapping("/{id}/pay")
    public ApiResponse<Deposit> payDeposit(@PathVariable Long id) {
        return ApiResponse.success("Pay deposit success", depositService.payDeposit(id));
    }

    @PostMapping("/{id}/freeze")
    public ApiResponse<Deposit> freezeDeposit(@PathVariable Long id, @RequestParam Long orderId) {
        return ApiResponse.success("Freeze deposit success", depositService.freezeDeposit(id, orderId));
    }

    @PostMapping("/{id}/unfreeze")
    public ApiResponse<Deposit> unfreezeDeposit(@PathVariable Long id) {
        return ApiResponse.success("Unfreeze deposit success", depositService.unfreezeDeposit(id));
    }

    @PostMapping("/{id}/refund")
    public ApiResponse<Deposit> refundDeposit(
            @PathVariable Long id,
            @RequestParam Double refundAmount,
            @RequestParam String refundReason,
            @RequestParam Long adminId) {
        return ApiResponse.success("Refund deposit success", depositService.refundDeposit(id, refundAmount, refundReason, adminId));
    }

    // 押金流水
    @GetMapping("/{id}/flows")
    public ApiResponse<List<DepositFlow>> getDepositFlows(@PathVariable Long id) {
        return ApiResponse.success("Get deposit flows success", depositService.getDepositFlows(id));
    }

}
