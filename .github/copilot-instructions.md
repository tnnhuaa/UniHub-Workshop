# UniHub Workshop Copilot Instructions

## Project Context

- Architecture: modular monolith + background workers
- Backend: NestJS + Fastify (TypeScript)
- ORM: Prisma with PostgreSQL
- Validation: Zod schemas for all inputs and outputs
- Auth: BetterAuth (hybrid session + JWT)
- Cache/state: Redis (idempotency, rate limiting)
- Async: RabbitMQ workers (notifications, AI summary, CSV sync)
- Storage: object storage for PDFs and AI artifacts

## Must Follow

- No raw SQL unless explicitly approved and justified in code comments.
- Use PrismaService via DI; do not import Prisma client directly in services.
- Validate req.body/req.query/req.params with Zod; derive types via z.infer.
- Use adapter interfaces for external integrations (payment, notification, LLM, storage).
- Keep cross-cutting concerns centralized (idempotency, rate-limit, circuit breaker).
- Keep docs in sync with blueprint/ and IMPLEMENTATION-GUIDE.

## Verification

- Prefer repo scripts when available (pnpm lint, pnpm test, pnpm build).
- If adding registration/payment features, include concurrency tests for seat allocation.

## File Guide

- Primary specs: blueprint/proposal.md, blueprint/design.md, blueprint/specs/\*
- Implementation checklist: blueprint/IMPLEMENTATION-GUIDE.md
- Agents and prompts: .github/agents/_, .github/prompts/_
