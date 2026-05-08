## Plan: Task chi tiết cho 3 thành viên

Triển khai toàn bộ UniHub theo blueprint trong 5 pha, phân công theo 3 stream song song: Core Platform, Business Flows, Async/Integration. Chọn LLM provider là Google Gemini; CSV hỗ trợ cả S3 và SFTP qua adapter, ưu tiên go-live với S3 trước và bật SFTP ở pha hardening.

**Package Manager**: pnpm (monorepo workspace)

**Progress**

| Pha                                    | Status         | Notes                        |
| -------------------------------------- | -------------- | ---------------------------- |
| Pha 0 — Alignment & Setup              | ✅ Done        | Tech decisions locked        |
| Pha 1 — Foundation & Auth              | 🔄 In Progress | Scaffold done, auth pending  |
| Pha 2 — Core Business                  | 🔄 In Progress | DB schema + seed đã cập nhật |
| Pha 3 — Payment + Checkin + Workers    | ⬜ Not Started |                              |
| Pha 4 — Verification, CI/CD, Hardening | ⬜ Not Started |                              |
| Pha 5 — Release Readiness              | ⬜ Not Started |                              |

**Pha 1 Completion Tracking**

| Task                                                                               | Owner        | Status         | Report                                                                              |
| ---------------------------------------------------------------------------------- | ------------ | -------------- | ----------------------------------------------------------------------------------- |
| Scaffold NestJS + Fastify + modules + PrismaService DI + Prisma schema + migration | Thành viên 1 | ✅ Done        | [001-scaffold](reports/001-scaffold-nestjs-fastify-completion-report.md)            |
| DB schema/index/seed + CSVLog naming sync                                          | Thành viên 1 | ✅ Done        | [002-db-schema-csvlog-seed](reports/002-db-schema-csvlog-seed-completion-report.md) |
| Workshop/Registration skeleton + Zod validation + error handling                   | Thành viên 2 | ⬜ Not Started |                                                                                     |
| Redis/RabbitMQ integration + adapter contracts                                     | Thành viên 3 | ⬜ Not Started |                                                                                     |
| Auth/RBAC: BetterAuth hybrid session+JWT + role guards                             | All          | ✅ Done        |                                                                                     |

---

**Steps**

1. Pha 0 — Alignment & Setup (Ngày 1)

- Chốt quyết định kỹ thuật: Gemini, CSV source strategy (S3-first, SFTP-enabled).
- Chốt Definition of Done, coding standards, branch strategy, review ownership.
- _blocks all next steps_

2. Pha 1 — Foundation & Auth (Ngày 2-4)

- Thành viên 1 (Core Platform): scaffold NestJS + Fastify, cấu trúc modules, PrismaService DI, `prisma/schema.prisma` bản đầu, migration đầu tiên. ✅ **Done**
- Thành viên 2 (Business): dựng module Workshop/Registration skeleton, Zod validation layer, error handling chuẩn. _parallel with Thành viên 1 once project scaffold exists_
- Thành viên 3 (Async/Integration): dựng Redis/RabbitMQ integration layer, base adapter contracts (`IPaymentGateway`, `INotificationProvider`, `ILLMClient`, `IStorageAdapter`). _parallel with Thành viên 2_
- Auth/RBAC chung: BetterAuth hybrid session+JWT, role guards theo [blueprint/specs/auth.md](../blueprint/specs/auth.md). _depends on initial DB schema_

3. Pha 2 — Core Business (Ngày 5-8)

- Thành viên 1: hoàn thiện DB schema (User, Workshop, Registration với `heldUntil`, Checkin, CSVLog, JobStatus), index/constraints, seed data.
- Thành viên 2: triển khai Workshop CRUD + search/filter + pagination + policy checks. _depends on Thành viên 1 schema_
- Thành viên 3: cross-cutting libs: idempotency Redis, rate-limit token bucket, circuit-breaker wrapper. _parallel with Thành viên 2_

4. Pha 3 — Payment + Checkin + Workers (Ngày 9-14)

- Thành viên 2 (lead payment): SeatAllocator transaction-safe, hold-then-pay, webhook processing, held-seat cleanup scheduler theo [blueprint/specs/payment.md](../blueprint/specs/payment.md). _depends on Pha 2 complete_
- Thành viên 1 (lead check-in): check-in sync APIs, dedup strategy bằng unique constraints/tx id theo [blueprint/specs/checkin.md](../blueprint/specs/checkin.md). _depends on Pha 2 schema_
- Thành viên 3 (lead async): RabbitMQ workers cho notifications, AI summary (Gemini adapter), CSV sync worker (S3 ingest v1 + SFTP adapter v1.1) theo [blueprint/specs/csv-sync.md](../blueprint/specs/csv-sync.md). _parallel with Thành viên 1/2_

