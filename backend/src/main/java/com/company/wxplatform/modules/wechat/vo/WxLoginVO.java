package com.company.wxplatform.modules.wechat.vo;

public record WxLoginVO(
        String token,
        long expiresIn,
        String openId,
        Long userId,
        String username,
        String nickname,
        String avatarUrl
) {
}
