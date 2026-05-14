import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationOrchestrator } from './notification.orchestrator.js';
import type {
  NotificationIdParam,
  NotificationListQuery,
  NotificationSendInput,
} from './notification.schemas.js';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: NotificationOrchestrator,
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
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        deliveries: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            channel: true,
            status: true,
            providerRef: true,
            errorMessage: true,
            sentAt: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async markAsRead(userId: string, params: NotificationIdParam) {
    const existing = await this.prisma.notification.findUniqueOrThrow({
      where: { id: params.id },
      select: { userId: true, readAt: true },
    });

    if (existing.userId !== userId) {
      throw new ForbiddenException({
        code: 'NOTIFICATION_FORBIDDEN',
        message: 'Cannot update another user notification',
      });
    }

    return this.prisma.notification.update({
      where: { id: params.id },
      data: {
        readAt: existing.readAt ?? new Date(),
      },
      include: {
        deliveries: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            channel: true,
            status: true,
            providerRef: true,
            errorMessage: true,
            sentAt: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
