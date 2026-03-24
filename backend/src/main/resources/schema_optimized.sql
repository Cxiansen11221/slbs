-- Optimized schema aligned with current JPA entities (2026-03-15)
CREATE DATABASE IF NOT EXISTS electric_vehicle_rental;

USE electric_vehicle_rental;

-- 用户
CREATE TABLE IF NOT EXISTS user (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(32) NOT NULL,
    phone VARCHAR(11) NOT NULL UNIQUE,
    id_card VARCHAR(18) UNIQUE,
    real_name VARCHAR(20),
    gender TINYINT,
    birthday DATE,
    email VARCHAR(100) UNIQUE,
    register_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_time DATETIME,
    status TINYINT NOT NULL DEFAULT 1,
    avatar_url VARCHAR(255),
    emergency_contact VARCHAR(20),
    emergency_phone VARCHAR(11),
    credit_score INT,
    auth_status TINYINT DEFAULT 0,
    auth_audit_time DATETIME,
    auth_auditor VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 管理员
CREATE TABLE IF NOT EXISTS admin (
    admin_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(32) NOT NULL,
    name VARCHAR(20) NOT NULL,
    phone VARCHAR(11) NOT NULL UNIQUE,
    department VARCHAR(50),
    position VARCHAR(50),
    entry_time DATE,
    role_id BIGINT,
    permission_scope TINYINT DEFAULT 1,
    status TINYINT NOT NULL DEFAULT 1,
    last_operation_time DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 车辆
CREATE TABLE IF NOT EXISTS vehicle (
    vehicle_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_code VARCHAR(50) NOT NULL UNIQUE,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    vin VARCHAR(17) NOT NULL UNIQUE,
    license_plate VARCHAR(20) UNIQUE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    vehicle_type TINYINT NOT NULL,
    battery_type TINYINT NOT NULL,
    battery_capacity DECIMAL(5,2),
    range_mileage DECIMAL(6,1),
    hourly_price DECIMAL(10,2),
    max_speed DECIMAL(4,1),
    seat_count INT,
    weight DECIMAL(6,1),
    purchase_time DATE,
    purchase_price DECIMAL(10,2),
    store_id BIGINT,
    launch_time DATETIME,
    front_image_url VARCHAR(255),
    side_image_url VARCHAR(255),
    interior_image_url VARCHAR(255),
    tags VARCHAR(255),
    status INT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 车辆状态
CREATE TABLE IF NOT EXISTS vehicle_status (
    status_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id BIGINT NOT NULL UNIQUE,
    current_status TINYINT NOT NULL DEFAULT 1,
    current_location VARCHAR(255),
    store_id BIGINT,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    battery_percentage INT DEFAULT 100,
    last_status_update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_rental_count INT DEFAULT 0,
    total_mileage DECIMAL(10,2) DEFAULT 0,
    last_maintenance_time DATE,
    next_maintenance_mileage DECIMAL(10,2),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 车辆维修
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    maintenance_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id BIGINT NOT NULL,
    reporter_id BIGINT,
    report_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fault_type TINYINT,
    fault_description TEXT,
    maintenance_staff_id BIGINT,
    maintenance_start_time DATETIME,
    maintenance_end_time DATETIME,
    maintenance_cost DECIMAL(10,2),
    replacement_parts TEXT,
    maintenance_status TINYINT DEFAULT 1,
    maintenance_remark TEXT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 首页推荐
CREATE TABLE IF NOT EXISTS home_recommend (
    recommend_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    content TEXT,
    sort_order INT,
    status INT,
    create_time DATETIME,
    update_time DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(20) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_ip VARCHAR(20),
    rental_type TINYINT NOT NULL,
    expected_pickup_time DATETIME NOT NULL,
    expected_return_time DATETIME NOT NULL,
    actual_pickup_time DATETIME,
    actual_return_time DATETIME,
    rental_duration INT,
    base_rent DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) DEFAULT 0,
    insurance_fee DECIMAL(10,2) DEFAULT 0,
    penalty_fee DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    actual_pay_amount DECIMAL(10,2) NOT NULL,
    order_status TINYINT NOT NULL DEFAULT 1,
    cancel_reason TEXT,
    cancel_time DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 支付
CREATE TABLE IF NOT EXISTS order_payment (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    payment_method TINYINT NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_no VARCHAR(100) UNIQUE,
    payment_time DATETIME,
    refund_apply_time DATETIME,
    refund_complete_time DATETIME,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    refund_status TINYINT DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 取还车记录（与实体对齐）
CREATE TABLE IF NOT EXISTS take_return_record (
    record_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    taker_id BIGINT,
    pickup_store_id BIGINT,
    pickup_location VARCHAR(255),
    pickup_battery_level INT,
    pickup_vehicle_status VARCHAR(50),
    pickup_note TEXT,
    returner_id BIGINT,
    return_store_id BIGINT,
    return_location VARCHAR(255),
    return_battery_level INT,
    return_vehicle_status VARCHAR(50),
    return_inspector VARCHAR(50),
    return_note TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 押金
CREATE TABLE IF NOT EXISTS deposit (
    deposit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    deposit_type TINYINT NOT NULL,
    deposit_status TINYINT NOT NULL DEFAULT 1,
    pay_time DATETIME,
    freeze_time DATETIME,
    unfreeze_time DATETIME,
    refund_apply_time DATETIME,
    refund_audit_time DATETIME,
    refund_complete_time DATETIME,
    related_order_id BIGINT,
    audit_admin_id BIGINT,
    refund_method TINYINT,
    refund_bank_card VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (related_order_id) REFERENCES orders(order_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 押金流水
CREATE TABLE IF NOT EXISTS deposit_flow (
    flow_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    deposit_id BIGINT NOT NULL,
    operation_type TINYINT NOT NULL,
    operation_amount DECIMAL(10,2) NOT NULL,
    before_balance DECIMAL(10,2) NOT NULL,
    after_balance DECIMAL(10,2) NOT NULL,
    operator_id BIGINT,
    operation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operation_ip VARCHAR(20),
    operation_remark TEXT,
    FOREIGN KEY (deposit_id) REFERENCES deposit(deposit_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 系统公告
CREATE TABLE IF NOT EXISTS system_announcement (
    announcement_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    announcement_type TINYINT NOT NULL,
    publisher_id BIGINT,
    publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_time DATETIME,
    expire_time DATETIME,
    read_count INT DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    is_top TINYINT DEFAULT 0,
    is_popup TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 站内消息
CREATE TABLE IF NOT EXISTS user_message (
    message_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    state TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏
CREATE TABLE IF NOT EXISTS user_collection (
    collection_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_vehicle (user_id, vehicle_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 看车记录
CREATE TABLE IF NOT EXISTS user_viewed (
    view_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    viewed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE,
    INDEX idx_user_viewed_user_time (user_id, viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 索引
CREATE INDEX idx_user_phone ON user(phone);
CREATE INDEX idx_vehicle_code ON vehicle(vehicle_code);
CREATE INDEX idx_collection_user_id ON user_collection(user_id);
CREATE INDEX idx_order_user_id ON orders(user_id);
CREATE INDEX idx_order_status ON orders(order_status);
CREATE INDEX idx_deposit_user_id ON deposit(user_id);
