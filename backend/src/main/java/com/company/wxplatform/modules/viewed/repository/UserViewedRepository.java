package com.company.wxplatform.modules.viewed.repository;

import com.company.wxplatform.modules.viewed.entity.UserViewed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserViewedRepository extends JpaRepository<UserViewed, Long> {

    List<UserViewed> findByUserIdOrderByViewedAtDesc(Long userId);

    Optional<UserViewed> findByUserIdAndVehicleId(Long userId, Long vehicleId);

    long countByUserId(Long userId);
}

