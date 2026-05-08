# Working Agreements

## Package Manager

- Use **pnpm** exclusively. Do NOT use npm or yarn.
- Lock file: `pnpm-lock.yaml` only. `package-lock.json` and `yarn.lock` are gitignored.

## Engineering Rules

- Use Zod for all DTO validation; derive types via `z.infer<>`.
- Use `PrismaService` for database access; no raw SQL without approval.
- Apply adapter pattern to external integrations.
- Centralize idempotency, rate limiting, and circuit breaker logic.
- All services inject `PrismaService` via constructor DI — never import `PrismaClient` directly.

## Tests

- Add unit tests for core services.
- Add integration tests for payment, check-in sync, and CSV import.
- Add concurrency tests for seat allocation when touching registration logic.

## Documentation

- Update `blueprint/` when behavior changes.
- Keep this `docs/ai/` directory current.
- Produce completion reports in `docs/reports/` per the implement agent workflow.

## Verification Commands

```bash
pnpm lint              # ESLint + Prettier
pnpm api:build         # TypeScript compile
pnpm api:test          # Unit tests
```
