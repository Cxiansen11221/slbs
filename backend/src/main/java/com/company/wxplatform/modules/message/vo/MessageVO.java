package com.company.wxplatform.modules.message.vo;

import java.time.LocalDateTime;

public record MessageVO(
        Long id,
        String title,
        String content,
        LocalDateTime createTime,
        int state
) {
}
