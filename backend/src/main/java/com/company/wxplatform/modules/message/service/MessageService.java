package com.company.wxplatform.modules.message.service;

import com.company.wxplatform.modules.message.vo.MessageCountVO;
import com.company.wxplatform.modules.message.vo.MessageListVO;

public interface MessageService {

    MessageCountVO getBaseInfoCount(Long userId);

    MessageListVO findPersonalMessage(Long userId, int pageNo, int pageSize, int state);

    void updateMessageState(Long id, int state);

    int getNewMessageCount();

    void createUserMessage(Long userId, String title, String content);
}
