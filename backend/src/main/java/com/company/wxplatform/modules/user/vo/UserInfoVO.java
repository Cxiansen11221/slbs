package com.company.wxplatform.modules.user.vo;

public record UserInfoVO(
        Long id,
        String name,
        String username,
        String phone,
        String email,
        String birthday,
        Integer sexCode,
        String sex,
        String role,
        String roleStr,
        String headUrl,
        String address,
        String openId
) {
}
