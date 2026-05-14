## UniHub Workshop — RabbitMQ & CSV Implementation Plan

**User Decisions**:
1. ✅ Actual RabbitMQ (with Docker Compose)
2. ✅ Separate worker processes (`src/workers/` folder, standalone NestJS bootstrap)
3. ✅ Automated scheduling (CSV at 01:00 & 04:00 UTC, +manual trigger API)
4. ✅ Web admin UI with CSV upload
5. ✅ Google Gemini Flash (free) for AI summary
6. ✅ Phase execution order: 1→2→3→4

---

## PHASE 1: RabbitMQ Infrastructure Setup

### 1.1 Environment & Configuration
- Add `RABBITMQ_URL` to `env.schema.ts` (Zod)
- Add RabbitMQ connection vars to `.env.example`
- Create `RabbitMqService` wrapper with retry logic, circuit breaker
- Export queues/exchanges as constants from central location

### 1.2 RabbitMQ Module
- `src/modules/rabbitmq/rabbitmq.module.ts` — provides RabbitMqService globally
- Connection pooling, error handling, reconnection strategy
- DI-injectable service for publishers

### 1.3 Notification Publisher
- Integrate with existing `NotificationService`
- Publish `notification.created` event to `notification-queue`
- Include correlation ID, retry count in message

### 1.4 Infrastructure as Code
- `docker-compose.yml` — RabbitMQ service + PostgreSQL + Redis
- `.env.docker` — defaults for local Docker stack

### 1.5 Worker Bootstrap
- Create `src/workers/` folder
- `src/workers/main.ts` — standalone entry point (NOT NestJS full stack, just consumer bootstrap)
- Worker lifecycle: connect, consume, handle, ack/nack

---

## PHASE 2: CSV Sync Worker + Scheduler

### 2.1 CSV Sync Job Definition
- `src/jobs/csv-sync.job.ts` — DTO for CSV sync job payload
- Include: file_url, batch_id, chunk_size, timezone

### 2.2 CSV Sync Publisher
- In `CsvSyncController` or `CsvSyncService`: publish job to RabbitMQ
- Support manual trigger (`POST /csv-sync/batches/:id/process`) and scheduled

### 2.3 Scheduler Setup
- `@nestjs/schedule` integration
- Cron job: `0 1,4 * * *` (01:00 & 04:00 UTC)
- Check for pending CSV files in drop location (filesystem or SFTP)
- Publish job to queue for each file

### 2.4 CSV Sync Worker Consumer
- `src/workers/consumers/csv-sync.consumer.ts`
- Chunked streaming, validation, retry with backoff
- Update `csv_import_batches` status as it progresses
- Write errors to `csv_import_errors` table

---

## PHASE 3: Document/AI Summary Jobs

### 3.1 Google Gemini Adapter
- `src/modules/document/adapters/gemini-llm.adapter.ts` — implement `ILLMClient`
- Call Google Gemini Flash API (free tier)
- Retry logic, timeout handling

### 3.2 Storage Adapter (Mock + S3)
- `src/modules/document/adapters/mock-storage.adapter.ts` — in-memory file storage
- `src/modules/document/adapters/s3-storage.adapter.ts` (stub, for future)
- Implement `IObjectStorage`

### 3.3 AI Summary Job Definition
- `src/jobs/ai-summary.job.ts` — DTO for AI job

### 3.4 AI Summary Publisher
- Modify `DocumentService.uploadPDF()` to publish job instead of sync call
- Include document_id, file_url in message

### 3.5 AI Summary Worker Consumer
- `src/workers/consumers/ai-summary.consumer.ts`
- Fetch document from storage, call Gemini, update `AiSummaryJob` status
- Retry on rate limit / transient errors

---

## PHASE 4: Web Admin UI

### 4.1 CSV Upload Component
- `apps/web/src/components/AdminCsvUpload.tsx`
- Drag-drop or file input, progress bar
- Endpoint: `POST /admin/csv-sync/upload`

### 4.2 CSV Batch Status Page
- `apps/web/src/pages/AdminCsvImportStatus.tsx`
- List recent batches: status, counts, error log detail
- Endpoint: `GET /admin/csv-sync/batches`

### 4.3 API Endpoints (Backend)
- `POST /admin/csv-sync/upload` — receive file, save to drop location, publish job
- `GET /admin/csv-sync/batches` — list with pagination + filters
- `GET /admin/csv-sync/batches/:id` — detail + errors

### 4.4 Dashboard Integration
- Link to CSV import status from admin dashboard

---

## Dependencies & Ordering

**Critical path**:
1. Env config + RabbitMQ module ✓ Phase 1
2. Notification publisher ✓ Phase 1 (validates RabbitMQ setup)
3. CSV scheduler + publisher ✓ Phase 2
4. CSV worker consumer ✓ Phase 2
5. Gemini adapter ✓ Phase 3
6. AI worker consumer ✓ Phase 3
7. Web UI ✓ Phase 4

**Blockers**: None (can start Phase 1 immediately)

---

## Acceptance Criteria

**Phase 1**:
- ✅ RabbitMQ container runs locally via Docker
- ✅ Notification published to queue
- ✅ Mock notification consumer acknowledges message

**Phase 2**:
- ✅ CSV job published and consumed
- ✅ Scheduler triggers job at correct times
- ✅ Batch status updates in DB
- ✅ Error rows logged correctly
- ✅ Manual trigger API works

**Phase 3**:
- ✅ Gemini adapter calls API and returns summary
- ✅ AI job publishes and consumes
- ✅ AI summary stored in DB with status
- ✅ Retry logic works for transient failures

**Phase 4**:
- ✅ Web admin can upload CSV file
- ✅ Batch list page shows recent imports
- ✅ Status updates in real-time (or refresh shows latest)
- ✅ Error details accessible
