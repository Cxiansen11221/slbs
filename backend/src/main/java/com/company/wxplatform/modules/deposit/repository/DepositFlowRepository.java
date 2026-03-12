package com.company.wxplatform.modules.deposit.repository;

import com.company.wxplatform.modules.deposit.entity.DepositFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositFlowRepository extends JpaRepository<DepositFlow, Long> {

    List<DepositFlow> findByDepositId(Long depositId);

}
