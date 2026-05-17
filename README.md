# UniHub Workshop

A workshop management system for student event registration, mock payments, CSV synchronization, and offline check-in.

## Tech Stack

- **Frontend Web**: React + Vite
- **Backend**: NestJS + Fastify (TypeScript)
- **Mobile Check-in**: Expo / React Native
- **ORM**: Prisma (PostgreSQL)
- **Validation**: Zod
- **Auth**: BetterAuth (web session + mobile JWT)
- **Cache / Rate Limiting / Idempotency**: Redis
- **Async Jobs**: RabbitMQ workers
- **Storage**: Local storage / S3-compatible object storage (MinIO)
- **Package Manager**: pnpm monorepo

## Monorepo Structure

```text
UniHub-Workshop/
├── apps/
│   ├── api/                  # NestJS + Fastify backend
│   │   └── src/
│   │       ├── config/       # Env validation (Zod)
│   │       ├── modules/      # Domain modules
│   │       └── workers/      # RabbitMQ worker process
│   ├── web/                  # React + Vite web app
│   └── mobile/               # Expo mobile check-in app
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── blueprint/                # Architecture and design docs
├── docs/
├── data/                     # Seed/init scripts and CSV fixtures
├── docker-compose.yml        # PostgreSQL, Redis, RabbitMQ, MinIO
└── package.json              # Root pnpm scripts
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker Desktop
- Git

You do not need to install PostgreSQL, Redis, or RabbitMQ directly on your machine if you use the provided `docker-compose.yml`.

## Quick Start

Run all commands from the repository root.

```bash
pnpm install
```

### 1. Start Docker Services

```bash
docker compose up -d postgres redis rabbitmq minio
```

Local services:

| Service | URL / Port | Credentials |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | `unihub_user` / `unihub_password` |
| Redis | `localhost:6379` | No password |
| RabbitMQ AMQP | `localhost:5672` | `guest` / `guest` |
| RabbitMQ UI | `http://localhost:15672` | `guest` / `guest` |
| MinIO API | `http://localhost:9000` | `minioadmin` / `minioadmin` |
| MinIO Console | `http://localhost:9001` | `minioadmin` / `minioadmin` |

Check container status:

```bash
docker compose ps
```

Stop services:

```bash
docker compose down
```

Stop services and remove local volumes:

```bash
docker compose down -v
```

### 2. Create Env Files

Create the root `.env` file:

```bash
cp .env.example .env
```

If you are using the repository Docker Compose setup, update these values in `.env`:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
VITE_API_BASE_URL=http://localhost:3000/api/v1

DATABASE_URL="postgresql://unihub_user:unihub_password@localhost:5432/unihub_db"
DIRECT_URL="postgresql://unihub_user:unihub_password@localhost:5432/unihub_db"

REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672

S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=unihub-uploads

BETTER_AUTH_SECRET=dev-super-secret-key-change-me-123456
BETTER_AUTH_URL=http://localhost:3000/api/v1/auth
BETTER_AUTH_JWT_ISSUER=unihub-api
BETTER_AUTH_JWT_AUDIENCE=unihub-mobile
BETTER_AUTH_JWT_TTL=15m
BETTER_AUTH_SESSION_TTL=30d
GOOGLE_OAUTH_CLIENT_ID=dev-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=dev-google-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/v1/auth/callback/google

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=dev
SMTP_PASS=dev
SMTP_FROM_NAME=UniHub Workshop
SMTP_FROM_EMAIL=no-reply@unihub.local

