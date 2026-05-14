# Completion Report: RabbitMQ, CSV Sync, AI Summary, and Admin CSV Upload

## Scope
Implemented the RabbitMQ-backed background worker flow, CSV import scheduling/upload, Gemini-powered AI summary processing, and the admin CSV upload UI.

## Completed Work
- Added a global RabbitMQ module and service for publishing queued jobs.
- Added queue constants, DLQ wiring, and worker consumer base helpers.
- Added standalone worker consumers for notifications, CSV sync, and AI summary jobs.
- Added a worker bootstrap entrypoint that runs against the compiled API output.
- Added CSV sync scheduling at 01:00 and 04:00 UTC.
- Added CSV upload handling and batch listing endpoints for admins.
- Added Gemini Flash and local file-storage adapters for document processing.
- Updated document processing to queue AI summary work instead of handling it inline.
- Added a dedicated admin CSV Import page with upload, refresh, and batch status display.
- Added shared frontend API helpers for multipart uploads and CSV batch queries.
- Added Docker Compose support for PostgreSQL, Redis, RabbitMQ, and MinIO.
- Added environment variables for RabbitMQ, CSV sync, Gemini, and document storage.

## Verification
- `pnpm api:build`: passed.
- `pnpm -C apps/web build`: passed.
- `pnpm worker:start`: passed and reached the worker idle state after connecting to RabbitMQ.

## Checklist
- Registration/payment flow passes idempotency tests: not run in this slice.
- Seat allocation tests under concurrency pass: not run in this slice.
- Offline check-in dedupe tests pass: not run in this slice.
- Worker job status persisted and retried: pass for implementation; runtime retry path added in worker consumers, but no dedicated test run.
- All TypeScript types valid (no `any`): pass for `pnpm api:build` and `pnpm -C apps/web build`.
- No raw SQL: pass; no raw SQL was added.
- DTOs validated via Zod: pass; new CSV endpoints continue using Zod validation.
- External services use adapter interfaces: pass; document processing remains behind storage/LLM adapters.
- Cross-cutting concerns centralized: pass; RabbitMQ wiring, scheduling, and worker helpers are centralized in dedicated modules.
- Tests and docs complete: partial; completion report and worker README added, but no new automated tests were added in this slice.

## Notes
- The worker start path originally failed under `ts-node` due to ESM/CommonJS loader mismatch; the final script now builds the API and runs `dist/workers/main.js`.
- The CSV upload UI queues files to the backend immediately and shows the latest batch list on refresh.
- Gemini integration uses `GEMINI_API_KEY`; local storage uses `DOCUMENT_STORAGE_PATH`.
- The repo now includes `docker-compose.yml` for local RabbitMQ/Redis/PostgreSQL/MinIO setup.

## Proposed Commit Message
```text
feat(api): integrate rabbitmq csv sync ai summary

- Added RabbitMQ module and standalone worker consumers for async processing
- Implemented CSV sync scheduler, upload, and listing endpoints
- Integrated Gemini and local storage adapters with queued AI summary flow
- Added admin CSV import UI and shared web API helpers
- Updated docker-compose and environment configurations
- Modified worker startup scripts
```
