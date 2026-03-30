# Yizu EV Rental Management System

Full-stack project based on **Spring Boot + Vue 3 + WeChat Mini Program** for electric-vehicle rental operations. It includes an admin web console and a mini-program client.

**Features**
- Admin: admin login, user management, vehicle management, orders, deposits, maintenance, announcements
- Mini program: user login/registration, vehicle browsing, view/rent records, favorites, messages, repair requests

**Tech Stack**
- Backend: Spring Boot 3.x, Java 17, Spring Data JPA
- Admin Web: Vue 3, TypeScript, Vite, Element Plus
- Mini Program: WeChat Mini Program (native)

**Structure**
```
backend/         backend service
admin-web/       admin web frontend
wechat-miniapp/  WeChat mini program
```

## Quick Start

### 1. Backend
```bash
cd backend
mvn spring-boot:run
# or
./mvnw spring-boot:run
```
Default: `http://localhost:8080`

### 2. Admin Web
```bash
cd admin-web
npm install
npm run dev
```
Default: `http://localhost:5173`

### 3. Mini Program
1. Open WeChat DevTools
2. Import: `wechat-miniapp/weapp`
3. Set request base URL: `http://localhost:8080`
4. Build & run

## API Examples
- `POST /api/admin/auth/login`
- `POST /api/user/auth/login`
- `POST /api/user/register`
- `POST /api/wechat/auth/login`

## Default Admin
- Username: `admin`
- Password: `123456`

## Config
**Backend**
- `backend/src/main/resources/application.yml`

**Admin Web**
- `admin-web/.env.development`

**Mini Program**
- `wechat-miniapp/weapp/app.js`

## Production (basic)
**Backend**
```bash
mvn clean package -DskipTests
java -jar target/*.jar --spring.profiles.active=prod
```

**Admin Web**
```bash
npm run build
```
Deploy `dist` to Nginx or any static server.

**Mini Program**
Upload in WeChat public platform and submit for review.

## License
MIT License
