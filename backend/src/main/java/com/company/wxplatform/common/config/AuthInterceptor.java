package com.company.wxplatform.common.config;

import com.company.wxplatform.infrastructure.security.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final TokenService tokenService;

    public AuthInterceptor(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        try {
            String path = request.getServletPath();
            
            // 白名单：不需要认证的路径
            if (path.startsWith("/actuator/") ||
                path.startsWith("/api/admin/auth/") ||
                path.startsWith("/api/admin/users") ||
                path.startsWith("/api/wechat/auth/") ||
                path.startsWith("/api/message/") ||
                path.startsWith("/api/user/") ||
                path.startsWith("/api/dashboard/") ||
                path.startsWith("/api/vehicle/") ||
                path.startsWith("/api/collection") ||
                path.startsWith("/api/collection/") ||
                path.startsWith("/api/order/") ||
                path.startsWith("/api/deposit/") ||
                path.startsWith("/api/electricVehicleResource/") ||
                path.startsWith("/api/pic/")) {
                return true;
            }

            // 从请求头获取 token
            String token = request.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Unauthorized\",\"data\":null}");
                return false;
            }

            token = token.substring(7); // 移除 "Bearer " 前缀
            if (!tokenService.isValid(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Invalid token\",\"data\":null}");
                return false;
            }

            return true;
        } catch (Exception e) {
            // 处理异常，避免拦截器崩溃
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Internal server error\",\"data\":null}");
            return false;
        }
    }
}
