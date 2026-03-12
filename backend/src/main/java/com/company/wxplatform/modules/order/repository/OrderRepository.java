package com.company.wxplatform.modules.order.repository;

import com.company.wxplatform.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByOrderCode(String orderCode);
    List<Order> findByUserId(Long userId);
    List<Order> findByVehicleId(Long vehicleId);
    List<Order> findByOrderStatus(Integer orderStatus);

}
