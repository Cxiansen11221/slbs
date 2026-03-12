package com.company.wxplatform.modules.auth.service.impl;

import com.company.wxplatform.common.exception.BusinessException;
import com.company.wxplatform.infrastructure.security.TokenService;
import com.company.wxplatform.modules.auth.dto.AdminLoginRequest;
import com.company.wxplatform.modules.auth.service.AdminAuthService;
import com.company.wxplatform.modules.auth.vo.LoginVO;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthServiceImpl implements AdminAuthService {

    private final TokenService tokenService;

    public AdminAuthServiceImpl(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    public LoginVO login(AdminLoginRequest request) {
        if (!"admin".equals(request.username()) || !"123456".equals(request.password())) {
            throw new BusinessException("Invalid username or password");
        }
        String token = tokenService.generateToken("admin:" + request.username());
        return new LoginVO(token, tokenService.getTokenExpireSeconds(), "ADMIN", request.username());
    }
}


