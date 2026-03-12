package com.company.wxplatform.modules.user.vo;

public record UserSummaryVO(
        Long id,
        String username,
        String realName,
        String phone,
        String status,
        String lastLoginTime
) {
}

