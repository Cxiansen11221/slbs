# 石龙镇电动车租赁管理系统

基于 `Spring Boot + Vue 3 + 微信小程序` 的前后端协同项目，用于管理电动车租赁业务，包含后台管理端与小程序端。

**功能概览**
- 后台管理：管理员登录、用户管理、车辆管理、租赁管理、数据统计
- 小程序端：用户登录、车辆浏览/搜索、租赁申请、租赁管理、个人中心

**技术栈**
- 后端：Spring Boot 3.3.2、Java 17、Spring Data JPA、JWT
- 后台前端：Vue 3.4、TypeScript、Vite、Element Plus
- 小程序端：原生小程序、Vant Weapp
- 开发数据库：H2（生产建议 MySQL / PostgreSQL）

**目录结构**
```
backend/         后端服务
admin-web/       管理后台前端
wechat-miniapp/  微信小程序
```

## 快速开始

### 1. 启动后端
```bash
cd backend
mvn spring-boot:run
# 或使用 Maven Wrapper
./mvnw spring-boot:run
```
默认地址：`http://localhost:8080`

### 2. 启动后台前端
```bash
cd admin-web
npm install
npm run dev
```
默认地址：`http://localhost:5173`

### 3. 运行小程序
1. 打开微信开发者工具  
2. 导入目录：`wechat-miniapp/weapp`  
3. 请求地址配置为：`http://localhost:8080`  
4. 编译运行

## 接口示例
- `POST /api/admin/auth/login` 管理员登录
- `POST /api/wechat/auth/login` 微信登录
- `GET /api/admin/users` 获取用户列表
- `GET /actuator/health` 健康检查

## 默认账号

### 管理后台
- 用户名：`admin`
- 密码：`123456`

### 小程序端
可基于微信 `openid` 自动登录（需配置微信登录接口）

## 环境配置

### 后端
- 配置文件：`backend/src/main/resources/application.yml`
- 端口：`8080`

### 后台前端
- 配置文件：`admin-web/.env.development`
- API 地址：`http://localhost:8080`

### 小程序
- 配置文件：`wechat-miniapp/weapp/app.js`
- API 地址：`http://localhost:8080`

## 生产部署（简版）

### 后端
```bash
mvn clean package -DskipTests
java -jar target/wx-platform-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### 后台前端
```bash
npm run build
```
将 `dist` 部署到 Nginx 或其他静态服务器。

### 小程序
在微信公众平台上传代码并提交审核发布。

## 说明
- 生产环境请使用 MySQL / PostgreSQL
- 小程序需配置真实的微信登录接口与 AppID

## License
MIT License
