package com.company.wxplatform.common.init;

import com.company.wxplatform.modules.admin.entity.Admin;
import com.company.wxplatform.modules.admin.repository.AdminRepository;
import com.company.wxplatform.modules.deposit.entity.Deposit;
import com.company.wxplatform.modules.deposit.repository.DepositRepository;
import com.company.wxplatform.modules.message.entity.SystemAnnouncement;
import com.company.wxplatform.modules.message.repository.SystemAnnouncementRepository;
import com.company.wxplatform.modules.order.entity.Order;
import com.company.wxplatform.modules.order.repository.OrderRepository;
import com.company.wxplatform.modules.user.entity.User;
import com.company.wxplatform.modules.user.repository.UserRepository;
import com.company.wxplatform.modules.vehicle.entity.HomeRecommend;
import com.company.wxplatform.modules.vehicle.entity.Vehicle;
import com.company.wxplatform.modules.vehicle.entity.VehicleStatus;
import com.company.wxplatform.modules.vehicle.repository.HomeRecommendRepository;
import com.company.wxplatform.modules.vehicle.repository.VehicleRepository;
import com.company.wxplatform.modules.vehicle.repository.VehicleStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleStatusRepository vehicleStatusRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DepositRepository depositRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private SystemAnnouncementRepository announcementRepository;

    @Autowired
    private HomeRecommendRepository homeRecommendRepository;

    @Override
    public void run(String... args) {
        try {
            initializeAdmin();
            List<User> users = initializeUsers();
            initializeVehicles();
            initializeOrders();
            initializeDeposits(users);
            initializeHomeContent();
        } catch (Exception e) {
            System.out.println("Data initialization failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void initializeAdmin() {
        Admin admin = adminRepository.findByUsername("admin");
        if (admin == null) {
            admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword("123456");
            admin.setName("Administrator");
            admin.setPhone("13800138000");
            admin.setDepartment("Management");
            admin.setPosition("Super Admin");
            admin.setEntryTime(new Date());
            admin.setRoleId(1L);
            admin.setPermissionScope(1);
            admin.setStatus(1);
            admin.setLastOperationTime(new Date());
            adminRepository.save(admin);
            System.out.println("Admin initialized successfully");
        }
    }

    private List<User> initializeUsers() {
        List<User> users = new ArrayList<>();
        if (userRepository.count() == 0) {
            User user1 = new User();
            user1.setUsername("user1");
            user1.setPassword("123456");
            user1.setPhone("13800138001");
            user1.setRealName("User One");
            user1.setIdCard("110101199001011234");
            user1.setStatus(1);
            user1.setRegisterTime(new Date());
            user1.setLastLoginTime(new Date());
            userRepository.save(user1);
            users.add(user1);

            User user2 = new User();
            user2.setUsername("user2");
            user2.setPassword("123456");
            user2.setPhone("13800138002");
            user2.setRealName("User Two");
            user2.setIdCard("110101199001011235");
            user2.setStatus(1);
            user2.setRegisterTime(new Date());
            user2.setLastLoginTime(new Date());
            userRepository.save(user2);
            users.add(user2);

            User user3 = new User();
            user3.setUsername("user3");
            user3.setPassword("123456");
            user3.setPhone("13800138003");
            user3.setRealName("User Three");
            user3.setIdCard("110101199001011236");
            user3.setStatus(1);
            user3.setRegisterTime(new Date());
            user3.setLastLoginTime(new Date());
            userRepository.save(user3);
            users.add(user3);

            System.out.println("Users initialized successfully");
        } else {
            users = userRepository.findAll();
        }
        return users;
    }

    private void initializeVehicles() {
        if (vehicleRepository.count() == 0) {
            for (int i = 1; i <= 10; i++) {
                Vehicle vehicle = new Vehicle();
                vehicle.setVehicleCode("EV" + String.format("%04d", i));
                vehicle.setVehicleNumber("VN" + String.format("%06d", i));
                vehicle.setVin("VIN" + String.format("%08d", i));
                vehicle.setLicensePlate("A" + String.format("%05d", i));
                vehicle.setBrand("Aima");
                vehicle.setModel("EV Model " + i);
                vehicle.setVehicleType(i % 2 + 1);
                vehicle.setBatteryType(i % 2 + 1);
                vehicle.setBatteryCapacity(20.0);
                vehicle.setRangeMileage(50.0);
                vehicle.setMaxSpeed(40.0);
                vehicle.setSeatCount(2);
                vehicle.setWeight(50.0);
                vehicle.setPurchaseTime(new Date());
                vehicle.setPurchasePrice(2000.0);
                vehicle.setStoreId(1L);
                vehicle.setLaunchTime(new Date());
                vehicle.setFrontImageUrl("https://example.com/vehicle" + i + ".jpg");
                vehicle.setTags("new");
                vehicleRepository.save(vehicle);

                VehicleStatus status = new VehicleStatus();
                status.setVehicleId(vehicle.getVehicleId());
                status.setCurrentStatus(1);
                status.setCurrentLocation("Center Store");
                status.setStoreId(1L);
                status.setBatteryPercentage(100);
                status.setTotalMileage(0.0);
                status.setTotalRentalCount(0);
                status.setLastMaintenanceTime(new Date());
                status.setNextMaintenanceMileage(1000.0);
                status.setLastStatusUpdateTime(new Date());
                vehicleStatusRepository.save(status);
            }
            System.out.println("Vehicles initialized successfully");
        }
    }

    private void initializeOrders() {
        if (orderRepository.count() == 0) {
            for (int i = 1; i <= 5; i++) {
                Order order = new Order();
                order.setOrderCode("DD" + String.valueOf(System.currentTimeMillis()).substring(3)
                        + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
                order.setUserId((long) (i % 3 + 1));
                order.setVehicleId((long) i);
                order.setCreateTime(new Date());
                order.setCreateIp("127.0.0.1");
                order.setRentalType(i % 4 + 1);
                order.setExpectedPickupTime(new Date());
                order.setExpectedReturnTime(new Date(System.currentTimeMillis() + 86400000));
                order.setBaseRent(50.0);
                order.setServiceFee(5.0);
                order.setInsuranceFee(2.0);
                order.setTotalAmount(57.0);
                order.setActualPayAmount(57.0);
                order.setOrderStatus(i % 7 + 1);
                orderRepository.save(order);
            }
            System.out.println("Orders initialized successfully");
        }
    }

    private void initializeDeposits(List<User> users) {
        if (depositRepository.count() == 0 && !users.isEmpty()) {
            for (int i = 0; i < Math.min(3, users.size()); i++) {
                User user = users.get(i);
                Deposit deposit = new Deposit();
                deposit.setUserId(user.getUserId());
                deposit.setDepositAmount(1000.0);
                deposit.setDepositType(1);
                deposit.setDepositStatus(i + 1);
                deposit.setPayTime(new Date());
                if (i == 1) {
                    deposit.setFreezeTime(new Date());
                }
                if (i == 2) {
                    deposit.setRefundApplyTime(new Date());
                    deposit.setRefundAuditTime(new Date());
                    deposit.setRefundCompleteTime(new Date());
                    deposit.setAuditAdminId(1L);
                    deposit.setRefundMethod(1);
                }
                depositRepository.save(deposit);
            }
            System.out.println("Deposits initialized successfully");
        }
    }

    private void initializeHomeContent() {
        if (announcementRepository.count() == 0) {
            SystemAnnouncement notice = new SystemAnnouncement();
            notice.setTitle("\u5468\u672b\u9650\u65f6\u4f18\u60e0\uff1a\u9996\u5355\u6700\u9ad8\u51cf20\u5143");
            notice.setContent("\u6d3b\u52a8\u65f6\u95f4\uff1a08:00-22:00\uff0c\u9650\u6807\u8bc6\u8f66\u578b\u53ef\u4eab\u53d7");
            notice.setAnnouncementType(1);
            notice.setPublisherId(1L);
            notice.setPublishTime(new Date());
            notice.setEffectiveTime(new Date());
            notice.setReadCount(0);
            notice.setStatus(2);
            notice.setIsTop(1);
            notice.setIsPopup(0);
            announcementRepository.save(notice);

            SystemAnnouncement activity = new SystemAnnouncement();
            activity.setTitle("\u65e9\u9ad8\u5cf0\u901a\u52e4\u5361\u4e0a\u7ebf");
            activity.setContent("\u5de5\u4f5c\u65e507:00-10:00\u4e0b\u5355\u53ef\u4eab8\u6298\u4f18\u60e0");
            activity.setAnnouncementType(2);
            activity.setPublisherId(1L);
            activity.setPublishTime(new Date());
            activity.setEffectiveTime(new Date());
            activity.setReadCount(0);
            activity.setStatus(2);
            activity.setIsTop(0);
            activity.setIsPopup(0);
            announcementRepository.save(activity);
            System.out.println("Announcements initialized successfully");
        }

        if (homeRecommendRepository.count() == 0) {
            Date now = new Date();

            HomeRecommend route = new HomeRecommend();
            route.setTitle("\u70ed\u95e8\u8def\u7ebf");
            route.setContent("\u901a\u52e4\u9ad8\u9891\u8def\u7ebf\u63a8\u8350\uff0c\u907f\u5f00\u62e5\u5835\u8def\u6bb5");
            route.setSortOrder(1);
            route.setStatus(1);
            route.setCreateTime(now);
            route.setUpdateTime(now);
            homeRecommendRepository.save(route);

            HomeRecommend discount = new HomeRecommend();
            discount.setTitle("\u4f18\u60e0\u6d3b\u52a8");
            discount.setContent("\u65b0\u4eba\u793c\u5305\u3001\u62fc\u56e2\u4f18\u60e0\u548c\u6708\u5361\u798f\u5229");
            discount.setSortOrder(2);
            discount.setStatus(1);
            discount.setCreateTime(now);
            discount.setUpdateTime(now);
            homeRecommendRepository.save(discount);

            HomeRecommend guide = new HomeRecommend();
            guide.setTitle("\u65b0\u624b\u6307\u5357");
            guide.setContent("\u79df\u8f66\u6d41\u7a0b\u3001\u53d6\u8fd8\u8f66\u89c4\u5219\u548c\u5b89\u5168\u987b\u77e5");
            guide.setSortOrder(3);
            guide.setStatus(1);
            guide.setCreateTime(now);
            guide.setUpdateTime(now);
            homeRecommendRepository.save(guide);

            System.out.println("Home recommends initialized successfully");
        }
    }
}
