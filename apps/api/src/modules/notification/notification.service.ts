import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMqService, EVENTS_KEYS } from '../rabbitmq/index.js';
import { NotificationOrchestrator } from './notification.orchestrator.js';
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
    private readonly rabbitmq: RabbitMqService,
  ) {}

  async send(input: NotificationSendInput) {
    return this.orchestrator.sendManual(input);
  }

  findByUser(userId: string, query: NotificationListQuery) {
    const where: {
      userId: string;
      readAt?: null | { not: null };
    } = { userId };

    if (query.readStatus === 'unread') {
      where.readAt = null;
    }

    if (query.readStatus === 'read') {
      where.readAt = { not: null };
    }

    const page = query.page;
    const pageSize = query.pageSize;

    return this.prisma.notification.findMany({
      where,
      include: {
        deliveries: {
          orderBy: { createdAt: 'asc' },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: string, params: NotificationIdParam) {
    const existing = await this.prisma.notification.findUniqueOrThrow({
      where: { id: params.id },
      select: { userId: true },
    });

    if (existing.userId !== userId) {
      throw new ForbiddenException({
        code: 'NOTIFICATION_FORBIDDEN',
        message: 'Cannot update another user notification',
      });
    }

    return this.prisma.notification.update({
      where: { id: params.id },
      include: {
        deliveries: {
          orderBy: { createdAt: 'asc' },
        },
      },
      data: {
        readAt: new Date(),
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
          title: input.title,
          body: input.body,
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
