package com.company.wxplatform.modules.order.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.order.entity.Order;
import com.company.wxplatform.modules.order.entity.OrderPayment;
import com.company.wxplatform.modules.order.entity.TakeReturnRecord;
import com.company.wxplatform.modules.order.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 订单管理
    @PostMapping("/create")
    public ApiResponse<Order> createOrder(@RequestBody Order order) {
        return ApiResponse.success("Create order success", orderService.createOrder(order));
    }

    @PutMapping("/{id}")
    public ApiResponse<Order> updateOrder(@PathVariable Long id, @RequestBody Order order) {
        order.setOrderId(id);
        return ApiResponse.success("Update order success", orderService.updateOrder(order));
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<Void> cancelOrder(@PathVariable Long id, @RequestParam String cancelReason) {
        orderService.cancelOrder(id, cancelReason);
        return ApiResponse.success("Cancel order success");
    }

    // DELETE 主路由
    @DeleteMapping({"/{id}/delete", "/delete/{id}"})
    public ApiResponse<Void> deleteCanceledOrder(@PathVariable Long id) {
        orderService.deleteCanceledOrder(id);
        return ApiResponse.success("Delete canceled order success");
    }

    // 兼容某些环境不放行 DELETE，允许 POST 删除（仅用于业务演示）
    @PostMapping({"/{id}/delete", "/delete/{id}"})
    public ApiResponse<Void> deleteCanceledOrderByPost(@PathVariable Long id) {
        orderService.deleteCanceledOrder(id);
        return ApiResponse.success("Delete canceled order success");
    }

    @GetMapping("/{id}")
    public ApiResponse<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(order -> ApiResponse.success("Get order success", order))
                .orElse(ApiResponse.error("Order not found"));
    }

    @GetMapping("/by-code/{orderCode}")
    public ApiResponse<Order> getOrderByOrderCode(@PathVariable String orderCode) {
        return orderService.getOrderByOrderCode(orderCode)
                .map(order -> ApiResponse.success("Get order success", order))
                .orElse(ApiResponse.error("Order not found"));
    }

    @GetMapping("/list")
    public ApiResponse<List<Order>> getOrderList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String orderNumber,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Integer orderStatus) {
        return ApiResponse.success("Get order list success", orderService.getOrderList(page, size, orderNumber, userId, orderStatus));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<Order>> getOrdersByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Get user orders success", orderService.getOrdersByUserId(userId, page, size));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ApiResponse<List<Order>> getOrdersByVehicleId(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Get vehicle orders success", orderService.getOrdersByVehicleId(vehicleId, page, size));
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<Order>> getOrdersByStatus(
            @PathVariable Integer status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Get orders by status success", orderService.getOrdersByStatus(status, page, size));
    }

    @GetMapping("/count")
    public ApiResponse<Integer> getOrderCount() {
        return ApiResponse.success("Get order count success", orderService.getOrderCount());
    }

    // 订单状态流转
    @PostMapping("/{id}/pay")
    public ApiResponse<Order> payOrder(@PathVariable Long id, @RequestBody OrderPayment payment) {
        return ApiResponse.success("Pay order success", orderService.payOrder(id, payment));
    }

    @PostMapping("/{id}/pickup")
    public ApiResponse<Order> pickupVehicle(@PathVariable Long id, @RequestBody TakeReturnRecord record) {
        return ApiResponse.success("Pickup vehicle success", orderService.pickupVehicle(id, record));
    }

    @PostMapping("/{id}/return")
    public ApiResponse<Order> returnVehicle(@PathVariable Long id, @RequestBody TakeReturnRecord record) {
        return ApiResponse.success("Return vehicle success", orderService.returnVehicle(id, record));
    }

    // 支付管理
    @GetMapping("/{id}/payment")
    public ApiResponse<OrderPayment> getOrderPayment(@PathVariable Long id) {
        OrderPayment payment = orderService.getOrderPayment(id);
        return payment != null
                ? ApiResponse.success("Get order payment success", payment)
                : ApiResponse.error("Payment record not found");
    }

    @PostMapping("/{id}/refund")
    public ApiResponse<OrderPayment> refundOrder(
            @PathVariable Long id,
            @RequestParam Double refundAmount,
            @RequestParam String refundReason) {
        return ApiResponse.success("Refund order success", orderService.refundOrder(id, refundAmount, refundReason));
    }

    // 取还车记录
    @GetMapping("/{id}/take-return-record")
    public ApiResponse<TakeReturnRecord> getTakeReturnRecord(@PathVariable Long id) {
        TakeReturnRecord record = orderService.getTakeReturnRecord(id);
        return record != null
                ? ApiResponse.success("Get take return record success", record)
                : ApiResponse.error("Take return record not found");
    }
}
