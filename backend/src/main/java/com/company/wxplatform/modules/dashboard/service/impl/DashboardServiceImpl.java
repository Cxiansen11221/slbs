package com.company.wxplatform.modules.dashboard.service.impl;

import com.company.wxplatform.modules.dashboard.service.DashboardService;
import com.company.wxplatform.modules.dashboard.vo.DashboardStatsVO;
import com.company.wxplatform.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public DashboardStatsVO getDashboardStats() {
        long totalUsers = userRepository.countTotalUsers();
        long dailyActiveUsers = userRepository.countDailyActiveUsers();
        long todayNewUsers = userRepository.countTodayNewUsers();
        return new DashboardStatsVO(totalUsers, dailyActiveUsers, todayNewUsers);
    }
}
