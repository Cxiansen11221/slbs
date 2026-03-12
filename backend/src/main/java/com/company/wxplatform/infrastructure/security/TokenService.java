package com.company.wxplatform.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class TokenService {

    @Value("${app.security.token-secret}")
    private String tokenSecret;

    @Value("${app.security.token-expire-seconds}")
    private long tokenExpireSeconds;

    public String generateToken(String subject) {
        long expiresAt = Instant.now().getEpochSecond() + tokenExpireSeconds;
        String raw = subject + "|" + expiresAt + "|" + tokenSecret;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    public boolean isValid(String token) {
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(token), StandardCharsets.UTF_8);
            String[] parts = decoded.split("\\|");
            if (parts.length != 3) {
                return false;
            }
            long expiresAt = Long.parseLong(parts[1]);
            return tokenSecret.equals(parts[2]) && expiresAt > Instant.now().getEpochSecond();
        } catch (Exception ex) {
            return false;
        }
    }

    public String getSubject(String token) {
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(token), StandardCharsets.UTF_8);
            String[] parts = decoded.split("\\|");
            if (parts.length != 3) {
                return null;
            }
            return parts[0];
        } catch (Exception ex) {
            return null;
        }
    }

    public long getTokenExpireSeconds() {
        return tokenExpireSeconds;
    }
}

