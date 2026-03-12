package com.company.wxplatform.modules.wechat.dto;

import jakarta.validation.constraints.NotBlank;

public record WxLoginRequest(
        @NotBlank(message = "code is required")
        String code,
        String nickname,
        String avatarUrl,
        Integer gender
) {
}
