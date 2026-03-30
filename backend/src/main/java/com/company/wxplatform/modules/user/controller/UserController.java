package com.company.wxplatform.modules.user.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.auth.vo.LoginVO;
import com.company.wxplatform.modules.user.entity.User;
import com.company.wxplatform.modules.user.service.UserService;
import com.company.wxplatform.modules.user.vo.UserInfoVO;
import com.company.wxplatform.modules.user.vo.UserSummaryVO;
import com.company.wxplatform.modules.wechat.dto.WxLoginRequest;
import com.company.wxplatform.modules.wechat.service.WxAuthService;
import com.company.wxplatform.modules.wechat.vo.WxLoginVO;
import com.company.wxplatform.infrastructure.security.TokenService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final WxAuthService wxAuthService;
    private final TokenService tokenService;

    public UserController(UserService userService, WxAuthService wxAuthService, TokenService tokenService) {
        this.userService = userService;
        this.wxAuthService = wxAuthService;
        this.tokenService = tokenService;
    }

    @PostMapping("/getLoginData")
    public ApiResponse<UserInfoVO> getLoginData(@RequestBody(required = false) Map<String, String> request) {
        String username = request == null ? null : request.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ApiResponse.error("User not found");
        }

        Optional<User> userOpt = userService.getUserByUsername(username);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found");
        }
        User user = userOpt.get();
        String sex = user.getGender() == null ? "Unknown" : (user.getGender() == 1 ? "Male" : (user.getGender() == 2 ? "Female" : "Unknown"));
        UserInfoVO info = new UserInfoVO(
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
                user.getOpenId()
        );
        return ApiResponse.success("Get login data success", info);
    }

    @PostMapping("/auth/login")
    public ApiResponse<LoginVO> login(@RequestBody Map<String, String> request) {
        String username = request.getOrDefault("username", "").trim();
        String password = request.getOrDefault("password", "");
        if (username.isEmpty() || password.isEmpty()) {
            return ApiResponse.error("Invalid username or password");
        }

        User user = userService.authenticate(username, password);
        if (user == null) {
            return ApiResponse.error("Invalid username or password");
        }

        String subject = user.getUsername() + ":USER";
        String token = tokenService.generateToken(subject);
        LoginVO loginVO = new LoginVO(token, tokenService.getTokenExpireSeconds(), "USER", user.getUsername());
        return ApiResponse.success("Login success", loginVO);
    }

    // 小程序微信登录（真实 code2session 链路）
    @PostMapping("/login")
    public ApiResponse<WxLoginVO> miniProgramLogin(@RequestBody(required = false) Map<String, Object> request) {
        String code = request == null ? "" : toStringValue(request.get("code"));
        if (code == null || code.isEmpty()) {
            return ApiResponse.error("code is required");
        }

        String nickname = toStringValue(request.get("nickname"));
        if (nickname == null) {
            nickname = toStringValue(request.get("nickName"));
        }
        String avatarUrl = toStringValue(request.get("avatarUrl"));
        Integer gender = toInteger(request == null ? null : request.get("gender"));

        WxLoginRequest wxReq = new WxLoginRequest(code, nickname, avatarUrl, gender);
        return ApiResponse.success("Login success", wxAuthService.login(wxReq));
    }

    @PostMapping("/wechatSave")
    public ApiResponse<UserInfoVO> wechatSave(@RequestBody Map<String, Object> request) {
        Long userId = toLong(request.get("id"));
        if (userId == null) {
            return ApiResponse.error("User id is required");
        }

        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found");
        }

        User user = userOpt.get();
        String name = toStringValue(request.get("name"));
        String mobile = toStringValue(request.get("mobile"));
        String email = toStringValue(request.get("email"));
        String address = toStringValue(request.get("address"));
        String headUrl = toStringValue(request.get("headUrl"));
        Integer sex = toInteger(request.get("sex"));
        Date birthday = parseDate(toStringValue(request.get("birthday")));

        if (name != null) user.setRealName(name);
        if (mobile != null) user.setPhone(mobile);
        if (email != null) user.setEmail(email);
        if (address != null) user.setEmergencyContact(address);
        if (headUrl != null) user.setAvatarUrl(headUrl);
        if (sex != null) user.setGender(sex);
        if (birthday != null) user.setBirthday(birthday);

        User saved = userService.updateUser(user);
        String genderText = saved.getGender() == null ? "Unknown" : (saved.getGender() == 1 ? "Male" : (saved.getGender() == 2 ? "Female" : "Unknown"));
        UserInfoVO info = new UserInfoVO(
                saved.getUserId(),
                saved.getRealName(),
                saved.getUsername(),
                saved.getPhone(),
                saved.getEmail(),
                formatDate(saved.getBirthday()),
                saved.getGender(),
                genderText,
                "USER",
                "User",
                saved.getAvatarUrl(),
                saved.getEmergencyContact(),
                saved.getOpenId()
        );
        return ApiResponse.success("Wechat save success", info);
    }

    @PostMapping("/getUserNumber")
    public ApiResponse<Integer> getUserNumber() {
        return ApiResponse.success("Get user number success", userService.getUserCount());
    }

    @PostMapping("/uploadHead")
    public ApiResponse<String> uploadHead(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "username", required = false) String username
    ) {
        if (file == null || file.isEmpty()) {
            return ApiResponse.error("File is required");
        }
        try {
            String originalName = file.getOriginalFilename();
            String ext = ".jpg";
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf('.'));
            }
            String filename = UUID.randomUUID().toString().replace("-", "") + ext;
            Path uploadDir = Paths.get("uploads", "avatars").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            file.transferTo(target.toFile());
            String avatarUrl = "/api/user/avatar/" + filename;
            Optional<User> userOpt = Optional.empty();
            if (userId != null) {
                userOpt = userService.getUserById(userId);
            }
            if (userOpt.isEmpty() && username != null && !username.trim().isEmpty()) {
                userOpt = userService.getUserByUsername(username.trim());
            }
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setAvatarUrl(avatarUrl);
                userService.updateUser(user);
            }
            return ApiResponse.success("Upload head success", avatarUrl);
        } catch (IOException e) {
            return ApiResponse.error("Upload failed");
        }
    }

    @GetMapping("/avatar/{fileName:.+}")
    public ResponseEntity<Resource> avatar(@PathVariable String fileName) {
        try {
            Path uploadDir = Paths.get("uploads", "avatars").toAbsolutePath().normalize();
            Path filePath = uploadDir.resolve(fileName).normalize();
            if (!filePath.startsWith(uploadDir) || !Files.exists(filePath) || !Files.isRegularFile(filePath)) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            MediaType mediaType = (contentType == null || contentType.isBlank())
                    ? MediaType.APPLICATION_OCTET_STREAM
                    : MediaType.parseMediaType(contentType);
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 用户管理相关接口
    @GetMapping("/list")
    public ApiResponse<List<UserSummaryVO>> getUserList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Get user list success", userService.getUserList(page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ApiResponse.success("Get user success", user))
                .orElse(ApiResponse.error("User not found"));
    }

    @PostMapping("/register")
    public ApiResponse<User> register(@RequestBody User user) {
        if (user == null || user.getUsername() == null || user.getUsername().trim().isEmpty()
                || user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ApiResponse.error("Username and password are required");
        }
        String username = user.getUsername().trim();
        if (userService.getUserByUsername(username).isPresent()) {
            return ApiResponse.error("Username already exists");
        }
        user.setUsername(username);
        User saved = userService.register(user);
        if (saved != null) {
            saved.setPassword(null);
        }
        return ApiResponse.success("Register success", saved);
    }

    @PutMapping("/{id}")
    public ApiResponse<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setUserId(id);
        return ApiResponse.success("Update user success", userService.updateUser(user));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success("Delete user success");
    }

    @GetMapping("/count")
    public ApiResponse<Integer> getCount() {
        return ApiResponse.success("Get user count success", userService.getUserCount());
    }

    private static String toStringValue(Object obj) {
        if (obj == null) return null;
        String text = String.valueOf(obj).trim();
        return text.isEmpty() ? null : text;
    }

    private static Long toLong(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number number) return number.longValue();
        try {
            return Long.parseLong(String.valueOf(obj).trim());
        } catch (Exception e) {
            return null;
        }
    }

    private static Integer toInteger(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number number) return number.intValue();
        try {
            return Integer.parseInt(String.valueOf(obj).trim());
        } catch (Exception e) {
            return null;
        }
    }

    private static Date parseDate(String text) {
        if (text == null) return null;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            sdf.setLenient(false);
            return sdf.parse(text);
        } catch (ParseException e) {
            return null;
        }
    }

    private static String formatDate(Date date) {
        if (date == null) return null;
        return new SimpleDateFormat("yyyy-MM-dd").format(date);
    }
}
