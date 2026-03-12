package com.company.wxplatform.modules.message.vo;

import java.util.List;

public record MessageListVO(
        List<MessageVO> list,
        int count
) {
}
