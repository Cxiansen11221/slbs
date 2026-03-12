package com.company.wxplatform.modules.viewed.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.viewed.service.ViewedService;
import com.company.wxplatform.modules.viewed.vo.ViewedItemVO;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/viewed")
public class ViewedController {

    private final ViewedService viewedService;

    public ViewedController(ViewedService viewedService) {
        this.viewedService = viewedService;
    }

    @PostMapping("/save")
    public ApiResponse<Void> save(@RequestBody Map<String, Object> request) {
        Long userId = toLong(request.get("userId"));
        Long vehicleId = toLong(request.get("vehicleId"));
        if (userId == null || vehicleId == null) {
            return ApiResponse.error("userId and vehicleId are required");
        }
        viewedService.save(userId, vehicleId);
        return ApiResponse.success("Save viewed success");
    }

    @PostMapping("/findAll")
    public ApiResponse<List<ViewedItemVO>> findAll(@RequestBody Map<String, Object> request) {
        Long userId = toLong(request.get("userId"));
        if (userId == null) {
            return ApiResponse.error("userId is required");
        }
        return ApiResponse.success("Find viewed list success", viewedService.findAll(userId));
    }

    @PostMapping("/count")
    public ApiResponse<Long> count(@RequestBody Map<String, Object> request) {
        Long userId = toLong(request.get("userId"));
        if (userId == null) {
            return ApiResponse.error("userId is required");
        }
        return ApiResponse.success("Get viewed count success", viewedService.count(userId));
    }

    private static Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.longValue();
        try {
            return Long.parseLong(String.valueOf(value).trim());
        } catch (Exception e) {
            return null;
        }
    }
}

