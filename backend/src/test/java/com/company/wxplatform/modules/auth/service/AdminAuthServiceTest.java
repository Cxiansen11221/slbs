package com.company.wxplatform.modules.auth.service;

import com.company.wxplatform.infrastructure.security.TokenService;
import com.company.wxplatform.modules.auth.dto.AdminLoginRequest;
import com.company.wxplatform.modules.auth.service.impl.AdminAuthServiceImpl;
import com.company.wxplatform.modules.auth.vo.LoginVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class AdminAuthServiceTest {

    @Mock
    private TokenService tokenService;

    private AdminAuthService adminAuthService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        adminAuthService = new AdminAuthServiceImpl(tokenService);
    }

    @Test
    void testLoginSuccess() {
        // Given
        AdminLoginRequest request = new AdminLoginRequest("admin", "123456");
        String expectedToken = "test-token";
        long expireSeconds = 7200;
        
        when(tokenService.generateToken("admin:admin")).thenReturn(expectedToken);
        when(tokenService.getTokenExpireSeconds()).thenReturn(expireSeconds);

        // When
        LoginVO result = adminAuthService.login(request);

        // Then
        assertNotNull(result);
        assertEquals(expectedToken, result.token());
        assertEquals(expireSeconds, result.expiresIn());
        assertEquals("ADMIN", result.role());
        assertEquals("admin", result.username());
    }

    @Test
    void testLoginFailure() {
        // Given
        AdminLoginRequest request = new AdminLoginRequest("admin", "wrong-password");

        // When & Then
        assertThrows(RuntimeException.class, () -> adminAuthService.login(request));
    }
}