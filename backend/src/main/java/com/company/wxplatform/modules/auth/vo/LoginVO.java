package com.company.wxplatform.modules.auth.vo;

public record LoginVO(
        String token,
        long expiresIn,
        String role,
        String username
) {
}

