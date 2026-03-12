package com.company.wxplatform.modules.user.repository;

import com.company.wxplatform.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT COUNT(*) FROM User")
    long countTotalUsers();

    @Query("SELECT COUNT(*) FROM User WHERE DATE(lastLoginTime) = CURRENT_DATE")
    long countDailyActiveUsers();

    @Query("SELECT COUNT(*) FROM User WHERE DATE(registerTime) = CURRENT_DATE")
    long countTodayNewUsers();

    Optional<User> findByUsername(String username);

    Optional<User> findByOpenId(String openId);

    Optional<User> findByPhone(String phone);
}
