-- 电动车租赁系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS electric_vehicle_rental;

USE electric_vehicle_rental;

-- 一、用户管理模块

-- 1. 租客用户表
CREATE TABLE IF NOT EXISTS user (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户账号',
    password VARCHAR(32) NOT NULL COMMENT '密码（MD5加密）',
    phone VARCHAR(11) NOT NULL UNIQUE COMMENT '手机号',
    id_card VARCHAR(18) UNIQUE COMMENT '身份证号',
    real_name VARCHAR(20) COMMENT '真实姓名',
    gender TINYINT COMMENT '性别：1-男，2-女，0-未知',
    birthday DATE COMMENT '出生日期',
    email VARCHAR(100) UNIQUE COMMENT '电子邮箱',
    register_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    last_login_time DATETIME COMMENT '最后登录时间',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '账号状态：1-正常，2-冻结，3-注销',
    avatar_url VARCHAR(255) COMMENT '用户头像URL',
    emergency_contact VARCHAR(20) COMMENT '紧急联系人',
    emergency_phone VARCHAR(11) COMMENT '紧急联系人电话',
    credit_score INT COMMENT '芝麻信用分',
    auth_status TINYINT DEFAULT 0 COMMENT '实名认证状态：0-未认证，1-已认证',
    auth_audit_time DATETIME COMMENT '认证审核时间',
    auth_auditor VARCHAR(50) COMMENT '认证审核人'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租客用户表';

-- 2. 管理员表
CREATE TABLE IF NOT EXISTS admin (
    admin_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '管理员账号',
    password VARCHAR(32) NOT NULL COMMENT '密码（MD5加密）',
    name VARCHAR(20) NOT NULL COMMENT '姓名',
    phone VARCHAR(11) NOT NULL UNIQUE COMMENT '手机号',
    department VARCHAR(50) COMMENT '所属部门',
    position VARCHAR(50) COMMENT '职位',
    entry_time DATE COMMENT '入职时间',
    role_id BIGINT COMMENT '角色ID',
    permission_scope TINYINT DEFAULT 1 COMMENT '操作权限范围：1-全量，2-门店级，3-区域级',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '账号状态：1-启用，0-禁用',
    last_operation_time DATETIME COMMENT '最后操作时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 3. 角色表
CREATE TABLE IF NOT EXISTS role (
    role_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    role_name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
    role_desc VARCHAR(255) COMMENT '角色描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 4. 权限表
CREATE TABLE IF NOT EXISTS permission (
    permission_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
    permission_name VARCHAR(50) NOT NULL COMMENT '权限名称',
    permission_code VARCHAR(50) NOT NULL UNIQUE COMMENT '权限标识',
    permission_desc VARCHAR(255) COMMENT '权限描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 5. 角色-权限关联表
CREATE TABLE IF NOT EXISTS role_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE,
    UNIQUE KEY uk_role_permission (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-权限关联表';

-- 6. 用户地址表
CREATE TABLE IF NOT EXISTS user_address (
    address_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '地址ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    province VARCHAR(50) NOT NULL COMMENT '省',
    city VARCHAR(50) NOT NULL COMMENT '市',
    district VARCHAR(50) NOT NULL COMMENT '区',
    detail_address VARCHAR(255) NOT NULL COMMENT '详细地址',
    zip_code VARCHAR(6) COMMENT '邮政编码',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认：1-是，0-否',
    is_pickup TINYINT DEFAULT 0 COMMENT '是否常用取车地址：1-是，0-否',
    is_return TINYINT DEFAULT 0 COMMENT '是否常用还车地址：1-是，0-否',
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户地址表';

-- 二、车辆管理模块

-- 1. 车辆基础信息表
CREATE TABLE IF NOT EXISTS vehicle (
    vehicle_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '车辆ID',
    vehicle_code VARCHAR(50) NOT NULL UNIQUE COMMENT '车辆编号',
    vehicle_number VARCHAR(50) NOT NULL UNIQUE COMMENT '车辆编号',
    vin VARCHAR(17) UNIQUE COMMENT '车架号（VIN码）',
    license_plate VARCHAR(20) UNIQUE COMMENT '车牌号',
    brand VARCHAR(50) NOT NULL COMMENT '品牌',
    model VARCHAR(100) NOT NULL COMMENT '型号',
    vehicle_type TINYINT NOT NULL COMMENT '车辆类型：1-两轮，2-三轮，3-四轮',
    battery_type TINYINT NOT NULL COMMENT '电池类型：1-铅酸，2-锂电',
    battery_capacity DECIMAL(5,2) COMMENT '电池容量（Ah）',
    range_mileage DECIMAL(5,1) COMMENT '续航里程（km）',
    max_speed DECIMAL(4,1) COMMENT '最高时速（km/h）',
    seat_count INT COMMENT '座位数',
    weight DECIMAL(5,1) COMMENT '车辆重量（kg）',
    purchase_time DATE COMMENT '购置时间',
    purchase_price DECIMAL(10,2) COMMENT '购置价格',
    store_id BIGINT COMMENT '所属门店ID',
    launch_time DATETIME COMMENT '初始投放时间',
    front_image_url VARCHAR(255) COMMENT '车辆正面图片URL',
    side_image_url VARCHAR(255) COMMENT '车辆侧面图片URL',
    interior_image_url VARCHAR(255) COMMENT '车辆内饰图片URL',
    tags VARCHAR(255) COMMENT '车辆标签，逗号分隔',
    status INT DEFAULT 1 COMMENT '车辆状态：1-可租，2-已租，3-维修中，4-报废，5-待清洁'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆基础信息表';

-- 2. 车辆状态表
CREATE TABLE IF NOT EXISTS vehicle_status (
    status_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '状态ID',
    vehicle_id BIGINT NOT NULL UNIQUE COMMENT '车辆ID',
    current_status TINYINT NOT NULL DEFAULT 1 COMMENT '当前状态：1-可租，2-已租，3-维修中，4-报废，5-待清洁',
    current_location VARCHAR(255) COMMENT '当前所在位置',
    store_id BIGINT COMMENT '当前所在门店ID',
    latitude DECIMAL(10,6) COMMENT '纬度',
    longitude DECIMAL(10,6) COMMENT '经度',
    battery_percentage INT DEFAULT 100 COMMENT '电量百分比',
    last_status_update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后状态更新时间',
    total_rental_count INT DEFAULT 0 COMMENT '累计租赁次数',
    total_mileage DECIMAL(10,2) DEFAULT 0 COMMENT '累计行驶里程',
    last_maintenance_time DATE COMMENT '上次保养时间',
    next_maintenance_mileage DECIMAL(10,2) COMMENT '下次保养提醒里程',
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆状态表';

-- 3. 车辆维修记录表
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    maintenance_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '维修记录ID',
    vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
    reporter_id BIGINT COMMENT '报修人ID',
    report_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报修时间',
    fault_type TINYINT COMMENT '故障类型：1-电池故障，2-轮胎损坏，3-电机故障，4-其他',
    fault_description TEXT COMMENT '故障描述',
    maintenance_staff_id BIGINT COMMENT '维修人员ID',
    maintenance_start_time DATETIME COMMENT '维修开始时间',
    maintenance_end_time DATETIME COMMENT '维修完成时间',
    maintenance_cost DECIMAL(10,2) COMMENT '维修费用',
    replacement_parts TEXT COMMENT '更换配件清单',
    maintenance_status TINYINT DEFAULT 1 COMMENT '维修状态：1-待维修，2-维修中，3-已完成',
    maintenance_remark TEXT COMMENT '维修备注',
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆维修记录表';

-- 三、订单管理模块

-- 1. 订单主表
CREATE TABLE IF NOT EXISTS `orders` (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_code VARCHAR(20) NOT NULL UNIQUE COMMENT '订单编号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
    create_ip VARCHAR(20) COMMENT '订单创建IP',
    rental_type TINYINT NOT NULL COMMENT '租赁类型：1-时租，2-日租，3-周租，4-月租',
    expected_pickup_time DATETIME NOT NULL COMMENT '预计取车时间',
    expected_return_time DATETIME NOT NULL COMMENT '预计还车时间',
    actual_pickup_time DATETIME COMMENT '实际取车时间',
    actual_return_time DATETIME COMMENT '实际还车时间',
    rental_duration INT COMMENT '租赁时长（分钟）',
    base_rent DECIMAL(10,2) NOT NULL COMMENT '基础租金',
    service_fee DECIMAL(10,2) DEFAULT 0 COMMENT '服务费',
    insurance_fee DECIMAL(10,2) DEFAULT 0 COMMENT '保险费',
    penalty_fee DECIMAL(10,2) DEFAULT 0 COMMENT '违约金',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    actual_pay_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    order_status TINYINT NOT NULL DEFAULT 1 COMMENT '订单状态：1-待支付，2-已支付，3-已取车，4-已还车，5-已取消，6-已退款，7-异常',
    cancel_reason TEXT COMMENT '取消原因',
    cancel_time DATETIME COMMENT '取消时间',
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- 2. 订单支付表
CREATE TABLE IF NOT EXISTS order_payment (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '支付记录ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    payment_method TINYINT NOT NULL COMMENT '支付方式：1-微信，2-支付宝，3-银行卡',
    payment_amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    payment_no VARCHAR(100) UNIQUE COMMENT '支付单号（第三方支付流水号）',
    payment_time DATETIME COMMENT '支付时间',
    refund_apply_time DATETIME COMMENT '退款申请时间',
    refund_complete_time DATETIME COMMENT '退款完成时间',
    refund_amount DECIMAL(10,2) DEFAULT 0 COMMENT '退款金额',
    refund_reason TEXT COMMENT '退款原因',
    refund_status TINYINT DEFAULT 1 COMMENT '退款状态：1-未退款，2-退款中，3-已退款',
    FOREIGN KEY (order_id) REFERENCES `orders`(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单支付表';

-- 3. 取还车记录表
CREATE TABLE IF NOT EXISTS pickup_return_record (
    record_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    pickup_user_id BIGINT COMMENT '取车人ID',
    pickup_store_id BIGINT COMMENT '取车门店ID',
    pickup_latitude DECIMAL(10,6) COMMENT '取车地点纬度',
    pickup_longitude DECIMAL(10,6) COMMENT '取车地点经度',
    pickup_battery_percentage INT COMMENT '取车时车辆电量',
    pickup_vehicle_status TINYINT COMMENT '取车时车辆状态：1-完好，2-轻微损坏，3-严重损坏',
    pickup_remark TEXT COMMENT '取车备注',
    pickup_time DATETIME COMMENT '取车时间',
    return_user_id BIGINT COMMENT '还车人ID',
    return_store_id BIGINT COMMENT '还车门店ID',
    return_latitude DECIMAL(10,6) COMMENT '还车地点纬度',
    return_longitude DECIMAL(10,6) COMMENT '还车地点经度',
    return_battery_percentage INT COMMENT '还车时车辆电量',
    return_vehicle_status TINYINT COMMENT '还车时车辆状态：1-完好，2-轻微损坏，3-严重损坏',
    return_auditor VARCHAR(50) COMMENT '还车验收人',
    return_remark TEXT COMMENT '还车备注',
    return_time DATETIME COMMENT '还车时间',
    FOREIGN KEY (order_id) REFERENCES `orders`(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='取还车记录表';

-- 四、押金管理模块

-- 1. 押金主表
CREATE TABLE IF NOT EXISTS deposit (
    deposit_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '押金ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    deposit_amount DECIMAL(10,2) NOT NULL COMMENT '押金金额',
    deposit_type TINYINT NOT NULL COMMENT '押金类型：1-车辆押金，2-违章押金',
    deposit_status TINYINT NOT NULL DEFAULT 1 COMMENT '押金状态：1-已缴纳，2-已冻结，3-已退还，4-部分退还',
    pay_time DATETIME COMMENT '缴纳时间',
    freeze_time DATETIME COMMENT '冻结时间',
    unfreeze_time DATETIME COMMENT '解冻时间',
    refund_apply_time DATETIME COMMENT '退还申请时间',
    refund_audit_time DATETIME COMMENT '退还审核时间',
    refund_complete_time DATETIME COMMENT '退还完成时间',
    related_order_id BIGINT COMMENT '关联订单ID',
    audit_admin_id BIGINT COMMENT '审核管理员ID',
    refund_method TINYINT COMMENT '退还方式：1-原路返回，2-银行卡',
    refund_bank_card VARCHAR(50) COMMENT '退还银行卡号（脱敏）',
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (related_order_id) REFERENCES `orders`(order_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='押金主表';

-- 2. 押金流水表
CREATE TABLE IF NOT EXISTS deposit_flow (
    flow_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '流水ID',
    deposit_id BIGINT NOT NULL COMMENT '押金ID',
    operation_type TINYINT NOT NULL COMMENT '操作类型：1-缴纳，2-冻结，3-解冻，4-退还',
    operation_amount DECIMAL(10,2) NOT NULL COMMENT '操作金额',
    before_balance DECIMAL(10,2) NOT NULL COMMENT '操作前余额',
    after_balance DECIMAL(10,2) NOT NULL COMMENT '操作后余额',
    operator_id BIGINT COMMENT '操作人ID',
    operation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    operation_ip VARCHAR(20) COMMENT '操作IP',
    operation_remark TEXT COMMENT '操作备注',
    FOREIGN KEY (deposit_id) REFERENCES deposit(deposit_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='押金流水表';

-- 五、门店/网点模块

-- 1. 门店信息表
CREATE TABLE IF NOT EXISTS store (
    store_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '门店ID',
    store_name VARCHAR(100) NOT NULL COMMENT '门店名称',
    store_code VARCHAR(50) NOT NULL UNIQUE COMMENT '门店编号',
    store_type TINYINT NOT NULL COMMENT '门店类型：1-直营，2-加盟',
    province VARCHAR(50) NOT NULL COMMENT '所在省',
    city VARCHAR(50) NOT NULL COMMENT '所在市',
    district VARCHAR(50) NOT NULL COMMENT '所在区',
    detail_address VARCHAR(255) NOT NULL COMMENT '详细地址',
    manager_id BIGINT COMMENT '门店负责人ID',
    contact_phone VARCHAR(11) NOT NULL COMMENT '联系电话',
    business_start_time TIME COMMENT '营业时间开始',
    business_end_time TIME COMMENT '营业时间结束',
    store_status TINYINT NOT NULL DEFAULT 1 COMMENT '门店状态：1-营业中，2-暂停营业，3-装修',
    store_image_url VARCHAR(255) COMMENT '门店图片URL',
    latitude DECIMAL(10,6) COMMENT '经度',
    longitude DECIMAL(10,6) COMMENT '纬度',
    surrounding_landmarks VARCHAR(255) COMMENT '周边地标'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门店信息表';

-- 2. 车位表
CREATE TABLE IF NOT EXISTS parking_space (
    space_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '车位ID',
    store_id BIGINT NOT NULL COMMENT '门店ID',
    space_code VARCHAR(50) NOT NULL COMMENT '车位编号',
    space_type TINYINT NOT NULL DEFAULT 1 COMMENT '车位类型：1-普通车位，2-充电车位',
    space_status TINYINT NOT NULL DEFAULT 1 COMMENT '车位状态：1-空闲，2-占用',
    current_vehicle_id BIGINT COMMENT '当前停放车辆ID',
    charging_power DECIMAL(5,2) COMMENT '车位充电功率（kW）',
    last_use_time DATETIME COMMENT '最后使用时间',
    FOREIGN KEY (store_id) REFERENCES store(store_id) ON DELETE CASCADE,
    FOREIGN KEY (current_vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车位表';

-- 六、系统日志/公告模块

-- 1. 操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    operator_id BIGINT COMMENT '操作人ID',
    operator_type TINYINT COMMENT '操作人类型：1-用户，2-管理员',
    operation_module VARCHAR(50) COMMENT '操作模块',
    operation_type TINYINT COMMENT '操作类型：1-新增，2-修改，3-删除，4-查询',
    operation_content TEXT COMMENT '操作内容',
    operation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    operation_ip VARCHAR(20) COMMENT '操作IP',
    operation_device VARCHAR(50) COMMENT '操作设备',
    operation_result TINYINT DEFAULT 1 COMMENT '操作结果：1-成功，0-失败',
    failure_reason TEXT COMMENT '失败原因'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 2. 系统公告表
CREATE TABLE IF NOT EXISTS system_announcement (
    announcement_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '公告ID',
    title VARCHAR(100) NOT NULL COMMENT '公告标题',
    content TEXT NOT NULL COMMENT '公告内容',
    announcement_type TINYINT NOT NULL COMMENT '公告类型：1-系统通知，2-活动通知，3-故障提醒',
    publisher_id BIGINT COMMENT '发布人ID',
    publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    effective_time DATETIME COMMENT '生效时间',
    expire_time DATETIME COMMENT '失效时间',
    read_count INT DEFAULT 0 COMMENT '阅读次数',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '公告状态：1-草稿，2-已发布，3-已下架',
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶：1-是，0-否',
    is_popup TINYINT DEFAULT 0 COMMENT '是否弹窗：1-是，0-否'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统公告表';

-- 用户站内消息表
CREATE TABLE IF NOT EXISTS user_message (
    message_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(120) NOT NULL COMMENT '消息标题',
    content TEXT NOT NULL COMMENT '消息内容',
    state TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-未读，1-已读',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户站内消息表';

-- 添加外键约束
ALTER TABLE admin ADD FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE SET NULL;
ALTER TABLE vehicle ADD FOREIGN KEY (store_id) REFERENCES store(store_id) ON DELETE SET NULL;
ALTER TABLE vehicle_status ADD FOREIGN KEY (store_id) REFERENCES store(store_id) ON DELETE SET NULL;

-- 创建索引
CREATE TABLE IF NOT EXISTS user_collection (
    collection_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    UNIQUE KEY uk_user_vehicle (user_id, vehicle_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

CREATE INDEX idx_user_phone ON user(phone);
CREATE INDEX idx_vehicle_code ON vehicle(vehicle_code);
CREATE INDEX idx_collection_user_id ON user_collection(user_id);
CREATE INDEX idx_order_user_id ON `orders`(user_id);
CREATE INDEX idx_order_status ON `orders`(order_status);
CREATE INDEX idx_deposit_user_id ON deposit(user_id);
CREATE INDEX idx_store_status ON store(store_status);

-- 插入初始数据
-- 角色数据
INSERT INTO role (role_name, role_desc) VALUES
('超级管理员', '拥有系统所有权限'),
('门店管理员', '管理门店相关业务'),
('财务管理员', '管理财务相关业务');

-- 权限数据
INSERT INTO permission (permission_name, permission_code, permission_desc) VALUES
('用户管理', 'user_manage', '管理用户信息'),
('车辆管理', 'vehicle_manage', '管理车辆信息'),
('订单管理', 'order_manage', '管理订单信息'),
('财务审核', 'finance_audit', '审核财务相关业务'),
('门店管理', 'store_manage', '管理门店信息'),
('系统设置', 'system_setting', '系统相关设置');

-- 角色-权限关联数据
INSERT INTO role_permission (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
(2, 1), (2, 2), (2, 3), (2, 5),
(3, 3), (3, 4);

-- 管理员数据（密码：123456）
INSERT INTO admin (username, password, name, phone, department, position, role_id, status) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', '13800138000', '技术部', '系统管理员', 1, 1);

-- 门店数据
INSERT INTO store (store_name, store_code, store_type, province, city, district, detail_address, contact_phone, store_status) VALUES
('石龙镇中心店', 'SL001', 1, '广东省', '东莞市', '石龙镇', '石龙镇中兴路123号', '0769-88888888', 1),
('石龙镇西湖店', 'SL002', 1, '广东省', '东莞市', '石龙镇', '石龙镇西湖路456号', '0769-88888889', 1);

-- 车辆数据
INSERT INTO vehicle (vehicle_code, vehicle_number, brand, model, vehicle_type, battery_type, store_id, launch_time) VALUES
('EV001', 'EV001', '雅迪', 'G5', 1, 2, 1, NOW()),
('EV002', 'EV002', '爱玛', '晴天', 1, 2, 1, NOW()),
('EV003', 'EV003', '台铃', '虎贲', 1, 2, 2, NOW());

-- 车辆状态数据
INSERT INTO vehicle_status (vehicle_id, current_status, store_id, battery_percentage) VALUES
(1, 1, 1, 100),
(2, 1, 1, 95),
(3, 1, 2, 90);

-- 车位数据
INSERT INTO parking_space (store_id, space_code, space_type) VALUES
(1, 'P001', 1),
(1, 'P002', 2),
(1, 'P003', 1),
(2, 'P001', 1),
(2, 'P002', 2);

-- 系统公告数据
INSERT INTO system_announcement (title, content, announcement_type, publisher_id, status, is_top) VALUES
('系统上线通知', '尊敬的用户，石龙镇电动车租赁系统已正式上线，欢迎使用！', 1, 1, 2, 1),
('春节运营安排', '春节期间（2月10日-2月17日）营业时间调整为10:00-18:00，敬请留意。', 2, 1, 2, 0);
