# Project Context

## Domain Summary

UniHub Workshop manages workshop registration, payment holds, offline check-in, AI summaries, and nightly CSV sync.

## Core Constraints

- Prevent oversell under concurrency.
- Handle payment instability via circuit breaker and idempotency.
- Support offline check-in with dedupe on sync.
- Import student data nightly from CSV.

## Architecture Summary

- Modular monolith backend with background workers.
- PostgreSQL for transactional data, Redis for ephemeral state.
- RabbitMQ for async jobs (notifications, AI summary, CSV sync).
- Object storage for PDFs and AI artifacts.

## Current State (Pha 1)

- NestJS + Fastify scaffold complete with 12 modules.
- PrismaService DI wrapper (`@Global()`) wired into all services.
- ConfigModule with Zod env validation.
- Prisma schema: 17 models, 2 migrations applied (init + unique constraints).
- API prefix: `/api/v1` with CORS enabled.
- Package manager: pnpm (monorepo workspace).

## Module Map

| Module         | Status      | Purpose                              |
| -------------- | ----------- | ------------------------------------ |
| `prisma`       | ✅ Ready    | DB access via DI                     |
| `config`       | ✅ Ready    | Env validation                       |
| `health`       | ✅ Ready    | Health check                         |
| `auth`         | ✅ Ready    | BetterAuth hybrid session/JWT + RBAC |
| `audit`        | ✅ Ready    | Audit logging                        |
| `workshop`     | ✅ Done     | Workshop CRUD                        |
| `registration` | ✅ Done     | Registration flow                    |
| `payment`      | ✅ Done     | Payment adapter                      |
| `checkin`      | 🔧 Skeleton | QR + offline sync                    |
| `student`      | 🔧 Skeleton | Student profiles                     |
| `notification` | 🔧 Skeleton | Notifications                        |
| `csv-sync`     | 🔧 Skeleton | CSV import                           |
| `document`     | 🔧 Skeleton | PDF + AI summary                     |
