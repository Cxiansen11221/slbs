package com.company.wxplatform.modules.collection.repository;

import com.company.wxplatform.modules.collection.entity.UserCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCollectionRepository extends JpaRepository<UserCollection, Long> {

    List<UserCollection> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndVehicleId(Long userId, Long vehicleId);

    long countByUserId(Long userId);

    void deleteByUserIdAndVehicleId(Long userId, Long vehicleId);
}
