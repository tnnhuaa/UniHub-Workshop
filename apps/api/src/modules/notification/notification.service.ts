import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMqService, EVENTS_KEYS } from '../rabbitmq/index.js';
import { NOTIFICATION_PROVIDERS } from './notification.constants.js';
import { NotificationOrchestrator } from './notification.orchestrator.js';
import type { NotificationProvider } from './notification.types.js';
import type {
  NotificationIdParam,
  NotificationListQuery,
  NotificationSendInput,
} from './notification.schemas.js';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: NotificationOrchestrator,
    @Inject(NOTIFICATION_PROVIDERS)
    private readonly providers: NotificationProvider[],
    private readonly rabbitmq: RabbitMqService,
  ) {}

  async send(input: NotificationSendInput) {
    return this.orchestrator.sendManual(input);
  }

  findByUser(userId: string, query: NotificationListQuery) {
    const where: {
      userId: string;
      status?: 'pending' | 'sent' | 'failed';
    } = { userId };

    if (query.readStatus === 'unread') {
      where.status = 'pending';
    }

    if (query.readStatus === 'read') {
      where.status = 'sent';
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

  async markAsRead(userId: string, params: NotificationIdParam) {
    const existing = await this.prisma.notificationDelivery.findUniqueOrThrow({
      where: { id: params.id },
      select: { userId: true },
    });

    if (existing.userId !== userId) {
      throw new ForbiddenException({
        code: 'NOTIFICATION_FORBIDDEN',
        message: 'Cannot update another user notification',
      });
    }

    return this.prisma.notificationDelivery.update({
      where: { id: params.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });
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
          templateCode: input.type ?? 'custom',
          dedupeKey: undefined,
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
