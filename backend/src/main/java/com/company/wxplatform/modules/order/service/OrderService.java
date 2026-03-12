package com.company.wxplatform.modules.order.service;

import com.company.wxplatform.modules.order.entity.Order;
import com.company.wxplatform.modules.order.entity.OrderPayment;
import com.company.wxplatform.modules.order.entity.TakeReturnRecord;

import java.util.List;
import java.util.Optional;

public interface OrderService {

    // 订单管理
    Order createOrder(Order order);
    Order updateOrder(Order order);
    void cancelOrder(Long orderId, String cancelReason);
    void deleteCanceledOrder(Long orderId);
    Optional<Order> getOrderById(Long orderId);
    Optional<Order> getOrderByOrderCode(String orderCode);
    List<Order> getOrderList(int page, int size, String orderNumber, Long userId, Integer orderStatus);
    List<Order> getOrdersByUserId(Long userId, int page, int size);
    List<Order> getOrdersByVehicleId(Long vehicleId, int page, int size);
    List<Order> getOrdersByStatus(Integer status, int page, int size);
    int getOrderCount();

    // 订单状态流转
    Order payOrder(Long orderId, OrderPayment payment);
    Order pickupVehicle(Long orderId, TakeReturnRecord record);
    Order returnVehicle(Long orderId, TakeReturnRecord record);

    // 支付管理
    OrderPayment getOrderPayment(Long orderId);
    OrderPayment refundOrder(Long orderId, Double refundAmount, String refundReason);

    // 取还车记录
    TakeReturnRecord getTakeReturnRecord(Long orderId);

}
