# 石龙镇电动车租赁管理系统

## 项目概述

石龙镇电动车租赁管理系统是一个基于 Spring Boot + Vue 3 + 微信小程序的双端协同架构系统，用于管理电动车租赁业务。

## 技术栈

### 后端技术
- Spring Boot 3.3.2
- Java 17
- JWT 认证
- Spring Data JPA
- H2 数据库（开发环境）

### 前端技术
- Vue 3.4.38
- TypeScript
- Element Plus
- Vite

### 微信小程序
- 原生小程序
- Vant Weapp

## 项目结构

```
├── backend/              # 后端服务
├── admin-web/            # PC 端管理后台
└── wechat-miniapp/       # 微信小程序前端
```

## 快速开始

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 编译并运行
mvn spring-boot:run

# 或使用 Maven Wrapper
./mvnw spring-boot:run
```

后端服务默认运行在 `http://localhost:8080`

### 2. 启动前端管理后台

```bash
# 进入前端目录
cd admin-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务默认运行在 `http://localhost:5173`

### 3. 启动微信小程序

1. 打开微信开发者工具
2. 导入 `wechat-miniapp/weapp` 目录
3. 配置小程序请求地址为 `http://localhost:8080`
4. 编译并运行小程序

## 系统功能

### 管理后台功能
- 管理员登录
- 用户管理
- 车辆管理
- 租赁管理
- 数据统计

### 微信小程序功能
- 用户注册/登录
- 车辆搜索
- 租赁申请
- 租赁管理
- 个人中心

## API 接口

### 认证接口
- `POST /api/admin/auth/login` - 管理员登录
- `POST /api/wechat/auth/login` - 微信登录

### 用户接口
- `GET /api/admin/users` - 获取用户列表

### 健康检查
- `GET /actuator/health` - 健康检查

## 默认账号

### 管理后台
- 用户名：admin
- 密码：123456

### 微信小程序
- 自动登录（基于微信 openid）

## 环境配置

### 后端配置
- 配置文件：`backend/src/main/resources/application.yml`
- 数据库配置：默认使用 H2 内存数据库
- 端口配置：8080

### 前端配置
- 配置文件：`admin-web/.env.development`
- API 基础地址：`http://localhost:8080`

### 微信小程序配置
- 配置文件：`wechat-miniapp/weapp/app.js`
- API 基础地址：`http://localhost:8080`

## 部署说明

### 生产环境部署

1. **后端部署**
   - 编译：`mvn clean package -DskipTests`
   - 运行：`java -jar target/wx-platform-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`

2. **前端部署**
   - 编译：`npm run build`
   - 部署：将 `dist` 目录部署到 Nginx 或其他静态文件服务器

3. **微信小程序部署**
   - 在微信公众平台上传代码
   - 审核通过后发布

## 注意事项

- 开发环境使用 H2 内存数据库，生产环境建议使用 MySQL 或 PostgreSQL
- 微信小程序需要在微信公众平台注册并获取 AppID
- 生产环境需要配置真实的微信登录接口

## 许可证

MIT License