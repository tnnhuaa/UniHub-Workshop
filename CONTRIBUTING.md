# Contributing to UniHub Workshop

## Quick Start

1. Read blueprint/proposal.md and blueprint/design.md for system context.
2. Follow blueprint/IMPLEMENTATION-GUIDE.md for module responsibilities and checks.
3. Use Zod for all DTO validation and PrismaService for DB access.

## Coding Standards

- No raw SQL unless explicitly approved.
- Adapter interfaces for external integrations.
- Centralize idempotency, rate limiting, and circuit breaker logic.
- Add tests for business-critical flows.

## Verification

- pnpm lint
- pnpm test
- pnpm build

## Documentation

- Update blueprint/ when behavior or assumptions change.
- Keep docs/ai/ notes up to date for Copilot usage.
