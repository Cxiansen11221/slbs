# Backend (Spring Boot)

## Layers

- `common`: shared models, configs, errors, response envelope
- `modules`: business modules grouped by domain
- `infrastructure`: technical services and integrations

## Package Layout

```text
com.company.wxplatform
├── WxPlatformApplication
├── common
│   ├── api
│   ├── config
│   └── exception
├── infrastructure
│   └── security
└── modules
    ├── auth
    ├── health
    ├── user
    └── wechat
```

## Run

```bash
mvn spring-boot:run
```

## Sample APIs

- `GET /api/health`
- `POST /api/admin/auth/login`
- `GET /api/admin/users`
- `POST /api/wx/auth/login`

