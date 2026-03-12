package com.company.wxplatform.modules.order.repository;

import com.company.wxplatform.modules.order.entity.TakeReturnRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TakeReturnRecordRepository extends JpaRepository<TakeReturnRecord, Long> {

    Optional<TakeReturnRecord> findByOrderId(Long orderId);

    void deleteByOrderId(Long orderId);

}
