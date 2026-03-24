-- DB optimization / alignment script (non-destructive by default)
USE electric_vehicle_rental;

-- 1) Align vehicle fields
ALTER TABLE vehicle ADD COLUMN IF NOT EXISTS hourly_price DECIMAL(10,2) NULL;
-- If your MySQL doesn't support IF NOT EXISTS for ADD COLUMN, use:
-- ALTER TABLE vehicle ADD COLUMN hourly_price DECIMAL(10,2) NULL;

-- 2) Add missing tables used by code
CREATE TABLE IF NOT EXISTS home_recommend (
    recommend_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    content TEXT,
    sort_order INT,
    status INT,
    create_time DATETIME,
    update_time DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_viewed (
    view_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    viewed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE,
    INDEX idx_user_viewed_user_time (user_id, viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

-- 3) Optional: remove legacy table if you confirm it's unused (and no FK)
-- DROP TABLE IF EXISTS pickup_return_record;

-- 4) Optional: remove unused modules (requires dropping FK constraints first if any)
-- DROP TABLE IF EXISTS role_permission;
-- DROP TABLE IF EXISTS permission;
-- DROP TABLE IF EXISTS role;
-- DROP TABLE IF EXISTS user_address;
-- DROP TABLE IF EXISTS operation_log;
-- DROP TABLE IF EXISTS parking_space;
-- DROP TABLE IF EXISTS store;

-- 5) Helpful: list foreign keys referencing a table
-- SELECT constraint_name, table_name
-- FROM information_schema.key_column_usage
-- WHERE referenced_table_name = 'role' AND table_schema = DATABASE();
