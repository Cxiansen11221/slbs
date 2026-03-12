package com.company.wxplatform.modules.dashboard.vo;

public class DashboardStatsVO {
    private long totalUsers;
    private long dailyActiveUsers;
    private long todayNewUsers;

    public DashboardStatsVO(long totalUsers, long dailyActiveUsers, long todayNewUsers) {
        this.totalUsers = totalUsers;
        this.dailyActiveUsers = dailyActiveUsers;
        this.todayNewUsers = todayNewUsers;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getDailyActiveUsers() {
        return dailyActiveUsers;
    }

    public void setDailyActiveUsers(long dailyActiveUsers) {
        this.dailyActiveUsers = dailyActiveUsers;
    }

    public long getTodayNewUsers() {
        return todayNewUsers;
    }

    public void setTodayNewUsers(long todayNewUsers) {
        this.todayNewUsers = todayNewUsers;
    }
}