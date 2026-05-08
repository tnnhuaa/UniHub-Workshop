import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * NotificationService — adapter layer for notification delivery.
 * Implements INotificationProvider interface (to be defined).
 * Supports email, in-app, and Telegram channels.
 *
 * @see blueprint/IMPLEMENTATION-GUIDE.md §1
 */
@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  send(_userId: string, _channel: string, _templateCode: string): never {
    // TODO: Implement via INotificationProvider adapter + RabbitMQ publish
    throw new Error('Not implemented');
  }

  async findByUser(userId: string) {
    return this.prisma.notificationDelivery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
