package com.company.wxplatform.modules.vehicle.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.vehicle.dto.HomeContentDTO;
import com.company.wxplatform.modules.vehicle.dto.VehicleDTO;
import com.company.wxplatform.modules.vehicle.entity.Vehicle;
import com.company.wxplatform.modules.vehicle.entity.VehicleMaintenance;
import com.company.wxplatform.modules.vehicle.entity.VehicleStatus;
import com.company.wxplatform.modules.vehicle.service.HomeContentService;
import com.company.wxplatform.modules.vehicle.service.VehicleService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle")
public class VehicleController {

    private final VehicleService vehicleService;
    private final HomeContentService homeContentService;

    public VehicleController(VehicleService vehicleService, HomeContentService homeContentService) {
        this.vehicleService = vehicleService;
        this.homeContentService = homeContentService;
    }

    @PostMapping("/create")
    public ApiResponse<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        return ApiResponse.success("Create vehicle success", vehicleService.createVehicle(vehicle));
    }

    @PutMapping("/{id}")
    public ApiResponse<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        vehicle.setVehicleId(id);
        return ApiResponse.success("Update vehicle success", vehicleService.updateVehicle(vehicle));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ApiResponse.success("Delete vehicle success");
    }

    @GetMapping("/{id}")
    public ApiResponse<VehicleDTO> getVehicleById(@PathVariable Long id) {
        return vehicleService.getVehicleDTOById(id)
                .map(vehicle -> ApiResponse.success("Get vehicle success", vehicle))
                .orElse(ApiResponse.error("Vehicle not found"));
    }

    @GetMapping("/list")
    public ApiResponse<List<VehicleDTO>> getVehicleList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String vehicleNumber,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer status) {
        return ApiResponse.success("Get vehicle list success", vehicleService.getVehicleDTOList(page, size, vehicleNumber, brand, status));
    }

    @GetMapping("/count")
    public ApiResponse<Integer> getVehicleCount() {
        return ApiResponse.success("Get vehicle count success", vehicleService.getVehicleCount());
    }

    @GetMapping("/home-content")
    public ApiResponse<HomeContentDTO> getHomeContent() {
        return ApiResponse.success("Get home content success", homeContentService.getHomeContent());
    }

    @GetMapping("/home-content/notices")
    public ApiResponse<List<HomeContentDTO.NoticeItem>> listNotices() {
        return ApiResponse.success("Get notices success", homeContentService.listNotices());
    }

    @PostMapping("/home-content/notices")
    public ApiResponse<HomeContentDTO.NoticeItem> createNotice(@RequestBody HomeContentDTO.NoticeItem request) {
        return ApiResponse.success("Create notice success", homeContentService.createNotice(request));
    }

    @PutMapping("/home-content/notices/{id}")
    public ApiResponse<HomeContentDTO.NoticeItem> updateNotice(
            @PathVariable Long id,
            @RequestBody HomeContentDTO.NoticeItem request) {
        return ApiResponse.success("Update notice success", homeContentService.updateNotice(id, request));
    }

    @DeleteMapping("/home-content/notices/{id}")
    public ApiResponse<Void> deleteNotice(@PathVariable Long id) {
        homeContentService.deleteNotice(id);
        return ApiResponse.success("Delete notice success");
    }

    @GetMapping("/home-content/recommends")
    public ApiResponse<List<HomeContentDTO.RecommendItem>> listRecommends() {
        return ApiResponse.success("Get recommend items success", homeContentService.listRecommends());
    }

    @PostMapping("/home-content/recommends")
    public ApiResponse<HomeContentDTO.RecommendItem> createRecommend(@RequestBody HomeContentDTO.RecommendItem request) {
        return ApiResponse.success("Create recommend item success", homeContentService.createRecommend(request));
    }

    @PutMapping("/home-content/recommends/{id}")
    public ApiResponse<HomeContentDTO.RecommendItem> updateRecommend(
            @PathVariable Long id,
            @RequestBody HomeContentDTO.RecommendItem request) {
        return ApiResponse.success("Update recommend item success", homeContentService.updateRecommend(id, request));
    }

    @DeleteMapping("/home-content/recommends/{id}")
    public ApiResponse<Void> deleteRecommend(@PathVariable Long id) {
        homeContentService.deleteRecommend(id);
        return ApiResponse.success("Delete recommend item success");
    }

    @GetMapping("/status/{vehicleId}")
    public ApiResponse<VehicleStatus> getVehicleStatus(@PathVariable Long vehicleId) {
        VehicleStatus status = vehicleService.getVehicleStatus(vehicleId);
        return status != null
                ? ApiResponse.success("Get vehicle status success", status)
                : ApiResponse.error("Vehicle status not found");
    }

    @PutMapping("/status/{vehicleId}")
    public ApiResponse<VehicleStatus> updateVehicleStatus(@PathVariable Long vehicleId, @RequestBody VehicleStatus status) {
        status.setVehicleId(vehicleId);
        return ApiResponse.success("Update vehicle status success", vehicleService.updateVehicleStatus(status));
    }

    @PostMapping("/maintenance/create")
    public ApiResponse<VehicleMaintenance> createMaintenanceRecord(@RequestBody VehicleMaintenance maintenance) {
        return ApiResponse.success("Create maintenance record success", vehicleService.createMaintenanceRecord(maintenance));
    }

    @PutMapping("/maintenance/{id}")
    public ApiResponse<VehicleMaintenance> updateMaintenanceRecord(@PathVariable Long id, @RequestBody VehicleMaintenance maintenance) {
        maintenance.setMaintenanceId(id);
        return ApiResponse.success("Update maintenance record success", vehicleService.updateMaintenanceRecord(maintenance));
    }

    @GetMapping("/maintenance/vehicle/{vehicleId}")
    public ApiResponse<List<VehicleMaintenance>> getMaintenanceRecordsByVehicleId(@PathVariable Long vehicleId) {
        return ApiResponse.success("Get maintenance records success", vehicleService.getMaintenanceRecordsByVehicleId(vehicleId));
    }

    @GetMapping("/maintenance/list")
    public ApiResponse<List<VehicleMaintenance>> getMaintenanceRecords(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Get maintenance records success", vehicleService.getMaintenanceRecords(page, size));
    }
}
