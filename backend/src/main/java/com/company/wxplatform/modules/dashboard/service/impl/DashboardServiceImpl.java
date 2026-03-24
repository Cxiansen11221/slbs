package com.company.wxplatform.modules.dashboard.service.impl;

import com.company.wxplatform.modules.admin.repository.AdminRepository;
import com.company.wxplatform.modules.dashboard.service.DashboardService;
import com.company.wxplatform.modules.dashboard.vo.DashboardStatsVO;
import com.company.wxplatform.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public DashboardStatsVO getDashboardStats() {
        long totalUsers = userRepository.countTotalUsers() + adminRepository.count();
        long dailyActiveUsers = userRepository.countDailyActiveUsers();
        long todayNewUsers = userRepository.countTodayNewUsers();
        return new DashboardStatsVO(totalUsers, dailyActiveUsers, todayNewUsers);
    }
}
