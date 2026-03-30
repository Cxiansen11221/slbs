package com.company.wxplatform.modules.user.service.impl;

import com.company.wxplatform.modules.user.entity.User;
import com.company.wxplatform.modules.user.repository.UserRepository;
import com.company.wxplatform.modules.user.service.UserService;
import com.company.wxplatform.modules.user.vo.UserInfoVO;
import com.company.wxplatform.modules.user.vo.UserSummaryVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserInfoVO getLoginData() {
        Optional<User> optionalUser = userRepository.findById(1L);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            String sex = user.getGender() == null ? "Unknown" : (user.getGender() == 1 ? "Male" : (user.getGender() == 2 ? "Female" : "Unknown"));
            return new UserInfoVO(
                    user.getUserId(),
                    user.getRealName(),
                    user.getUsername(),
                    user.getPhone(),
                    user.getEmail(),
                    formatDate(user.getBirthday()),
                    user.getGender(),
                    sex,
                    "USER",
                    "User",
                    user.getAvatarUrl(),
                    user.getEmergencyContact(),
                    user.getLastLoginTime() != null ? user.getLastLoginTime().toString() : null
            );
        }

        return new UserInfoVO(
                1L,
                "System Admin",
                "admin",
                "13800138000",
                "admin@example.com",
                null,
                null,
                "Unknown",
                "ADMIN",
                "Administrator",
                null,
                null,
                null
        );
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByUsername(username.trim());
    }

    @Override
    public User authenticate(String username, String password) {
        String encryptedPassword = md5Encrypt(password);
        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword() != null &&
                        (user.getPassword().equals(password) || user.getPassword().equals(encryptedPassword)))
                .orElse(null);
    }

    @Override
    public User register(User user) {
        user.setRegisterTime(new Date());
        user.setLastLoginTime(new Date());
        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        if (user.getAuthStatus() == null) {
            user.setAuthStatus(0);
        }
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(md5Encrypt(user.getPassword()));
        }
        if (user.getPhone() != null && !user.getPhone().isBlank()) {
            user.setPhone(base64Encode(user.getPhone()));
        }
        return userRepository.save(user);
    }

    @Override
    public List<UserSummaryVO> getUserList(int page, int size) {
        return userRepository.findAll(PageRequest.of(page - 1, size))
                .stream()
                .map(user -> new UserSummaryVO(
                        user.getUserId(),
                        user.getUsername(),
                        user.getRealName(),
                        user.getPhone(),
                        user.getStatus() != null && user.getStatus() == 1 ? "Active" : "Disabled",
                        user.getLastLoginTime() != null ? user.getLastLoginTime().toString() : null
                ))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    @Override
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public int getUserCount() {
        return (int) userRepository.count();
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

    private String formatDate(Date date) {
        if (date == null) return null;
        return new SimpleDateFormat("yyyy-MM-dd").format(date);
    }

    private String base64Encode(String value) {
        return java.util.Base64.getEncoder().encodeToString(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
