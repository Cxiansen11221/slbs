package com.company.wxplatform.modules.order.service.impl;

import com.company.wxplatform.common.exception.BusinessException;
import com.company.wxplatform.modules.order.entity.Order;
import com.company.wxplatform.modules.order.entity.OrderPayment;
import com.company.wxplatform.modules.order.entity.TakeReturnRecord;
import com.company.wxplatform.modules.order.repository.OrderPaymentRepository;
import com.company.wxplatform.modules.order.repository.OrderRepository;
import com.company.wxplatform.modules.order.repository.TakeReturnRecordRepository;
import com.company.wxplatform.modules.order.service.OrderService;
import com.company.wxplatform.modules.user.repository.UserRepository;
import com.company.wxplatform.modules.vehicle.repository.VehicleRepository;
import com.company.wxplatform.modules.vehicle.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderPaymentRepository orderPaymentRepository;

    @Autowired
    private TakeReturnRecordRepository takeReturnRecordRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleService vehicleService;

    @Override
    public Order createOrder(Order order) {
        if (order == null) {
            throw new BusinessException("Order payload cannot be null");
        }
        if (order.getUserId() == null) {
            throw new BusinessException("User ID cannot be null");
        }
        if (order.getVehicleId() == null) {
            throw new BusinessException("Vehicle ID cannot be null");
        }
        if (order.getRentalType() == null) {
            throw new BusinessException("Rental type cannot be null");
        }
        if (order.getExpectedPickupTime() == null) {
            throw new BusinessException("Expected pickup time cannot be null");
        }
        if (order.getExpectedReturnTime() == null) {
            throw new BusinessException("Expected return time cannot be null");
        }
        if (order.getBaseRent() == null) {
            throw new BusinessException("Base rent cannot be null");
        }
        if (order.getExpectedReturnTime().before(order.getExpectedPickupTime())) {
            throw new BusinessException("Expected return time cannot be earlier than expected pickup time");
        }
        if (!userRepository.existsById(order.getUserId())) {
            throw new BusinessException("User does not exist: " + order.getUserId());
        }
        if (!vehicleRepository.existsById(order.getVehicleId())) {
            throw new BusinessException("Vehicle does not exist: " + order.getVehicleId());
        }

        double baseRent = order.getBaseRent() != null ? order.getBaseRent() : 0;
        double serviceFee = order.getServiceFee() != null ? order.getServiceFee() : 0;
        double insuranceFee = order.getInsuranceFee() != null ? order.getInsuranceFee() : 0;
        double totalAmount = baseRent + serviceFee + insuranceFee;

        order.setTotalAmount(totalAmount);
        order.setActualPayAmount(totalAmount);
        order.setOrderCode(generateOrderCode());
        order.setCreateTime(new Date());
        order.setOrderStatus(1);
        return orderRepository.save(order);
    }

    @Override
    public Order updateOrder(Order order) {
        return orderRepository.save(order);
    }

    @Override
    public void cancelOrder(Long orderId, String cancelReason) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(5);
        order.setCancelReason(cancelReason);
        order.setCancelTime(new Date());
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteCanceledOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        Integer status = order.getOrderStatus();
        // 允许删除：已取消(5) 或 已支付(2)
        if (status == null || (status != 5 && status != 2)) {
            throw new RuntimeException("Only canceled or paid orders can be deleted");
        }
        orderPaymentRepository.deleteByOrderId(orderId);
        takeReturnRecordRepository.deleteByOrderId(orderId);
        orderRepository.deleteById(orderId);
    }

    @Override
    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    @Override
    public Optional<Order> getOrderByOrderCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode);
    }

    @Override
    public List<Order> getOrderList(int page, int size, String orderNumber, Long userId, Integer orderStatus) {
        org.springframework.data.jpa.domain.Specification<Order> spec = (root, query, criteriaBuilder) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            if (orderNumber != null && !orderNumber.isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("orderCode"), "%" + orderNumber + "%"));
            }

            if (userId != null) {
                predicates.add(criteriaBuilder.equal(root.get("userId"), userId));
            }

            if (orderStatus != null) {
                predicates.add(criteriaBuilder.equal(root.get("orderStatus"), orderStatus));
            }

            return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return orderRepository.findAll(spec, PageRequest.of(page - 1, size)).getContent();
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId, int page, int size) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public List<Order> getOrdersByVehicleId(Long vehicleId, int page, int size) {
        return orderRepository.findByVehicleId(vehicleId);
    }

    @Override
    public List<Order> getOrdersByStatus(Integer status, int page, int size) {
        return orderRepository.findByOrderStatus(status);
    }

    @Override
    public int getOrderCount() {
        return (int) orderRepository.count();
    }

    @Override
    public Order payOrder(Long orderId, OrderPayment payment) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getOrderStatus() != 1) {
            throw new RuntimeException("Order status is not pending payment");
        }

        order.setOrderStatus(2);
        Double payAmount = payment == null ? null : payment.getPaymentAmount();
        if (payAmount == null) {
            payAmount = order.getTotalAmount() == null ? 0D : order.getTotalAmount();
        }
        order.setActualPayAmount(payAmount);
        orderRepository.save(order);

        OrderPayment entity = orderPaymentRepository.findByOrderId(orderId).orElse(new OrderPayment());
        entity.setOrderId(orderId);
        entity.setPaymentMethod(payment == null ? 1 : (payment.getPaymentMethod() == null ? 1 : payment.getPaymentMethod()));
        entity.setPaymentAmount(payAmount);
        entity.setPaymentNo(payment == null ? ("SIM" + System.currentTimeMillis()) : payment.getPaymentNo());
        entity.setPaymentTime(new Date());
        entity.setRefundStatus(1);
        orderPaymentRepository.save(entity);

        return order;
    }

    @Override
    public Order pickupVehicle(Long orderId, TakeReturnRecord record) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getOrderStatus() != 2) {
            throw new RuntimeException("Order status is not paid");
        }

        order.setOrderStatus(3);
        order.setActualPickupTime(new Date());
        orderRepository.save(order);

        record.setOrderId(orderId);
        takeReturnRecordRepository.save(record);

        vehicleService.updateVehicleStatus(null);

        return order;
    }

    @Override
    public Order returnVehicle(Long orderId, TakeReturnRecord record) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getOrderStatus() != 3) {
            throw new RuntimeException("Order status is not picked up");
        }

        order.setOrderStatus(4);
        order.setActualReturnTime(new Date());
        if (order.getActualPickupTime() != null) {
            long duration = (order.getActualReturnTime().getTime() - order.getActualPickupTime().getTime()) / (1000 * 60);
            order.setRentalDuration((int) duration);
        }
        orderRepository.save(order);

        TakeReturnRecord existingRecord = takeReturnRecordRepository.findByOrderId(orderId).orElse(record);
        existingRecord.setReturnerId(record.getReturnerId());
        existingRecord.setReturnStoreId(record.getReturnStoreId());
        existingRecord.setReturnLocation(record.getReturnLocation());
        existingRecord.setReturnBatteryLevel(record.getReturnBatteryLevel());
        existingRecord.setReturnVehicleStatus(record.getReturnVehicleStatus());
        existingRecord.setReturnInspector(record.getReturnInspector());
        existingRecord.setReturnNote(record.getReturnNote());
        takeReturnRecordRepository.save(existingRecord);

        vehicleService.updateVehicleStatus(null);

        return order;
    }

    @Override
    public OrderPayment getOrderPayment(Long orderId) {
        return orderPaymentRepository.findByOrderId(orderId).orElse(null);
    }

    @Override
    public OrderPayment refundOrder(Long orderId, Double refundAmount, String refundReason) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        OrderPayment payment = orderPaymentRepository.findByOrderId(orderId).orElseThrow(() -> new RuntimeException("Payment record not found"));

        order.setOrderStatus(6);
        orderRepository.save(order);

        payment.setRefundApplyTime(new Date());
        payment.setRefundAmount(refundAmount);
        payment.setRefundReason(refundReason);
        payment.setRefundStatus(2);
        orderPaymentRepository.save(payment);

        payment.setRefundCompleteTime(new Date());
        payment.setRefundStatus(3);
        orderPaymentRepository.save(payment);

        return payment;
    }

    @Override
    public TakeReturnRecord getTakeReturnRecord(Long orderId) {
        return takeReturnRecordRepository.findByOrderId(orderId).orElse(null);
    }

    private String generateOrderCode() {
        for (int i = 0; i < 5; i++) {
            String millis = String.valueOf(System.currentTimeMillis());
            String timePart = millis.substring(millis.length() - 10);
            String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
            String code = "DD" + timePart + randomPart;
            if (code.length() <= 20 && orderRepository.findByOrderCode(code).isEmpty()) {
                return code;
            }
        }
        throw new BusinessException("Failed to generate order code, please retry");
    }
}
