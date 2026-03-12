package com.company.wxplatform.modules.wechat.service.impl;

import com.company.wxplatform.common.exception.BusinessException;
import com.company.wxplatform.infrastructure.security.TokenService;
import com.company.wxplatform.modules.user.entity.User;
import com.company.wxplatform.modules.user.repository.UserRepository;
import com.company.wxplatform.modules.wechat.config.WechatMiniProgramProperties;
import com.company.wxplatform.modules.wechat.dto.WxLoginRequest;
import com.company.wxplatform.modules.wechat.service.WxAuthService;
import com.company.wxplatform.modules.wechat.vo.WxLoginVO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

@Service
public class WxAuthServiceImpl implements WxAuthService {

    private static final String CODE_2_SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session";

    private final WechatMiniProgramProperties wechatProperties;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WxAuthServiceImpl(
            WechatMiniProgramProperties wechatProperties,
            UserRepository userRepository,
            TokenService tokenService
    ) {
        this.wechatProperties = wechatProperties;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }

    @Override
    public WxLoginVO login(WxLoginRequest request) {
        if (!StringUtils.hasText(wechatProperties.getAppId()) || !StringUtils.hasText(wechatProperties.getAppSecret())) {
            throw new BusinessException("WeChat appId/appSecret is not configured");
        }

        String url = UriComponentsBuilder.fromHttpUrl(CODE_2_SESSION_URL)
                .queryParam("appid", wechatProperties.getAppId())
                .queryParam("secret", wechatProperties.getAppSecret())
                .queryParam("js_code", request.code())
                .queryParam("grant_type", "authorization_code")
                .build(true)
                .toUriString();

        Map<String, Object> body;
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            body = parseWechatResponse(response.getBody());
        } catch (RestClientException ex) {
            throw new BusinessException("Call WeChat code2session failed: " + ex.getMessage());
        }

        if (body == null) {
            throw new BusinessException("Empty response from WeChat");
        }

        int errCode = parseErrCode(body.get("errcode"));
        if (errCode != 0) {
            String errMsg = String.valueOf(body.getOrDefault("errmsg", "unknown"));
            throw new BusinessException("WeChat login failed: " + errCode + " " + errMsg);
        }

        String openId = String.valueOf(body.getOrDefault("openid", ""));
        if (!StringUtils.hasText(openId)) {
            throw new BusinessException("WeChat openid is missing");
        }

        User user = findOrCreateUser(openId, request);
        user.setLastLoginTime(new Date());
        User saved = userRepository.save(user);

        String subject = "wechat:" + openId + ":" + saved.getUserId();
        String token = tokenService.generateToken(subject);

        String nickname = StringUtils.hasText(saved.getRealName()) ? saved.getRealName() : saved.getUsername();
        return new WxLoginVO(
                token,
                tokenService.getTokenExpireSeconds(),
                openId,
                saved.getUserId(),
                saved.getUsername(),
                nickname,
                saved.getAvatarUrl()
        );
    }

    private User findOrCreateUser(String openId, WxLoginRequest request) {
        Optional<User> userOpt = userRepository.findByOpenId(openId);
        if (userOpt.isPresent()) {
            User existing = userOpt.get();
            mergeProfile(existing, request);
            return existing;
        }

        User user = new User();
        user.setOpenId(openId);
        user.setUsername(generateUniqueUsername(openId));
        user.setPassword(md5(openId + ":" + Instant.now().toEpochMilli()));
        user.setPhone(generatePseudoPhone(openId));
        user.setStatus(1);
        user.setAuthStatus(0);
        user.setCreditScore(100);
        user.setRegisterTime(new Date());
        user.setLastLoginTime(new Date());
        mergeProfile(user, request);
        return user;
    }

    private void mergeProfile(User user, WxLoginRequest request) {
        if (request == null) {
            return;
        }
        String currentName = user.getRealName();
        // 避免每次登录覆盖用户手动修改的姓名
        if (!StringUtils.hasText(currentName)) {
            if (StringUtils.hasText(request.nickname())) {
                user.setRealName(request.nickname());
            } else {
                user.setRealName("微信用户");
            }
        }

        String currentAvatar = user.getAvatarUrl();
        boolean hasManualAvatar = StringUtils.hasText(currentAvatar)
                && (currentAvatar.startsWith("/api/user/avatar/")
                || currentAvatar.startsWith("/uploads/")
                || currentAvatar.contains("/api/user/avatar/"));
        // 避免每次登录覆盖用户上传头像
        if (!hasManualAvatar && !StringUtils.hasText(currentAvatar) && StringUtils.hasText(request.avatarUrl())) {
            user.setAvatarUrl(request.avatarUrl());
        }
        if (request.gender() != null) {
            user.setGender(request.gender());
        }
    }

    private String generateUniqueUsername(String openId) {
        String base = "wx_" + openId;
        if (base.length() > 50) {
            base = base.substring(0, 50);
        }
        String candidate = base;
        int suffix = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            String postfix = "_" + suffix++;
            int maxLen = 50 - postfix.length();
            String prefix = base.length() > maxLen ? base.substring(0, maxLen) : base;
            candidate = prefix + postfix;
        }
        return candidate;
    }

    private String generatePseudoPhone(String openId) {
        long hash = Math.abs((long) openId.hashCode());
        String candidate = String.format("1%010d", hash % 10_000_000_000L);
        while (existsPhone(candidate)) {
            hash += 97;
            candidate = String.format("1%010d", hash % 10_000_000_000L);
        }
        return candidate;
    }

    private boolean existsPhone(String phone) {
        return userRepository.findByPhone(phone).isPresent();
    }

    private String md5(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new BusinessException("Generate password hash failed");
        }
    }

    private int parseErrCode(Object rawErrCode) {
        if (rawErrCode == null) {
            return 0;
        }
        if (rawErrCode instanceof Number num) {
            return num.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(rawErrCode));
        } catch (Exception ex) {
            return -1;
        }
    }

    private Map<String, Object> parseWechatResponse(String body) {
        if (!StringUtils.hasText(body)) {
            throw new BusinessException("Empty response from WeChat");
        }
        try {
            return objectMapper.readValue(body, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            throw new BusinessException("Invalid WeChat response: " + body);
        }
    }
}
