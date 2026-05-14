## Essential Commands

**Development**:
- `pnpm install` - install dependencies
- `pnpm api:dev` - start API in watch mode (http://localhost:3000)
- `pnpm web:dev` - start web frontend in watch mode
- `pnpm db:init` - initialize database
- `pnpm db:seed` - seed test data

**Database**:
- `pnpm api:prisma:generate` - generate Prisma client
- `pnpm api:prisma:migrate` - run pending migrations
- `pnpm api:prisma:studio` - open Prisma Studio UI

**Quality**:
- `pnpm lint` - run ESLint on all packages
- `pnpm lint:fix` - fix linting errors in API
- `pnpm format` - format all code with Prettier
- `pnpm api:test` - run API tests
- `pnpm api:test:e2e` - run E2E tests

**Build**:
- `pnpm api:build` - build API
- `pnpm api:start:prod` - run built API
