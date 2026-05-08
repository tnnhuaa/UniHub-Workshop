# Contributing to UniHub Workshop

## Quick Start

1. Read [blueprint/proposal.md](blueprint/proposal.md) and [blueprint/design.md](blueprint/design.md) for system context.
2. Follow [blueprint/IMPLEMENTATION-GUIDE.md](blueprint/IMPLEMENTATION-GUIDE.md) for module responsibilities and checks.
3. Use Zod for all DTO validation and `PrismaService` for DB access.

## Package Manager

This project uses **pnpm** exclusively. Do NOT use `npm` or `yarn`.

```bash
pnpm install
```

## Coding Standards

- No raw SQL unless explicitly approved.
- Adapter interfaces for external integrations (`IPaymentGateway`, `INotificationProvider`, `IObjectStorage`, `ILLMClient`).
- Centralize idempotency, rate limiting, and circuit breaker logic.
- Add tests for business-critical flows.
- Derive TypeScript types from Zod schemas via `z.infer<>` — no manual interface/type definitions for DTOs.

## Project Structure

- **Domain modules**: `apps/api/src/modules/<domain>/` — each has controller, service, module, and barrel index.
- **Global modules**: `PrismaModule`, `AuditModule` — available everywhere.
- **Config**: `apps/api/src/config/` — env validation via Zod.
- **Prisma schema**: `prisma/schema.prisma` (monorepo root).

## Verification

```bash
pnpm lint              # ESLint + Prettier
pnpm api:build         # TypeScript compile (0 errors required)
pnpm api:test          # Unit tests
```

## Documentation

- Update `blueprint/` when behavior or assumptions change.
- Keep `docs/ai/` notes up to date for AI assistant usage.
- Produce completion reports in `docs/reports/` per the implement agent workflow.
