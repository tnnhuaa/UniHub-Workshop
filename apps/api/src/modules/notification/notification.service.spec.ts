import { ForbiddenException } from '@nestjs/common';
import { NotificationService } from './notification.service.js';

describe('NotificationService', () => {
  const buildPrisma = () => ({
    notificationDelivery: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
  });

  it('filters unread notifications for current user', async () => {
    const prisma = buildPrisma();
    prisma.notificationDelivery.findMany.mockResolvedValue([]);
    const orchestrator = { sendManual: jest.fn() };
    const rabbitmq = { publish: jest.fn() };
    const service = new NotificationService(
      prisma as never,
      orchestrator as never,
      [] as never,
      rabbitmq as never,
    );

    await service.findByUser('user-1', {
      readStatus: 'unread',
      page: 1,
      pageSize: 20,
    });

    expect(prisma.notificationDelivery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', status: 'pending' },
      }),
    );
  });

  it('marks a notification as read for the owner', async () => {
    const prisma = buildPrisma();
    prisma.notificationDelivery.findUniqueOrThrow.mockResolvedValue({
      userId: 'user-1',
    });
    prisma.notificationDelivery.update.mockResolvedValue({
      id: 'notification-1',
      sentAt: new Date(),
    });
    const orchestrator = { sendManual: jest.fn() };
    const rabbitmq = { publish: jest.fn() };
    const service = new NotificationService(
      prisma as never,
      orchestrator as never,
      [] as never,
      rabbitmq as never,
    );

    const result = await service.markAsRead('user-1', {
      id: '11111111-1111-4111-8111-111111111111',
    });

    expect(prisma.notificationDelivery.update).toHaveBeenCalled();
    expect(result.id).toBe('notification-1');
  });

  it('rejects mark-as-read for another user notification', async () => {
    const prisma = buildPrisma();
    prisma.notificationDelivery.findUniqueOrThrow.mockResolvedValue({
      userId: 'user-2',
    });
    const orchestrator = { sendManual: jest.fn() };
    const rabbitmq = { publish: jest.fn() };
    const service = new NotificationService(
      prisma as never,
      orchestrator as never,
      [] as never,
      rabbitmq as never,
    );

    await expect(
      service.markAsRead('user-1', {
        id: '11111111-1111-4111-8111-111111111111',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
