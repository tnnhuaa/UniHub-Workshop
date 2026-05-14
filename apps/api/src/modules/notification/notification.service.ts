import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { NotificationChannel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMqService, EVENTS_KEYS } from '../rabbitmq/index.js';
import { NOTIFICATION_PROVIDERS } from './notification.constants.js';
import type {
  NotificationProvider,
  NotificationSendPayload,
  NotificationSendResult,
} from './notification.providers.js';
import type {
  NotificationListQuery,
  NotificationSendInput,
} from './notification.schemas.js';

/**
 * NotificationService — adapter layer for notification delivery.
 * Implements INotificationProvider interface (to be defined).
 * Supports email, in-app, and Telegram channels.
 *
 * @see blueprint/IMPLEMENTATION-GUIDE.md §1
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PROVIDERS)
    private readonly providers: NotificationProvider[],
    private readonly rabbitmq: RabbitMqService,
  ) {}

  async send(input: NotificationSendInput) {
    if (input.dedupeKey) {
      const existing = await this.prisma.notificationDelivery.findUnique({
        where: { dedupeKey: input.dedupeKey },
      });

      if (existing) {
        return existing;
      }
    }

    const provider = this.getProvider(input.channel);

    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: 'custom',
        title: input.templateCode,
        body: input.templateCode,
      },
    });

    const delivery = await this.prisma.notificationDelivery.create({
      data: {
        notificationId: notification.id,
        channel: input.channel,
        status: 'pending',
        dedupeKey: input.dedupeKey,
      },
    });

    const result = await this.sendWithProvider(provider, {
      notificationId: notification.id,
      userId: input.userId,
      channel: input.channel,
      templateCode: input.templateCode,
    });

    return this.prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: result.status,
        sentAt: result.status === 'sent' ? new Date() : null,
      },
    });
  }

  findByUser(userId: string, query: NotificationListQuery) {
    const where: {
      notification: { userId: string };
      channel?: NotificationChannel;
      status?: 'pending' | 'sent' | 'failed';
    } = { notification: { userId } };

    if (query.channel) {
      where.channel = query.channel;
    }

    if (query.status) {
      where.status = query.status;
    }

    const page = query.page;
    const pageSize = query.pageSize;

    return this.prisma.notificationDelivery.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }

  private getProvider(channel: NotificationChannel) {
    const provider = this.providers.find((entry) => entry.channel === channel);
    if (!provider) {
      throw new BadRequestException({
        code: 'NOTIFICATION_CHANNEL_UNSUPPORTED',
        message: 'Notification channel is not supported yet',
      });
    }

    return provider;
  }

  private async sendWithProvider(
    provider: NotificationProvider,
    payload: NotificationSendPayload,
  ): Promise<NotificationSendResult> {
    try {
      return await provider.send(payload);
    } catch {
      return { status: 'failed' };
    }
  }

  /**
   * Publish notification job to RabbitMQ for async processing
   * Used by background workers to send notifications
   */
  publishNotificationJob(input: NotificationSendInput): void {
    const correlationId = `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      this.rabbitmq.publish(
        EVENTS_KEYS.NOTIFICATION_CREATED,
        {
          correlationId,
          userId: input.userId,
          channel: input.channel,
          templateCode: input.templateCode,
          dedupeKey: input.dedupeKey,
          publishedAt: new Date().toISOString(),
        },
        {
          priority: 5, // Normal priority (0-10 scale)
        },
      );

      this.logger.debug(
        `Published notification job [${correlationId}] for user ${input.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish notification job for user ${input.userId}:`,
        error,
      );
      throw error;
    }
  }
}
