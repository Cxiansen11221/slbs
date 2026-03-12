package com.company.wxplatform.modules.auth.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.admin.service.AdminService;
import com.company.wxplatform.modules.auth.dto.AdminLoginRequest;
import com.company.wxplatform.modules.auth.vo.LoginVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Base64;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminService adminService;

    public AdminAuthController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ApiResponse<LoginVO> login(@Valid @RequestBody AdminLoginRequest request) {
        com.company.wxplatform.modules.admin.entity.Admin admin = adminService.login(request.username(), request.password());
        if (admin == null) {
            return ApiResponse.error("Invalid username or password");
        }

        // 更新最后操作时间
        admin.setLastOperationTime(new java.util.Date());
        // 保存更新
        adminService.updateAdmin(admin);

        // 生成token
        String token = Base64.getEncoder().encodeToString((admin.getUsername() + ":" + admin.getName() + ":" + System.currentTimeMillis()).getBytes());

        LoginVO loginVO = new LoginVO(token, 7200, "ADMIN", admin.getUsername());

        return ApiResponse.success("Login success", loginVO);
    }
}