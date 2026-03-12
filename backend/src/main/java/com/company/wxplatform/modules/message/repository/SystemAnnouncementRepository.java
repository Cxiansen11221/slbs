package com.company.wxplatform.modules.message.repository;

import com.company.wxplatform.modules.message.entity.SystemAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, Long> {
    List<SystemAnnouncement> findByStatusOrderByIsTopDescPublishTimeDesc(Integer status);
}
