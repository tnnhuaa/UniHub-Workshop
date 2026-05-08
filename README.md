# UniHub Workshop

Hệ thống quản lý workshop và đăng ký sự kiện cho sinh viên.

## Tech Stack

- **Backend**: NestJS + Fastify (TypeScript)
- **ORM**: Prisma (PostgreSQL)
- **Validation**: Zod
- **Auth**: BetterAuth (hybrid session + JWT)
- **Cache / Rate Limiting**: Redis
- **Async Jobs**: RabbitMQ workers
- **Storage**: S3-compatible object storage
- **Package Manager**: pnpm (monorepo)

## Monorepo Structure

```
UniHub-Workshop/
├── apps/
│   └── api/                  # NestJS + Fastify backend
│       └── src/
│           ├── config/       # Env validation (Zod)
│           └── modules/      # Domain modules
│               ├── auth/          # BetterAuth integration
│               ├── audit/         # Audit logging (global)
│               ├── workshop/      # Workshop CRUD
│               ├── registration/  # Registration flow
│               ├── payment/       # Payment gateway adapter
│               ├── checkin/       # QR check-in + offline sync
│               ├── student/       # Student profiles
│               ├── notification/  # Notification delivery
│               ├── csv-sync/      # CSV batch import
│               ├── document/      # PDF upload + AI summary
│               ├── prisma/        # PrismaService DI (global)
│               └── health/        # Health check
├── prisma/
│   ├── schema.prisma         # Database schema (17 models)
│   └── migrations/           # Applied migrations
├── blueprint/                # Architecture & design docs
│   ├── proposal.md
│   ├── design.md
│   ├── IMPLEMENTATION-GUIDE.md
│   └── specs/                # Feature specs (auth, payment, checkin, csv-sync)
├── docs/
│   ├── plan.md               # Implementation plan
│   ├── reports/              # Completion reports
│   └── ai/                   # AI assistant context
└── .github/
    ├── agents/               # Copilot agents
    └── prompts/              # Copilot prompts
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL 15+
- Redis (for cache/rate-limit/idempotency)
- RabbitMQ (for async workers)

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy env and configure
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
pnpm api:prisma:generate

# Run migrations
pnpm api:prisma:migrate

# (Optional) Initialize and seed database
pnpm db:init
pnpm db:seed

# Start dev server
pnpm api:dev
```

The API runs at `http://localhost:3000/api/v1`.

## Scripts

| Script                     | Description              |
| -------------------------- | ------------------------ |
| `pnpm db:init`             | Generate + migrate DB    |
| `pnpm db:seed`             | Seed sample data         |
| `pnpm api:dev`             | Start API in watch mode  |
| `pnpm api:build`           | Build API for production |
| `pnpm api:test`            | Run unit tests           |
| `pnpm api:prisma:generate` | Generate Prisma client   |
| `pnpm api:prisma:migrate`  | Run pending migrations   |
| `pnpm lint`                | Lint all packages        |

## Documentation

- [Proposal](blueprint/proposal.md) — Business scope & SLA targets
- [Design](blueprint/design.md) — Architecture, data model, C4 diagrams
- [Implementation Guide](blueprint/IMPLEMENTATION-GUIDE.md) — SOLID/DRY checklist
- [Plan](docs/plan.md) — Phase-by-phase implementation plan

## License

Private — UNLICENSED
