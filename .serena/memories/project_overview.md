## UniHub Workshop — Project Overview

**Purpose**: Digital workshop registration and check-in system for university events. Manages ~12,000 students registering for workshops across 5 days, with offline check-in support, payment processing, AI summaries, and CSV data sync.

**Tech Stack**:
- Backend: NestJS + Fastify (TypeScript), Prisma ORM + PostgreSQL
- Frontend: React + Vite (web), React Native (mobile - planned)
- Auth: BetterAuth (hybrid session + JWT)
- Cache/Rate Limiting: Redis
- Async Jobs: RabbitMQ workers (notifications, AI summary, CSV sync)
- Storage: S3-compatible object storage
- Validation: Zod (all inputs/outputs)
- Package Manager: pnpm (monorepo)

**Architecture**: Modular monolith with background workers. Key patterns:
- SOLID principles with adapter pattern for external integrations
- Cross-cutting concerns centralized (idempotency, rate-limiting, circuit breaker)
- Transaction-based seat allocation
- Offline-first mobile check-in
- Graceful degradation when payment gateway fails
