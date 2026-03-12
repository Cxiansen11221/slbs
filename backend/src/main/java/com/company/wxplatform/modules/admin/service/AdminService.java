package com.company.wxplatform.modules.admin.service;

import com.company.wxplatform.modules.admin.entity.Admin;
import com.company.wxplatform.modules.admin.vo.AdminUserVO;

import java.util.List;

public interface AdminService {

    Admin login(String username, String password);

    List<AdminUserVO> getUsers();

    Admin getAdminByUsername(String username);

    void updateAdmin(Admin admin);
}