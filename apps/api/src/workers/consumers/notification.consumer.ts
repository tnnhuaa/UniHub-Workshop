import type { Channel, ConsumeMessage } from 'amqplib';
import { BaseJobConsumer } from '../base.consumer.js';
import type { NotificationChannel } from '@prisma/client';
import { PrismaService } from '../../modules/prisma/prisma.service.js';
import { NotificationService } from '../../modules/notification/notification.service.js';

interface NotificationJobPayload {
  correlationId: string;
  userId: string;
  channel: NotificationChannel;
  templateCode: string;
  dedupeKey?: string;
  title?: string;
  body?: string;
  publishedAt: string;
}

/**
 * Notification Consumer — processes notification jobs from RabbitMQ
 * Sends notifications via appropriate provider (Email, In-App, etc.)
 */
export class NotificationConsumer extends BaseJobConsumer {
  constructor(
    channel: Channel,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {
    super(channel);
  }

  /**
   * Process incoming notification job
   */
  async handle(msg: ConsumeMessage): Promise<void> {
    const payload = this.parseMessage(msg) as NotificationJobPayload | null;

    if (!payload) {
      this.logger.error('Invalid message payload, nacking message');
      this.nack(msg, false); // Don't requeue invalid messages
      return;
    }

    this.logMessage(msg, 'Processing notification');

    try {
      const correlationId = this.getCorrelationId(msg);

      // Try to send the notification
      const result = await this.sendNotification(payload, correlationId);

      if (result.success) {
        this.logger.log(
          `[${correlationId}] ✓ Notification sent to user ${payload.userId}`,
        );
        this.ack(msg);
      } else {
        if (this.republishWithRetry(msg, 3)) {
          this.logger.warn(
            `[${correlationId}] ⚠ Notification failed, requeued for retry`,
          );
        } else {
          this.logger.error(
            `[${correlationId}] ✗ Notification failed after 3 retries, sending to DLQ`,
          );
          this.nack(msg, false); // Don't requeue, let it go to DLQ
        }
      }
    } catch (error) {
      this.logger.error('Unexpected error processing notification:', error);

      if (this.republishWithRetry(msg, 3)) {
        return;
      } else {
        this.nack(msg, false); // Don't requeue, let it go to DLQ
      }
    }
  }

  /**
   * Send notification using NotificationService
   */
  private async sendNotification(
    payload: NotificationJobPayload,
    correlationId: string,
  ): Promise<{ success: boolean }> {
    try {
      // Check if notification was already sent (dedupe)
      if (payload.dedupeKey) {
        const existing = await this.prisma.notificationDelivery.findUnique({
          where: { dedupeKey: payload.dedupeKey },
        });

        if (existing && existing.status === 'sent') {
          this.logger.debug(
            `[${correlationId}] Notification already sent (deduped)`,
          );
          return { success: true };
        }
      }

      // Send via NotificationService
      const result = await this.notificationService.send({
        userId: payload.userId,
        channel: payload.channel,
        type:
          payload.templateCode === 'workshop_registration_confirmed'
            ? 'workshop_registration_confirmed'
            : 'custom',
        title: payload.title ?? 'Notification',
        body: payload.body ?? payload.templateCode,
      });

      return {
        success: result.deliveries.some((item) => item.status === 'sent'),
      };
    } catch (error) {
      this.logger.error(
        `[${correlationId}] Failed to send notification:`,
        error,
      );
      return { success: false };
    }
  }
}
