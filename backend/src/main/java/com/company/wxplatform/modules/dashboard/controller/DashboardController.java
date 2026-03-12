package com.company.wxplatform.modules.dashboard.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.dashboard.service.DashboardService;
import com.company.wxplatform.modules.dashboard.vo.DashboardStatsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsVO> getDashboardStats() {
        DashboardStatsVO stats = dashboardService.getDashboardStats();
        return ApiResponse.success(stats);
    }
}