PAYMENT_PROVIDER=mock
PAYMENT_WEBHOOK_SECRET=dev-webhook-secret
GEMINI_API_KEY=dev-placeholder
```

Create the web app env file:

```bash
cp apps/web/.env.example apps/web/.env
```

Make sure `apps/web/.env` points to the local API:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. Prepare the Database

```bash
pnpm api:prisma:generate
pnpm api:prisma:migrate
pnpm db:seed
```

Or run generate + migrate together:

```bash
pnpm db:init
pnpm db:seed
```

### 4. Run API, Worker, and Web in Parallel

Open 3 separate terminals.

Terminal 1 - Backend API:

```bash
pnpm api:dev
```

The API runs at:

```text
http://localhost:3000/api/v1
```

Terminal 2 - RabbitMQ worker:

```bash
pnpm worker:start
```

The worker handles background jobs such as notifications, CSV sync, document/AI summary tasks, and other jobs published through RabbitMQ.

Terminal 3 - Frontend web:

```bash
pnpm -C apps/web dev
```

The web app runs at:

```text
http://localhost:5173
```

You can also start the API and web app quickly from the root:

```bash
pnpm dev
```

The worker should still run in a separate terminal:

```bash
pnpm worker:start
```

## Optional: Run the Mobile Check-in App

The mobile app is located in `apps/mobile`.

```bash
pnpm -C apps/mobile start
```

For Android emulator:

```bash
pnpm -C apps/mobile android
```

For Expo web:

```bash
pnpm -C apps/mobile web
```

For Android emulator, if the app needs to call the API running on the host machine, use:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
```

For a physical device on the same LAN, replace `localhost` with the IP address of the machine running the backend.

## Seed Test Data

Run:

```bash
pnpm db:seed
```

The seed script creates sample data for the main flows:

- BetterAuth accounts for `student`, `organizer`, and `checkin_staff`
- Student profiles, workshops, registrations, payments, and check-ins
- Staff assignments, workshop documents, AI summary jobs
- Notifications, audit logs, CSV import batches, and CSV import errors

Sample accounts:

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@unihub.local` | `Test@123456` |
| Organizer | `organizer@unihub.local` | `Test@123456` |
| Check-in staff | `checkin@unihub.local` | `Test@123456` |

CSV import fixture:

```text
data/fixtures/students-import-sample.csv
```

## Useful Scripts

| Script | Description |
| --- | --- |
| `pnpm install` | Install monorepo dependencies |
| `pnpm dev` | Run all workspace packages that have a `dev` script in parallel |
| `pnpm build` | Build all workspace packages |
| `pnpm db:init` | Generate Prisma client and run migrations |
| `pnpm db:seed` | Seed sample data |
| `pnpm api:dev` | Run the backend API in watch mode |
| `pnpm api:build` | Build the backend API |
| `pnpm api:test` | Run backend unit tests |
| `pnpm api:prisma:generate` | Generate Prisma client |
| `pnpm api:prisma:migrate` | Run Prisma migrations |
| `pnpm worker:start` | Build the API and start the worker process |
| `pnpm worker:build` | Build the worker |
| `pnpm worker:start:prod` | Start the worker from `dist` |
| `pnpm -C apps/web dev` | Run the frontend web app |
| `pnpm -C apps/mobile start` | Run the Expo mobile app |
| `pnpm lint` | Lint the workspace |

## Troubleshooting

### Port Already in Use

Check ports `3000`, `5173`, `5432`, `5672`, `6379`, `9000`, `9001`, and `15672`. If Docker reports a port conflict, stop the local service using that port or change the port mapping in `docker-compose.yml`.

### API Cannot Connect to the Database

Make sure `.env` uses the Docker Compose credentials:

```env
DATABASE_URL="postgresql://unihub_user:unihub_password@localhost:5432/unihub_db"
DIRECT_URL="postgresql://unihub_user:unihub_password@localhost:5432/unihub_db"
```

Then run:

```bash
docker compose ps
pnpm api:prisma:migrate
```

### Web App Calls the Wrong API Port

If the web app cannot reach the API, check `apps/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

After changing a Vite env file, stop and restart:

```bash
pnpm -C apps/web dev
```

### Worker Does Not Receive Jobs

Make sure RabbitMQ is running:

```bash
docker compose ps rabbitmq
```

Open RabbitMQ UI at `http://localhost:15672` with `guest` / `guest`, then check connections and queues when the API publishes a job.

### Reset Local Data

```bash
docker compose down -v
docker compose up -d postgres redis rabbitmq minio
pnpm db:init
pnpm db:seed
```

## Documentation

- [Combined Blueprint](blueprint.md)
- [Proposal](blueprint/proposal.md)
- [Design](blueprint/design.md)
- [Implementation Guide](blueprint/IMPLEMENTATION-GUIDE.md)
- [Plan](docs/plan.md)
- [API README](apps/api/README.md)
- [Workers README](apps/api/src/workers/README.md)

## License

Private - UNLICENSED