5. Pha 4 — Verification, CI/CD, Hardening (Ngày 15-18)

- Thành viên 1: integration tests (DB+API), migration safety checks, OpenAPI generation.
- Thành viên 2: concurrency tests seat allocation (200-500 requests), end-to-end registration→payment→confirm→check-in.
- Thành viên 3: worker reliability tests (retry/DLQ), CSV large-file chunk tests, Gemini failure fallback tests.
- Cả team: CI workflow (lint/type/test/build), docker-compose, `.env.example`, README runbook. _depends on all feature streams merged_

6. Pha 5 — Release Readiness (Ngày 19-20)

- Bugfix window, performance tuning, observability baseline (metrics/logging/alerts), release checklist.
- Feature flag rollout: payment/check-in gradual enablement.
- _depends on Pha 4 green pipeline_

**Task Breakdown by Member**

1. Thành viên 1 — Core Platform & Data

- Sở hữu: project skeleton, Prisma schema/migrations, auth integration support, check-in APIs, integration test infra, OpenAPI.
- Deliverables:
  - `apps/api` bootstrap + module boundaries ✅
  - `prisma/schema.prisma` + migrations + seed ✅
  - `data/init-db.js` + `data/seed.js` + script `pnpm db:init`, `pnpm db:seed` ✅
  - auth guards/decorators wiring with BetterAuth
  - check-in dedup endpoints + contracts
  - integration test harness + API docs generation

2. Thành viên 2 — Business Flow Owner

- Sở hữu: workshop lifecycle, registration flow, seat allocation, payment orchestration, concurrency correctness.
- Deliverables:
  - Workshop CRUD/search endpoints + validation
  - Registration orchestration service
  - Seat hold/confirm/cancel flows
  - payment webhook + reconciliation logic
  - concurrency test suite and capacity invariants

3. Thành viên 3 — Async & External Integrations

- Sở hữu: Redis/Rabbit infra, idempotency/rate-limit/circuit-breaker, AI summary Gemini, CSV sync adapters.
- Deliverables:
  - reusable cross-cutting libraries
  - RabbitMQ worker framework (retry, DLQ, observability hooks)
  - Gemini adapter implementation + prompt contract boundary
  - CSV sync worker with `IStorageAdapter`: S3 implementation (MVP) + SFTP implementation (phase hardening)

**Parallelism & Dependencies**

- Có thể chạy song song sớm: module scaffolding, adapter contracts, validation/error framework.
- Phụ thuộc cứng: payment/check-in cần schema ổn định; workers cần contract ổn định từ business modules.
- Merge strategy: feature branches theo stream, integrate qua weekly integration branch + daily smoke checks.

**Relevant files**

- [blueprint/proposal.md](../blueprint/proposal.md) — business scope và SLA mục tiêu
- [blueprint/design.md](../blueprint/design.md) — kiến trúc tổng thể và data model định hướng
- [blueprint/IMPLEMENTATION-GUIDE.md](../blueprint/IMPLEMENTATION-GUIDE.md) — quy tắc bắt buộc (Prisma DI, Zod, adapters, cross-cutting)
- [blueprint/specs/auth.md](../blueprint/specs/auth.md) — auth/RBAC contract
- [blueprint/specs/payment.md](../blueprint/specs/payment.md) — payment + seat hold semantics
- [blueprint/specs/checkin.md](../blueprint/specs/checkin.md) — offline-first sync/dedup
- [blueprint/specs/csv-sync.md](../blueprint/specs/csv-sync.md) — nightly sync, chunking, conflict strategy

**Verification**

1. `pnpm lint && pnpm api:build && pnpm api:test` pass trên CI cho mọi PR.
2. Concurrency test: số registration accepted không vượt `capacity` dưới tải song song 200-500 requests.
3. E2E flow: workshop publish → register → hold → pay → confirm → check-in.
4. Worker reliability: retry + DLQ + idempotent reprocessing validated.
5. CSV sync: chạy được qua S3 (MVP), test contract tương đương cho SFTP adapter.

**Decisions**

- LLM provider: **Google Gemini** (đã chốt).
- CSV source: **hỗ trợ cả S3 và SFTP** qua storage adapter; ưu tiên production ban đầu với S3, SFTP bật sau khi hardening.
- Scope gồm backend + workers + infra/devops; không gồm frontend/mobile implementation chi tiết.
- Package manager: **pnpm** (monorepo workspace). Không dùng npm hoặc yarn.

**Further Considerations**

1. Với CSV dual-source, nên chọn Option A: S3 làm primary scheduler, SFTP chạy manual/on-demand trong giai đoạn đầu để giảm rủi ro vận hành.
2. Thiết lập release train 1 tuần/lần để gom thay đổi liên module, tránh drift schema/contract giữa 3 stream.
3. Áp dụng checklist review bắt buộc cho các PR liên quan transaction/concurrency/payment.
