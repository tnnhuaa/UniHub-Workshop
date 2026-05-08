# Implementation Guide — Developer Checklist for SOLID & DRY

**Mục tiêu**: Cung cấp hướng dẫn và checklist rõ ràng để đảm bảo khi implement, mã nguồn tuân thủ SOLID, DRY, dễ kiểm thử và mở rộng. Tài liệu này nằm ở tầng `blueprint/` (cùng cấp với proposal.md, design.md) để định hướng chung cho toàn bộ developer team và agent implementer.

---

## 1. Kiến trúc Services & Adapter Pattern

### Tách Responsibility (SRP)

- **`RegistrationService`**: chỉ lo flow đăng ký (validate request, allocate seat via `SeatAllocator`, persist registration). Không gọi trực tiếp payment gateway.
- **`PaymentService`** (adapter layer): triển khai interface `IPaymentGateway`. Chỉ chịu trách nhiệm giao tiếp với gateway, retry, circuit breaker và idempotency handling.
- **`SeatAllocator` / `CapacityRepository`**: tách phần xử lý tranh chấp chỗ ngồi (DB locks, atomic update cho `workshops.registered_count`).
- **`NotificationService`** (adapter): triển khai interface `INotificationProvider` để support Email, In-App, Telegram, etc.
- **`StorageService`** (adapter): triển khai interface `IObjectStorage` cho PDF upload/download.

**Lợi ích**: Giảm coupling, unit-test từng service độc lập, dễ swap adapter (e.g., mock payment ↔ stripe payment).

---

## 2. Contracts & DTOs (Zod Validation)

- Mỗi endpoint dùng **một DTO nhỏ, rõ ràng**, validate qua **Zod**.
- Ví dụ DTO:
  - `CreateRegistrationDTO` — `{ mssv: string; workshop_id: uuid; idempotencyKey: string }`
  - `ConfirmPaymentDTO` — `{ registration_id: uuid; provider_ref: string }`
  - `CheckinScanDTO` — `{ qr_code: string; device_id: string; timestamp: datetime }`
  - `CsvImportRowDTO` — `{ mssv: string; email: string; full_name: string; ... }`
- **Không** tự viết parser; dùng Zod `z.infer<>` để derive TypeScript types từ schema.

---

## 3. Database Access & Transactions

- Dùng **ORM (Prisma)** hoặc query builder; **KHÔNG viết raw SQL** trừ khi được phê duyệt.
- Sử dụng `PrismaService` (DI wrapper) — không import client trực tiếp vào services.
- Các bước **giữ chỗ + cập nhật count** phải nằm trong **transaction** để đảm bảo atomicity.
- Tránh side-effects (gọi external, send notification) trong cùng transaction; delay đó cho worker.
- Chốt tranh chấp chỗ ngồi dùng:
  - `SELECT ... FOR UPDATE` equivalent (Prisma `findFirstOrThrow` + for-update lock), hoặc
  - Atomic `UPDATE ... WHERE registered_count < capacity` pattern via transaction.

---

## 4. Cross-Cutting Concerns (Centralized)

Gom các chức năng dùng chung vào shared libraries để tránh lặp lại (DRY):

### `libs/idempotency/`
- Middleware để extract `Idempotency-Key` header.
- Util để read/write Redis key `idempotency:{key}` (TTL 24h).
- Decorator hoặc wrapper để apply idempotency tự động cho endpoint/service method.

### `libs/rate-limit/`
- Middleware token-bucket algorithm trên Redis.
- Config ngưỡng per endpoint (e.g., `GET /workshops` = 100 req/min, `POST /registrations` = 10 req/min).
- Return 429 + `Retry-After` header khi vượt ngưỡng.

### `libs/circuit-breaker/`
- Wrapper cho external calls (payment gateway, LLM API).
- Dùng library như `opossum` hoặc `cockatiel` với policy (threshold=5, timeout=5s, openDuration=60s).
- Graceful degradation: khi circuit open, log warning nhưng không crash luồng khác.

---

## 5. Workers & Async Jobs (RabbitMQ)

