package com.company.wxplatform.modules.vehicle.repository;

import com.company.wxplatform.modules.vehicle.entity.HomeRecommend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeRecommendRepository extends JpaRepository<HomeRecommend, Long> {
    List<HomeRecommend> findByStatusOrderBySortOrderAscUpdateTimeDesc(Integer status);
}
