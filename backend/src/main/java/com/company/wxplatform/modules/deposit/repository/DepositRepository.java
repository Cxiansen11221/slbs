package com.company.wxplatform.modules.deposit.repository;

import com.company.wxplatform.modules.deposit.entity.Deposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositRepository extends JpaRepository<Deposit, Long>, JpaSpecificationExecutor<Deposit> {

    List<Deposit> findByUserId(Long userId);
    List<Deposit> findByDepositStatus(Integer depositStatus);
    List<Deposit> findByDepositType(Integer depositType);
    List<Deposit> findByUserIdAndDepositType(Long userId, Integer depositType);

}
