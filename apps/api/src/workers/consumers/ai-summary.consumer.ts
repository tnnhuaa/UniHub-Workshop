import type { Channel, ConsumeMessage } from 'amqplib';
import { BaseJobConsumer } from '../base.consumer.js';
import { DocumentService } from '../../modules/document/document.service.js';

interface AiSummaryJobPayload {
  correlationId: string;
  documentId: string;
  workshopId: string;
  jobId: string;
  publishedAt: string;
}

/**
 * AI Summary Consumer — generates workshop document summaries
 */
export class AiSummaryConsumer extends BaseJobConsumer {
  constructor(
    channel: Channel,
    private readonly documentService: DocumentService,
  ) {
    super(channel);
  }

  async handle(msg: ConsumeMessage): Promise<void> {
    const payload = this.parseMessage(msg) as AiSummaryJobPayload | null;

    if (!payload) {
      this.logger.error('Invalid AI summary payload, nacking message');
      this.nack(msg, false);
      return;
    }

    this.logMessage(msg, 'Processing AI summary');

    try {
      await this.documentService.processAiSummaryJob(
        payload.documentId,
        payload.jobId,
      );

      this.logger.log(
        `[${payload.correlationId}] ✓ AI summary completed for document ${payload.documentId}`,
      );
      this.ack(msg);
    } catch (error) {
      this.logger.error(
        `[${payload.correlationId}] AI summary failed (${payload.documentId}):`,
        error,
      );

      if (this.republishWithRetry(msg, 3)) {
        return;
      }

      this.nack(msg, false);
    }
  }
}
