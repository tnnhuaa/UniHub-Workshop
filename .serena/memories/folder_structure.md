## Project Folder Structure

```
apps/api/src/
├── config/          # Environment validation (Zod schemas)
├── modules/         # Domain modules (13 total)
│   ├── auth/        # BetterAuth integration + session management
│   ├── audit/       # Audit logging service (global concern)
│   ├── workshop/    # Workshop CRUD + queries
│   ├── registration/# Registration flow (seat allocation, hold logic)
│   ├── payment/     # Payment adapter + gateway integration
│   ├── checkin/     # QR scan + offline sync
│   ├── student/     # Student profiles + CSV sync
│   ├── notification/# Email/In-App notification delivery
│   ├── csv-sync/    # CSV batch import + error handling
│   ├── document/    # PDF upload + AI summary jobs
│   ├── prisma/      # PrismaService DI wrapper (global)
│   └── health/      # Health check endpoint
├── libs/            # Shared libraries (planned)
│   ├── idempotency/ # Idempotency middleware + Redis util
│   ├── rate-limit/  # Token bucket rate limiter
│   └── circuit-breaker/
├── shared/
│   ├── errors/      # Custom exception classes
│   └── validation/  # Shared Zod schemas / types
├── main.ts          # Entry point
├── app.module.ts    # Root module
├── app.controller.ts
└── app.service.ts

apps/web/src/
├── components/      # Reusable UI components
├── pages/           # Page components (routes)
├── hooks/           # Custom React hooks
├── lib/             # API client, auth client, utilities
├── styles/          # Global CSS
└── main.tsx         # React entry point

prisma/
├── schema.prisma    # 17 models (BetterAuth + app tables)
└── migrations/      # Applied migrations (3 so far)

blueprint/           # Architecture documentation
├── proposal.md      # High-level requirements
├── design.md        # Technical design + C4 diagrams
├── IMPLEMENTATION-GUIDE.md # SOLID checklist
└── specs/           # Feature specs (auth, payment, checkin, csv-sync)

docs/
├── plan.md
└── reports/         # Completion reports
```
