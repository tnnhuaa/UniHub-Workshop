## Code Conventions & Style

**TypeScript**:
- Strict mode, no `any` without justification
- Use `.js` file extensions in ESM imports (e.g., `import X from './file.js'`)
- Prefer type inference where clear; explicit types for public APIs

**NestJS Modules**:
- Pattern: `{feature}.module.ts`, `{feature}.service.ts`, `{feature}.controller.ts`, `{feature}.schemas.ts`
- Use DI constructor injection, never import singletons directly
- Export services from module for cross-module use

**Validation & DTOs**:
- All inputs validated via Zod schemas (not decorators)
- Derive TypeScript types from Zod: `type MyDTO = z.infer<typeof mySchema>`
- No custom type aliases for DTOs; only Zod-derived types

**Database Access**:
- Use `PrismaService` injected via DI (never import client directly)
- No raw SQL unless explicitly justified with code comments
- Transactions for critical operations (seat allocation, payment + registration)

**Services**:
- Single responsibility principle: one service = one domain concern
- External integrations via adapter interfaces (IPaymentGateway, INotificationProvider, IObjectStorage)
- Graceful error handling with typed exceptions

**Testing**:
- Unit tests: mock external services
- Integration tests: test full flows (registration + payment, offline check-in sync, CSV import)
- Concurrency tests for seat allocation

**Other**:
- Modules follow DDD where possible; keep domain logic out of controllers
- Prefer small, composable services over large monolithic ones
- Use adapters for external services (payment, LLM, storage, notifications)
