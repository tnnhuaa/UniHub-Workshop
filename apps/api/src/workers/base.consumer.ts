import type { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@nestjs/common';

/**
 * Base consumer for all RabbitMQ job workers
 * Handles message parsing, error handling, and acknowledgment
 */
export abstract class BaseJobConsumer {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly channel: Channel;

  constructor(channel: Channel) {
    this.channel = channel;
  }

  /**
   * Parse JSON message from RabbitMQ
   */
  protected parseMessage(msg: ConsumeMessage): Record<string, unknown> | null {
    if (!msg.content) return null;

    try {
      const parsed: unknown = JSON.parse(msg.content.toString());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to parse message:', error);
      return null;
    }
  }

  /**
   * Get correlation ID from message headers
   */
  protected getCorrelationId(msg: ConsumeMessage): string {
    const rawHeaders: unknown = msg.properties.headers;
    const headers =
      rawHeaders && typeof rawHeaders === 'object' && !Array.isArray(rawHeaders)
        ? (rawHeaders as Record<string, unknown>)
        : undefined;
    const correlationId = headers?.['x-correlation-id'];
    return typeof correlationId === 'string'
      ? correlationId
      : `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Acknowledge message (success)
   */
  protected ack(msg: ConsumeMessage): void {
    this.channel.ack(msg);
  }

  /**
   * Negative acknowledge message (failure, will be retried or sent to DLQ)
   */
  protected nack(msg: ConsumeMessage, requeue: boolean = false): void {
    this.channel.nack(msg, false, requeue);
  }

  /**
   * Get and increment retry count from message headers
   */
  protected getRetryCount(msg: ConsumeMessage): number {
    const rawHeaders: unknown = msg.properties.headers;
    const headers =
      rawHeaders && typeof rawHeaders === 'object' && !Array.isArray(rawHeaders)
        ? (rawHeaders as Record<string, unknown>)
        : undefined;
    const retryCount = headers?.['x-retry-count'];
    return typeof retryCount === 'number' ? retryCount : 0;
  }

  /**
   * Republish message with incremented retry count and ack original
   */
  protected republishWithRetry(
    msg: ConsumeMessage,
    maxRetries: number = 3,
  ): boolean {
    const retryCount = this.getRetryCount(msg);
    if (retryCount >= maxRetries) {
      return false;
    }

    const nextRetry = retryCount + 1;
    const headers = {
      'x-retry-count': nextRetry,
    };

    const published = this.channel.publish(
      msg.fields.exchange,
      msg.fields.routingKey,
      msg.content,
      {
        headers,
      },
    );

    if (published) {
      this.ack(msg);
      this.logger.warn(
        `Requeued message with retry ${nextRetry}/${maxRetries}`,
      );
      return true;
    }

    return false;
  }

  /**
   * Log message details for debugging
   */
  protected logMessage(
    msg: ConsumeMessage,
    label: string = 'Processing',
  ): void {
    const correlationId = this.getCorrelationId(msg);
    const retryCount = this.getRetryCount(msg);
    this.logger.debug(
      `[${label}] correlationId: ${correlationId}, retry: ${retryCount}`,
    );
  }
}
