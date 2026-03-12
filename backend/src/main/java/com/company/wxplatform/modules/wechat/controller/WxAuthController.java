package com.company.wxplatform.modules.wechat.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.wechat.dto.WxLoginRequest;
import com.company.wxplatform.modules.wechat.service.WxAuthService;
import com.company.wxplatform.modules.wechat.vo.WxLoginVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wechat/auth")
public class WxAuthController {

    private final WxAuthService wxAuthService;

    public WxAuthController(WxAuthService wxAuthService) {
        this.wxAuthService = wxAuthService;
    }

    @PostMapping("/login")
    public ApiResponse<WxLoginVO> login(@Valid @RequestBody WxLoginRequest request) {
        return ApiResponse.success("Login success", wxAuthService.login(request));
    }
}
