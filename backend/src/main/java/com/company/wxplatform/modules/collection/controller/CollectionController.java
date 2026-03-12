package com.company.wxplatform.modules.collection.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.collection.service.CollectionService;
import com.company.wxplatform.modules.collection.vo.CollectionItemVO;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collection")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @PostMapping("/findAll")
    public ApiResponse<List<CollectionItemVO>> findAll(@RequestBody Map<String, Object> request) {
        Long userId = toLong(request.get("userId"));
        if (userId == null) {
            return ApiResponse.error("userId is required");
        }
        return ApiResponse.success("Find collection list success", collectionService.findAll(userId));
    }

    @PostMapping("/save")
    public ApiResponse<Void> save(@RequestBody Map<String, Object> request) {
        Long userId = toLong(request.get("userId"));
        Long vehicleId = toLong(request.get("vehicleId"));
        if (userId == null || vehicleId == null) {
            return ApiResponse.error("userId and vehicleId are required");
        }
        collectionService.save(userId, vehicleId);
        return ApiResponse.success("Save collection success");
    }

    @PostMapping("/delete")
    public ApiResponse<Void> delete(@RequestBody Map<String, Object> request) {
        Long userId = toLong(request.get("userId"));
        Long vehicleId = toLong(request.get("vehicleId"));
        if (userId == null || vehicleId == null) {
            return ApiResponse.error("userId and vehicleId are required");
        }
        collectionService.delete(userId, vehicleId);
        return ApiResponse.success("Delete collection success");
    }

    @PostMapping("/count")
    public ApiResponse<Long> count(@RequestBody Map<String, Object> request) {
        Long userId = toLong(request.get("userId"));
        if (userId == null) {
            return ApiResponse.error("userId is required");
        }
        return ApiResponse.success("Get collection count success", collectionService.count(userId));
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
