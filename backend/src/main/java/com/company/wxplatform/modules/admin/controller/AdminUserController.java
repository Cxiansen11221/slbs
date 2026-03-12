package com.company.wxplatform.modules.admin.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.admin.service.AdminService;
import com.company.wxplatform.modules.admin.vo.AdminUserVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminService adminService;

    public AdminUserController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ApiResponse<List<AdminUserVO>> getUsers() {
        List<AdminUserVO> users = adminService.getUsers();
        return ApiResponse.success("Get users success", users);
    }
}