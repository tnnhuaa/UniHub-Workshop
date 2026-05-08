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

Base URL: `http://localhost:3000/api/v1`

| Path                                         | Method             | Module       | Notes                 |
| -------------------------------------------- | ------------------ | ------------ | --------------------- |
| `/health`                                    | GET                | Health       | Health check          |
| `/workshops`                                 | GET, POST          | Workshop     | List/create workshops |
| `/workshops/:id`                             | GET, PATCH, DELETE | Workshop     | CRUD                  |
| `/registrations`                             | POST               | Registration | Register for workshop |
| `/registrations/me`                          | GET                | Registration | My registrations      |
| `/registrations/:id/qr`                      | GET                | Registration | QR code               |
| `/payments/webhook`                          | POST               | Payment      | Payment webhook       |
| `/checkins/scan`                             | POST               | Checkin      | QR scan               |
| `/checkins/confirm`                          | POST               | Checkin      | Confirm check-in      |
| `/checkins/sync`                             | POST               | Checkin      | Offline sync          |
| `/checkins/workshop/:id`                     | GET                | Checkin      | Workshop checkins     |
| `/students/:mssv`                            | GET                | Student      | Student lookup        |
| `/admin/workshops/:id/documents`             | GET, POST          | Document     | PDF upload/list       |
| `/admin/workshops/:id/documents/:id/summary` | GET                | Document     | AI summary            |

## Configuration

See `.env.example` at project root. Required env vars:

- `DATABASE_URL` — PostgreSQL connection (pooler)
- `DIRECT_URL` — PostgreSQL direct connection (migrations)
- `PORT` — Server port (default: 3000)
- `NODE_ENV` — Environment (development/production/test)

## References

- [Implementation Guide](../../blueprint/IMPLEMENTATION-GUIDE.md)
- [Design Doc](../../blueprint/design.md)
- [Prisma Schema](../../prisma/schema.prisma)
