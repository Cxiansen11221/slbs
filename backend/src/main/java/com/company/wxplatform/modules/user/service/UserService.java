package com.company.wxplatform.modules.user.service;

import com.company.wxplatform.modules.user.entity.User;
import com.company.wxplatform.modules.user.vo.UserInfoVO;
import com.company.wxplatform.modules.user.vo.UserSummaryVO;

import java.util.List;
import java.util.Optional;

public interface UserService {

    UserInfoVO getLoginData();
    Optional<User> getUserByUsername(String username);

    // 用户认证相关
    User authenticate(String username, String password);
    User register(User user);
    
    // 用户管理相关
    List<UserSummaryVO> getUserList(int page, int size);
    Optional<User> getUserById(Long userId);
    User updateUser(User user);
    void deleteUser(Long userId);
    int getUserCount();

}
