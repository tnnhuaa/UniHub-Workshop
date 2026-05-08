# Completion Report: NestJS + Fastify Scaffold

**Date**: 2026-05-08
**Phase**: Pha 1 — Foundation & Auth (Thành viên 1: Core Platform)
**Status**: ✅ Complete

---

## Scope

Scaffold NestJS + Fastify project structure, modular module boundaries, PrismaService DI, Prisma schema refinements (unique constraints per design.md), and the second migration.

---

## Completed Tasks

### T1: ConfigModule with Zod env validation ✅

- Installed `@nestjs/config` v4.0.4 and `zod` v4.4.3
- Created `src/config/env.schema.ts` — Zod validation for `DATABASE_URL`, `DIRECT_URL`, `PORT`, `NODE_ENV`
- Created `src/config/config.module.ts` — wraps `@nestjs/config` with Zod `validate` callback
- Env file resolved from monorepo root (`../../.env`)

### T2: Add zod dependency ✅

- Covered by T1. `zod@4.4.3` added to `apps/api/package.json`

### T3: Scaffold domain modules ✅

Created 10 domain modules with controller/service/module/index barrel:

| Module         | Controller                      | Service                             | Notes                        |
| -------------- | ------------------------------- | ----------------------------------- | ---------------------------- |
| `workshop`     | ✅ CRUD endpoints               | ✅ PrismaService DI                 | Exports service              |
| `registration` | ✅ create/findOne/findMine/qr   | ✅ PrismaService DI                 | Exports service              |
| `payment`      | ✅ webhook endpoint             | ✅ PrismaService DI                 | Adapter pattern placeholder  |
| `checkin`      | ✅ scan/confirm/sync/byWorkshop | ✅ PrismaService DI                 | Dedup via device_event_id    |
| `student`      | ✅ findOne                      | ✅ PrismaService DI + upsertFromCsv | Exports for CSV sync         |
| `notification` | — (no controller)               | ✅ PrismaService DI                 | Worker-triggered only        |
| `audit`        | — (no controller)               | ✅ PrismaService DI                 | `@Global()` module           |
| `csv-sync`     | — (no controller)               | ✅ PrismaService DI                 | Worker-only batch management |
| `document`     | ✅ upload/list/summary          | ✅ PrismaService DI                 | IObjectStorage placeholder   |
| `auth`         | — (no controller)               | ✅ PrismaService DI                 | BetterAuth placeholder       |

### T4: Prisma schema refinements ✅

Added unique constraints per design.md SQL schema:

- `@@unique([userId, role])` on `UserRole`
- `@@unique([mssv, workshopId])` on `Registration`
- `@@unique([staffUserId, workshopId])` on `StaffWorkshopAssignment`

### T5: Wire AppModule ✅

- All 13 modules imported into `AppModule`
- Organized: Infrastructure → Cross-cutting (global) → Domain

### T6: Update main.ts ✅

- Global prefix: `api/v1`
- CORS enabled (configurable via `CORS_ORIGIN` env var)
- Bootstrap logger

### T7: Verify build ✅

- `npx nest build` — **0 errors, 0 warnings**
- `npx prisma generate` — Prisma client generated successfully
- Migration deployed to Supabase PostgreSQL

---

## Migrations Applied

| Migration                               | Description                | Status     |
| --------------------------------------- | -------------------------- | ---------- |
| `20260508032423_init`                   | Initial schema (17 models) | ✅ Applied |
| `20260508033700_add_unique_constraints` | 3 unique constraints       | ✅ Applied |

---

## Verification Commands

```bash
npx prisma generate --schema ../../prisma/schema.prisma  # ✅ Success
npx prisma migrate deploy --schema ../../prisma/schema.prisma  # ✅ 2 migrations applied
npx nest build  # ✅ 0 errors
```

---

## Implementation Checklist (Applicable Items)

- [x] Use `PrismaService` wrapper for all DB access via DI
- [x] No raw SQL
- [x] Module boundaries follow SOLID (SRP per module)
- [x] `@Global()` for cross-cutting modules (Prisma, Audit)
- [x] External services use adapter pattern placeholders
- [x] Build succeeds with 0 errors
- [x] `.env.example` updated with all env vars

---

## File Changes Summary

### New Files (30)

- `src/config/` — env.schema.ts, config.module.ts, index.ts
- `src/modules/workshop/` — controller, service, module, index
- `src/modules/registration/` — controller, service, module, index
- `src/modules/payment/` — controller, service, module, index
- `src/modules/checkin/` — controller, service, module, index
- `src/modules/student/` — controller, service, module, index
- `src/modules/notification/` — service, module, index
- `src/modules/audit/` — service, module, index
- `src/modules/csv-sync/` — service, module, index
- `src/modules/document/` — controller, service, module, index
- `src/modules/auth/` — service, module, index
- `prisma/migrations/20260508033700_add_unique_constraints/migration.sql`

### Modified Files (5)

- `apps/api/src/app.module.ts` — wired all 13 modules
- `apps/api/src/main.ts` — added prefix, CORS, logger
- `apps/api/package.json` — added @nestjs/config, zod
- `prisma/schema.prisma` — added 3 unique constraints
- `.env.example` — documented all env vars

---

## Proposed Commit Message

```
feat: scaffold NestJS+Fastify modular structure with domain modules

- Add 10 domain modules (workshop, registration, payment, checkin,
  student, notification, audit, csv-sync, document, auth) with
  skeleton controllers/services using PrismaService DI
- Add ConfigModule with Zod env validation (@nestjs/config + zod)
- Add unique constraints to Prisma schema per design.md:
  UserRole(userId,role), Registration(mssv,workshopId),
  StaffWorkshopAssignment(staffUserId,workshopId)
- Create and apply migration 20260508033700_add_unique_constraints
- Update main.ts: global prefix api/v1, CORS, bootstrap logger
- Update .env.example with comprehensive env var documentation

Refs: docs/plan.md Pha 1 — Thành viên 1 (Core Platform)
```
