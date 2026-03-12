package com.company.wxplatform.modules.admin.service.impl;

import com.company.wxplatform.modules.admin.entity.Admin;
import com.company.wxplatform.modules.admin.repository.AdminRepository;
import com.company.wxplatform.modules.admin.service.AdminService;
import com.company.wxplatform.modules.admin.vo.AdminUserVO;
import com.company.wxplatform.modules.user.entity.User;
import com.company.wxplatform.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public AdminServiceImpl(AdminRepository adminRepository, UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Admin login(String username, String password) {
        Admin admin = adminRepository.findByUsername(username);
        if (admin == null) {
            return null;
        }

        String encryptedPassword = md5Encrypt(password);
        if (!admin.getPassword().equals(encryptedPassword) && !admin.getPassword().equals(password)) {
            return null;
        }

        return admin;
    }

    @Override
    public List<AdminUserVO> getUsers() {
        List<AdminUserVO> userList = new ArrayList<>();

        List<Admin> admins = adminRepository.findAll();
        for (Admin admin : admins) {
            AdminUserVO vo = new AdminUserVO();
            vo.setId(admin.getAdminId());
            vo.setUsername(admin.getUsername());
            vo.setNickname(admin.getName());
            vo.setStatus(admin.getStatus() != null && admin.getStatus() == 1 ? "active" : "inactive");
            vo.setUserType("admin");
            if (admin.getLastOperationTime() != null) {
                vo.setLastLoginTime(admin.getLastOperationTime().toString());
            }
            userList.add(vo);
        }

        List<User> users = userRepository.findAll();
        for (User user : users) {
            AdminUserVO vo = new AdminUserVO();
            vo.setId(user.getUserId());
            vo.setUsername(user.getUsername());
            vo.setNickname(user.getRealName());
            vo.setStatus(user.getStatus() != null && user.getStatus() == 1 ? "active" : "inactive");
            vo.setUserType("user");
            if (user.getLastLoginTime() != null) {
                vo.setLastLoginTime(user.getLastLoginTime().toString());
            }
            userList.add(vo);
        }

        return userList;
    }

    @Override
    public Admin getAdminByUsername(String username) {
        return adminRepository.findByUsername(username);
    }

    @Override
    public void updateAdmin(Admin admin) {
        adminRepository.save(admin);
    }

    private String md5Encrypt(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 encryption failed", e);
        }
    }
}
