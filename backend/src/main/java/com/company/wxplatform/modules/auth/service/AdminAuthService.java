package com.company.wxplatform.modules.auth.service;

import com.company.wxplatform.modules.auth.dto.AdminLoginRequest;
import com.company.wxplatform.modules.auth.vo.LoginVO;

public interface AdminAuthService {
    LoginVO login(AdminLoginRequest request);
}

