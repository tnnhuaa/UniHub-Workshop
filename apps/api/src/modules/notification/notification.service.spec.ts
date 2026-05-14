import { ForbiddenException } from '@nestjs/common';
import { NotificationService } from './notification.service.js';

describe('NotificationService', () => {
  const buildPrisma = () => ({
    notification: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
  });

  it('filters unread notifications for current user', async () => {
    const prisma = buildPrisma();
    prisma.notification.findMany.mockResolvedValue([]);
    const orchestrator = { sendManual: jest.fn() };
    const service = new NotificationService(
      prisma as never,
      orchestrator as never,
    );

    await service.findByUser('user-1', {
      readStatus: 'unread',
      page: 1,
      pageSize: 20,
    });

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', readAt: null },
      }),
    );
  });

  it('marks a notification as read for the owner', async () => {
    const prisma = buildPrisma();
    prisma.notification.findUniqueOrThrow.mockResolvedValue({
      userId: 'user-1',
      readAt: null,
    });
    prisma.notification.update.mockResolvedValue({
      id: 'notification-1',
      readAt: new Date(),
    });
    const orchestrator = { sendManual: jest.fn() };
    const service = new NotificationService(
      prisma as never,
      orchestrator as never,
    );

    const result = await service.markAsRead('user-1', {
      id: '11111111-1111-4111-8111-111111111111',
    });

    expect(prisma.notification.update).toHaveBeenCalled();
    expect(result.id).toBe('notification-1');
  });

  it('rejects mark-as-read for another user notification', async () => {
    const prisma = buildPrisma();
    prisma.notification.findUniqueOrThrow.mockResolvedValue({
      userId: 'user-2',
      readAt: null,
    });
    const orchestrator = { sendManual: jest.fn() };
    const service = new NotificationService(
      prisma as never,
      orchestrator as never,
    );

    await expect(
      service.markAsRead('user-1', {
        id: '11111111-1111-4111-8111-111111111111',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
