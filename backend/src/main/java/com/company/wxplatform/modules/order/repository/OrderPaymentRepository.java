package com.company.wxplatform.modules.order.repository;

import com.company.wxplatform.modules.order.entity.OrderPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderPaymentRepository extends JpaRepository<OrderPayment, Long> {

    Optional<OrderPayment> findByOrderId(Long orderId);

    void deleteByOrderId(Long orderId);

}
