# UniHub Workshop — Background Workers

This directory contains the background worker processes that consume jobs from RabbitMQ.

## Architecture

Workers are **separate processes** from the main API to enable:
- Independent scaling
- Isolation of resource-intensive operations (CSV import, AI summarization)
- Graceful failure handling without affecting the API
- Easy deployment on separate infrastructure

## Workers

### 1. Notification Worker
- **Queue**: `notification.queue`
- **Routing Key**: `notification.*`
- **Responsibility**: Send notifications via Email, In-App, Telegram
- **Location**: `consumers/notification.consumer.ts`

### 2. CSV Sync Worker
- **Queue**: `csv-sync.queue`
- **Routing Key**: `csv-sync.*`
- **Responsibility**: Process CSV batch imports with chunked streaming
- **Location**: `consumers/csv-sync.consumer.ts`

### 3. AI Summary Worker
- **Queue**: `ai-summary.queue`
- **Routing Key**: `ai-summary.*`
- **Responsibility**: Generate AI summaries for workshop documents via Google Gemini
- **Location**: `consumers/ai-summary.consumer.ts`

## Running Workers

### Local Development

```bash
# Start all workers (from root)
pnpm worker:start

# Or manually:
cd apps/api
pnpm worker:start
```

### Docker Deployment

```bash
# Build worker image
docker build -t unihub-worker:latest .

# Run worker container
docker run --env-file .env \
  --link unihub_rabbitmq \
  --link unihub_postgres \
  --link unihub_redis \
  unihub-worker:latest
```

## Job Payloads

### Notification Job

```json
{
  "correlationId": "notif-1234567890-abc123",
  "userId": "user-id",
  "channel": "email",
  "templateCode": "registration_confirmed",
  "dedupeKey": "reg-user-workshop-1",
  "publishedAt": "2026-05-14T10:00:00Z"
}
```

### CSV Sync Job

```json
{
  "correlationId": "csv-1234567890-abc123",
  "batchId": "batch-uuid",
  "fileUrl": "/tmp/csv-drop/students.csv",
  "chunkSize": 1000,
  "timezone": "UTC",
  "publishedAt": "2026-05-14T01:00:00Z"
}
```

### AI Summary Job

```json
{
  "correlationId": "ai-1234567890-abc123",
  "documentId": "doc-uuid",
  "fileUrl": "s3://bucket/workshops/doc-123.pdf",
  "publishedAt": "2026-05-14T10:00:00Z"
}
```

## Retry & Error Handling

### Retry Logic

- Max retries: 3 attempts
- Retry delay: Exponential backoff via RabbitMQ
- After max retries: Message sent to Dead Letter Queue (DLQ)

### Dead Letter Queue

Failed messages after retries go to `unihub.dlq` for manual inspection.

Access via RabbitMQ management UI: http://localhost:15672 (guest/guest)

## Development Notes

### Adding a New Worker

1. Create consumer class extending `BaseJobConsumer`:
   ```typescript
   export class MyConsumer extends BaseJobConsumer {
     async handle(msg: ConsumeMessage): Promise<void> {
       // Implementation
     }
   }
   ```

2. Register in `main.ts`:
   ```typescript
   const myConsumer = new MyConsumer(channel, ...dependencies);
   await channel.consume(QUEUES.MY_QUEUE, (msg) => myConsumer.handle(msg));
   ```

3. Define job payload interface and constants

### Testing

Run workers locally with:
```bash
pnpm worker:start
```

Publish test messages:
```bash
npm run test:worker
```

## Monitoring

Workers log to stdout with correlation IDs for tracing.

In production, use centralized logging (e.g., ELK, Datadog) to track:
- Job processing time
- Failure rates
- Retry patterns
- Dead letter queue depth
