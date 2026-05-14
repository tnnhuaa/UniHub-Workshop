import { NotificationOrchestrator } from './notification.orchestrator.js';
import { NotificationTemplateRenderer } from './notification.templates.js';

describe('NotificationOrchestrator', () => {
  const registrationId = '44444444-4444-4444-8444-444444444444';

  const buildPrisma = () => ({
    registration: {
      findUnique: jest.fn(),
    },
    betterAuthUser: {
      findUniqueOrThrow: jest.fn(),
    },
    notificationDelivery: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  });

  it('creates one delivery per channel for workshop registration confirmation', async () => {
    const prisma = buildPrisma();
    prisma.registration.findUnique.mockResolvedValue({
      id: registrationId,
      workshopId: 'workshop-1',
      qrCode: 'qr-code-1',
      student: {
        betterAuthUserId: 'user-1',
        email: 'student@uni.edu',
        fullName: 'Minh Nguyen',
        user: {
          email: 'student@uni.edu',
          name: 'Minh Nguyen',
        },
      },
      workshop: {
        title: 'Design Systems 101',
        room: 'A101',
        startTime: new Date('2026-05-14T09:00:00.000Z'),
        endTime: new Date('2026-05-14T11:00:00.000Z'),
      },
    });
    prisma.notificationDelivery.findUnique.mockResolvedValue(null);
    prisma.notificationDelivery.create
      .mockResolvedValueOnce({
        id: 'inapp-id',
        channel: 'in_app',
        status: 'pending',
        createdAt: new Date('2026-05-14T08:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        id: 'email-id',
        channel: 'email',
        status: 'pending',
        createdAt: new Date('2026-05-14T08:00:01.000Z'),
      });
    prisma.notificationDelivery.update
      .mockResolvedValueOnce({
        id: 'inapp-id',
        channel: 'in_app',
        status: 'sent',
      })
      .mockResolvedValueOnce({
        id: 'email-id',
        channel: 'email',
        status: 'sent',
      });

    const orchestrator = new NotificationOrchestrator(
      prisma as never,
      new NotificationTemplateRenderer(),
      [
        {
          channel: 'in_app',
          send: jest.fn().mockResolvedValue({ status: 'sent' }),
        },
        {
          channel: 'email',
          send: jest.fn().mockResolvedValue({ status: 'sent' }),
        },
      ],
    );

    const result = await orchestrator.dispatchWorkshopRegistrationConfirmed({
      type: 'workshop_registration_confirmed',
      registrationId,
    });

    expect(prisma.notificationDelivery.create).toHaveBeenCalledTimes(2);
    expect(result?.deliveries).toHaveLength(2);
  });

  it('reuses existing delivery by dedupe key', async () => {
    const prisma = buildPrisma();
    prisma.betterAuthUser.findUniqueOrThrow.mockResolvedValue({
      id: 'user-1',
      email: 'u@x.com',
      name: 'User',
    });
    prisma.notificationDelivery.findUnique.mockResolvedValue({
      id: 'existing-id',
      channel: 'in_app',
      status: 'sent',
    });

    const orchestrator = new NotificationOrchestrator(
      prisma as never,
      new NotificationTemplateRenderer(),
      [],
    );

    const result = await orchestrator.sendManual({
      userId: 'user-1',
      channel: 'in_app',
      title: 'Hello',
      body: 'World',
      dedupeKey: 'dedupe-1',
    });

    expect(prisma.notificationDelivery.create).not.toHaveBeenCalled();
    expect(result.deliveries[0]?.id).toBe('existing-id');
  });
});
