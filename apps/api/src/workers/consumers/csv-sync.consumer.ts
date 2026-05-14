import type { Channel, ConsumeMessage } from 'amqplib';
import { BaseJobConsumer } from '../base.consumer.js';
import { CsvSyncService } from '../../modules/csv-sync/csv-sync.service.js';

interface CsvSyncJobPayload {
  correlationId: string;
  batchId: string;
  fileUrl: string;
  chunkSize: number;
  timezone: string;
  publishedAt: string;
}

/**
 * CSV Sync Consumer — processes CSV import batches
 */
export class CsvSyncConsumer extends BaseJobConsumer {
  constructor(
    channel: Channel,
    private readonly csvSyncService: CsvSyncService,
  ) {
    super(channel);
  }

  async handle(msg: ConsumeMessage): Promise<void> {
    const payload = this.parseMessage(msg) as CsvSyncJobPayload | null;

    if (!payload) {
      this.logger.error('Invalid CSV sync payload, nacking message');
      this.nack(msg, false);
      return;
    }

    this.logMessage(msg, 'Processing CSV sync');

    try {
      await this.csvSyncService.processBatch(payload.batchId);
      this.logger.log(
        `[${payload.correlationId}] ✓ CSV batch processed (${payload.batchId})`,
      );
      this.ack(msg);
    } catch (error) {
      this.logger.error(
        `[${payload.correlationId}] CSV batch failed (${payload.batchId}):`,
        error,
      );

      if (this.republishWithRetry(msg, 3)) {
        return;
      }

      this.nack(msg, false);
    }
  }
}
