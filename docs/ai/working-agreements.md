# Working Agreements

## Engineering Rules

- Use Zod for all DTO validation; derive types via z.infer.
- Use PrismaService for database access; no raw SQL without approval.
- Apply adapter pattern to external integrations.
- Centralize idempotency, rate limiting, and circuit breaker logic.

## Tests

- Add unit tests for core services.
- Add integration tests for payment, check-in sync, and CSV import.
- Add concurrency tests for seat allocation when touching registration logic.

## Documentation

- Update blueprint/ when behavior changes.
- Keep this docs/ai/ directory current.
