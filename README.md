# 易租电动车管理系统

基于 **Spring Boot + Vue 3 + 微信小程序** 的全栈电动车租赁管理系统，包含管理后台和小程序客户端。

## 项目简介

本项目是一个完整的电动车租赁管理解决方案，为管理员提供车辆、订单、用户、押金等全流程管理功能，为用户提供便捷的在线租车服务体验。

## 功能特性

### 管理后台
- 🔐 管理员登录/登出
- 👥 用户管理：查看用户列表、用户详情、状态管理
- 🚗 车辆管理：车辆信息、车辆状态、车辆维护
- 📋 订单管理：订单查看、订单处理、订单统计
- 💳 押金管理：押金缴纳、押金退还、押金记录
- 🔧 维护管理：车辆维护记录、维护处理
- 📢 公告管理：系统公告发布和管理
- 📊 数据统计：仪表盘展示核心数据指标

### 微信小程序
- 📱 微信授权登录/注册
- 🔍 车辆浏览：查看可租车辆、车辆详情
- ⭐ 收藏功能：收藏感兴趣的车辆
- 👁️ 浏览记录：查看历史浏览记录
- 📝 租车申请：在线提交租车订单
- 📦 订单管理：我的订单、订单状态追踪
- 📨 消息中心：系统消息、订单通知
- 🛠️ 维修申请：车辆故障报修
- 👤 个人中心：个人信息管理、押金管理

## 技术栈

### 后端技术
- **框架**：Spring Boot 3.x
- **语言**：Java 17
- **数据库**：MySQL
- **ORM**：Spring Data JPA
- **认证**：JWT Token
- **构建**：Maven

### 管理后台
- **框架**：Vue 3
- **语言**：TypeScript
- **构建工具**：Vite
- **UI组件库**：Element Plus
- **路由**：Vue Router
- **状态管理**：Pinia

### 微信小程序
- **原生微信小程序开发**
- **UI组件**：Vant Weapp

## 项目结构

```
bs/
├── backend/              # 后端服务
│   ├── src/main/java/
│   │   └── com/company/wxplatform/
│   │       ├── common/      # 公共模块
│   │       ├── modules/     # 业务模块
│   │       │   ├── admin/   # 管理员模块
│   │       │   ├── user/    # 用户模块
│   │       │   ├── vehicle/ # 车辆模块
│   │       │   ├── order/   # 订单模块
│   │       │   └── wechat/  # 微信模块
│   └── src/main/resources/  # 配置文件
├── admin-web/            # 管理后台前端
│   ├── src/
│   │   ├── api/          # API接口
│   │   ├── views/        # 页面组件
│   │   ├── router/       # 路由配置
│   │   └── stores/       # 状态管理
└── wechat-miniapp/       # 微信小程序
    └── weapp/
        ├── pages/        # 小程序页面
        └── config/       # 配置文件
```

## 快速开始

### 环境要求
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

### 1. 数据库配置

创建数据库并执行初始化脚本：
```bash
mysql -u root -p
CREATE DATABASE wx_platform;
USE wx_platform;
SOURCE backend/src/main/resources/schema.sql;
```

### 2. 后端启动

```bash
cd backend
# 修改 application-dev.yml 中的数据库配置
mvn spring-boot:run
# 或使用包装器
.\mvnw.cmd spring-boot:run
```

后端服务默认运行在：`http://localhost:8080`

### 3. 管理后台启动

```bash
cd admin-web
npm install
npm run dev
```

前端服务默认运行在：`http://localhost:5173`

### 4. 微信小程序配置

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，导入项目：选择 `wechat-miniapp/weapp` 目录
3. 在 `app.js` 中配置后端API地址
4. 点击"编译"运行小程序

**真机调试配置**：
- 局域网测试：将小程序API地址改为您电脑的局域网IP（如 `http://192.168.1.100:8080`）
- 确保手机和电脑在同一Wi-Fi下
- 关闭或配置Windows防火墙允许8080端口

**USB调试（推荐）**：
- 手机开启开发者选项和USB调试
- 连接USB并授权调试
- 安装Android Platform Tools，运行：
  ```bash
  adb devices
  adb reverse tcp:8080 tcp:8080
  ```
- 小程序API地址使用：`http://127.0.0.1:8080`

## 默认账户

### 管理员账户
- 用户名：`admin`
- 密码：`123456`

## API接口示例

### 认证相关
- `POST /api/admin/auth/login` - 管理员登录
- `POST /api/user/auth/login` - 用户登录
- `POST /api/user/register` - 用户注册
- `POST /api/wechat/auth/login` - 微信登录

### 业务接口
- `GET /api/vehicle/list` - 车辆列表
- `POST /api/order/create` - 创建订单
- `GET /api/user/info` - 用户信息
- `POST /api/deposit/pay` - 押金支付

## 配置说明

### 后端配置
- 主配置：`backend/src/main/resources/application.yml`
- 开发环境：`backend/src/main/resources/application-dev.yml`
- 生产环境：`backend/src/main/resources/application-prod.yml`

### 前端配置
- 开发环境：`admin-web/.env.development`
- 生产环境：`admin-web/.env.production`

### 小程序配置
- API地址：`wechat-miniapp/weapp/app.js`

## 生产部署

### 后端打包
```bash
cd backend
mvn clean package -DskipTests
java -jar target/wx-platform-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### 前端打包
```bash
cd admin-web
npm run build
```
将 `dist` 目录部署到Nginx或其他静态服务器。

### 小程序发布
在微信公众平台上传代码并提交审核。

## 开发指南

### 新增功能模块
1. 在 `backend/src/main/java/com/company/wxplatform/modules/` 创建对应模块
2. 定义Entity、Repository、Service、Controller
3. 在 `admin-web/src/` 中创建对应的前端页面和API
4. 在 `wechat-miniapp/weapp/pages/` 中创建小程序页面

### 代码规范
- Java代码遵循阿里巴巴Java开发规范
- Vue组件使用Composition API
- 统一使用 `ApiResponse` 包装API响应

## 常见问题

### 后端启动失败
- 检查MySQL服务是否启动
- 确认数据库配置是否正确
- 检查8080端口是否被占用

### 小程序无法连接后端
- 确认后端服务正在运行
- 检查API地址配置是否正确
- 局域网测试请使用电脑局域网IP

### 前端跨域问题
- 后端已配置CORS，无需额外处理
- 如需修改，查看 `WebMvcConfig.java`

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**项目地址**：https://github.com/Cxiansen11221/slbs