- Workers consume từ RabbitMQ queue; job handlers phải **idempotent**.
- Persist **job status** vào DB (`csv_import_batches`, `ai_summary_jobs`, `notification_deliveries`, etc.) để audit + retry.
- Không để job chứa side-effect không retryable:
  - ✅ OK: ghi log, send email (với dedupe key), update DB
  - ❌ NOT OK: modify file system cục bộ, API call không có retry logic
- Một job fail → log error, mark job `failed`, admin notification.

---

## 6. Testing Requirements

### Unit Tests
- `SeatAllocator` — test allocation logic + concurrent requests.
- `PaymentService` — mock `IPaymentGateway`, test retry + circuit-breaker logic.
- `IdempotencyUtil` — test duplicate key detection, TTL expiry.

### Integration Tests
- **Hold-then-pay flow**: create registration (hold), confirm payment, verify status update.
- **Duplicate idempotency key**: same request twice → second call returns cached result.
- **Offline checkin dedupe**: two devices check-in same student offline → server accepts first, rejects second.
- **Seat allocation under concurrency**: 100 concurrent requests, only 60 succeed (capacity=60).

---

## 7. Infrastructure & Config

- **Secrets**: All via env vars (`.env` local, env injection in production). No hardcoded passwords.
- **`.env.example`**: Document all required env vars; never commit actual values.
- **NPM scripts** (package.json):
  - `pnpm dev` — start backend + workers locally
  - `pnpm build` — compile TypeScript to JS
  - `pnpm test` — run unit + integration tests
  - `pnpm lint` — ESLint + Prettier
  - `pnpm prisma:generate` — generate Prisma client
  - `pnpm prisma:migrate` — run pending migrations

---

## 8. Documentation

### README.md (root)
- How to clone, install, run locally.
- Database setup (PostgreSQL, Redis, RabbitMQ).
- Seed data script / how to populate test data.

### Service-level README (e.g., `src/modules/registration/README.md`)
- How to use `RegistrationService`, dependencies.
- Example of extending with new adapter.

### Worker README (e.g., `src/workers/README.md`)
- How to run workers locally.
- How to test job idempotency.

### Concurrency Test README (e.g., `tests/concurrency/README.md`)
- How to run seat-allocation stress test.
- Expected results (no oversell, fair allocation).

---

## 9. Code Quality Standards

- **Linting**: `eslint --max-warnings=0` (fail on any warning).
- **Type checking**: `tsc -p tsconfig.json --noEmit` (strict mode).
- **Format**: `prettier` auto-format on save.
- **Modules**: Prefer small, single-responsibility, with explicit interfaces for external integrations.
- **No circular dependencies**: Use dependency injection / services to break cycles.

---

## 10. Pre-Merge Acceptance Checklist

- ✅ Registration/payment flow passes idempotency tests.
- ✅ Seat allocation tests under concurrency (simulated) pass.
- ✅ Offline check-in sync dedupe tests pass.
- ✅ Worker job status persisted, retried appropriately on failure.
- ✅ All TypeScript types valid (no `any`).
- ✅ No raw SQL (except justified in code comments).
- ✅ DTOs validated via Zod.
- ✅ External services use adapter interfaces.
- ✅ Cross-cutting concerns centralized (idempotency, rate-limit, circuit-breaker).
- ✅ Unit + integration tests written and passing.
- ✅ README / docs updated.

---

## 11. Agent Implementer Notes

- Follow `.github/agents/implement.agent.md` workflow (Phase 0 → 1 → 2 → 3).
- Assert each item in this checklist during **Phase 2 (Final Verification)**.
- Produce `docs/reports/` completion report listing which checklist items were verified.
- If any item cannot be implemented, document reason + propose workaround.

---

## Ghi chú

Tài liệu này là **sống** — cập nhật khi blueprint hoặc requirements thay đổi. Agent implement khi chạy cần tham chiếu tài liệu này để đảm bảo SOLID/DRY compliance từ giai đoạn lập kế hoạch (Phase 0) trở đi.
