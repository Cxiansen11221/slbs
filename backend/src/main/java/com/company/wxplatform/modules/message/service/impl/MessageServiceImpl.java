package com.company.wxplatform.modules.message.service.impl;

import com.company.wxplatform.modules.message.entity.SystemAnnouncement;
import com.company.wxplatform.modules.message.entity.UserMessage;
import com.company.wxplatform.modules.message.repository.SystemAnnouncementRepository;
import com.company.wxplatform.modules.message.repository.UserMessageRepository;
import com.company.wxplatform.modules.message.service.MessageService;
import com.company.wxplatform.modules.message.vo.MessageCountVO;
import com.company.wxplatform.modules.message.vo.MessageListVO;
import com.company.wxplatform.modules.message.vo.MessageVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private SystemAnnouncementRepository announcementRepository;

    @Autowired
    private UserMessageRepository userMessageRepository;

    @Override
    public MessageCountVO getBaseInfoCount(Long userId) {
        int unreadCount = 0;
        if (userId != null && userId > 0) {
            unreadCount = userMessageRepository.countByUserIdAndState(userId, 0);
        }
        return new MessageCountVO(0, 0, 0, 0, unreadCount);
    }

    @Override
    public MessageListVO findPersonalMessage(Long userId, int pageNo, int pageSize, int state) {
        List<MessageVO> messages = new ArrayList<>();

        if (userId != null && userId > 0) {
            List<UserMessage> userMessages = userMessageRepository.findByUserIdOrderByCreateTimeDesc(userId);
            for (UserMessage item : userMessages) {
                int msgState = item.getState() == null ? 0 : item.getState();
                if (state == -1 || state == msgState) {
                    messages.add(new MessageVO(
                            item.getMessageId(),
                            item.getTitle(),
                            item.getContent(),
                            item.getCreateTime() == null
                                    ? LocalDateTime.now()
                                    : LocalDateTime.ofInstant(item.getCreateTime().toInstant(), ZoneId.systemDefault()),
                            msgState
                    ));
                }
            }
        } else {
            // 兼容旧逻辑：无 userId 时回退系统公告
            List<SystemAnnouncement> announcements = announcementRepository.findByStatusOrderByIsTopDescPublishTimeDesc(2);
            for (SystemAnnouncement announcement : announcements) {
                int msgState = (announcement.getReadCount() != null && announcement.getReadCount() > 0) ? 1 : 0;
                if (state == -1 || state == msgState) {
                    messages.add(new MessageVO(
                            announcement.getAnnouncementId(),
                            announcement.getTitle(),
                            announcement.getContent(),
                            announcement.getPublishTime() != null
                                    ? LocalDateTime.ofInstant(announcement.getPublishTime().toInstant(), ZoneId.systemDefault())
                                    : LocalDateTime.now(),
                            msgState
                    ));
                }
            }
        }

        int start = Math.max(0, (pageNo - 1) * pageSize);
        int end = Math.min(start + pageSize, messages.size());
        List<MessageVO> paged = start >= end ? List.of() : messages.subList(start, end);
        return new MessageListVO(paged, messages.size());
    }

    @Override
    public void updateMessageState(Long id, int state) {
        userMessageRepository.findById(id).ifPresent(msg -> {
            msg.setState(state);
            userMessageRepository.save(msg);
        });
    }

    @Override
    public int getNewMessageCount() {
        // 无 userId 时不返回全局假数据，保持 0
        return 0;
    }

    @Override
    public void createUserMessage(Long userId, String title, String content) {
        if (userId == null || userId <= 0) return;
        UserMessage msg = new UserMessage();
        msg.setUserId(userId);
        msg.setTitle(title == null || title.isBlank() ? "系统通知" : title);
        msg.setContent(content == null ? "" : content);
        msg.setState(0);
        msg.setCreateTime(new Date());
        userMessageRepository.save(msg);
    }
}
