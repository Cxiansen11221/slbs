package com.company.wxplatform.modules.message.repository;

import com.company.wxplatform.modules.message.entity.UserMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserMessageRepository extends JpaRepository<UserMessage, Long> {
    List<UserMessage> findByUserIdOrderByCreateTimeDesc(Long userId);
    int countByUserIdAndState(Long userId, Integer state);
}
