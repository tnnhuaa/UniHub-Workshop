# UniHub Workshop API

NestJS + Fastify backend cho hệ thống UniHub Workshop.

## Architecture

Modular monolith với PrismaService DI (`@Global()`). Mỗi domain module chứa controller, service, và barrel index.

### Module Map

| Module         | Type                    | Responsibility                      |
| -------------- | ----------------------- | ----------------------------------- |
| `prisma`       | Infrastructure (Global) | Prisma client lifecycle, DI wrapper |
| `config`       | Infrastructure (Global) | Env validation via Zod              |
| `health`       | Infrastructure          | Health check endpoint               |
| `auth`         | Cross-cutting           | BetterAuth integration, role checks |
| `audit`        | Cross-cutting (Global)  | Centralized audit logging           |
| `workshop`     | Domain                  | Workshop CRUD, search, lifecycle    |
| `registration` | Domain                  | Registration flow, seat allocation  |
| `payment`      | Domain                  | Payment gateway adapter             |
| `checkin`      | Domain                  | QR scan, offline sync, dedup        |
| `student`      | Domain                  | Student profiles, CSV upsert        |
| `notification` | Domain                  | Notification delivery (worker)      |
| `csv-sync`     | Domain                  | CSV batch import (worker)           |
| `document`     | Domain                  | PDF upload, AI summary              |

### Key Patterns

- **PrismaService DI**: All modules inject `PrismaService` — never import `PrismaClient` directly
- **Zod Validation**: DTOs defined as Zod schemas, types derived via `z.infer<>`
- **Adapter Pattern**: External integrations use interfaces (`IPaymentGateway`, `INotificationProvider`, `IObjectStorage`, `ILLMClient`)
- **Global Modules**: `PrismaModule` and `AuditModule` are `@Global()` — available everywhere without explicit import

## Development

```bash
# From monorepo root
pnpm install

# Generate Prisma client
pnpm api:prisma:generate

# Start in watch mode
pnpm api:dev

# Build
pnpm api:build

# Run tests
pnpm api:test

# Lint
pnpm lint
```

## API Endpoints

Base URL: `http://localhost:4000/api/v1`

| Path                                                         | Method             | Module       | Notes                  |
| ------------------------------------------------------------ | ------------------ | ------------ | ---------------------- |
| `/health`                                                    | GET                | Health       | Health check           |
| `/workshops`                                                 | GET, POST          | Workshop     | List/create workshops  |
| `/workshops/:id`                                             | GET, PATCH, DELETE | Workshop     | CRUD                   |
| `/registrations`                                             | POST               | Registration | Register for workshop  |
| `/registrations/me`                                          | GET                | Registration | My registrations       |
| `/registrations/:id/qr`                                      | GET                | Registration | QR code                |
| `/payments/webhook`                                          | POST               | Payment      | Payment webhook        |
| `/payments/mock/success`                                     | POST               | Payment      | Mock payment success   |
| `/payments/mock/failure`                                     | POST               | Payment      | Mock payment failure   |
| `/checkins/scan`                                             | POST               | Checkin      | QR scan                |
| `/checkins/confirm`                                          | POST               | Checkin      | Confirm check-in       |
| `/checkins/sync`                                             | POST               | Checkin      | Offline sync           |
| `/checkins/workshop/:id`                                     | GET                | Checkin      | Workshop checkins      |
| `/students/:mssv`                                            | GET                | Student      | Student lookup         |
| `/notifications`                                             | POST               | Notification | Manual notification    |
| `/notifications/me`                                          | GET                | Notification | Inbox for current user |
| `/notifications/me/:id/read`                                 | PATCH              | Notification | Mark inbox item read   |
| `/admin/workshops/:workshopId/documents`                     | GET, POST          | Document     | PDF upload/list        |
| `/admin/workshops/:workshopId/documents/:documentId/summary` | GET                | Document     | AI summary status/text |

## Configuration

See `.env.example` at project root. Required env vars:

- `DATABASE_URL` — PostgreSQL connection (pooler)
- `DIRECT_URL` — PostgreSQL direct connection (migrations)
- `PORT` — Server port (default: 3000)
- `NODE_ENV` — Environment (development/production/test)
- `BETTER_AUTH_SECRET` — BetterAuth secret (min 32 chars)
- `BETTER_AUTH_URL` — Base auth URL (e.g. `http://localhost:3000/api/v1/auth`)
- `BETTER_AUTH_JWT_ISSUER` — JWT issuer (default: `unihub-api`)
- `BETTER_AUTH_JWT_AUDIENCE` — JWT audience (default: `unihub-mobile`)
- `BETTER_AUTH_JWT_TTL` — JWT expiration (default: `15m`)
- `BETTER_AUTH_SESSION_TTL` — Session TTL (default: `30d`)
- `GOOGLE_OAUTH_CLIENT_ID` — Google OAuth client id
- `GOOGLE_OAUTH_CLIENT_SECRET` — Google OAuth client secret
- `GOOGLE_OAUTH_REDIRECT_URI` — Optional OAuth redirect override
- `SMTP_HOST` — SMTP server hostname
- `SMTP_PORT` — SMTP server port
- `SMTP_SECURE` — `true` for SMTPS, `false` for STARTTLS/plain SMTP
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password
- `SMTP_FROM_NAME` — Display name for outgoing notification email
- `SMTP_FROM_EMAIL` — Sender email address for outgoing notification email

## References

- [Implementation Guide](../../blueprint/IMPLEMENTATION-GUIDE.md)
- [Design Doc](../../blueprint/design.md)
- [Prisma Schema](../../prisma/schema.prisma)
