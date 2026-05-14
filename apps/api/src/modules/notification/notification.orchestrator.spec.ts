import { NotificationOrchestrator } from './notification.orchestrator.js';
import { NotificationTemplateRenderer } from './notification.templates.js';

describe('NotificationOrchestrator', () => {
  const notificationId = '11111111-1111-4111-8111-111111111111';
  const inAppDeliveryId = '22222222-2222-4222-8222-222222222222';
  const emailDeliveryId = '33333333-3333-4333-8333-333333333333';
  const registrationId = '44444444-4444-4444-8444-444444444444';

  const buildPrisma = () => ({
    registration: {
      findUnique: jest.fn(),
    },
    betterAuthUser: {
      findUniqueOrThrow: jest.fn(),
    },
    notification: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    notificationDelivery: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  });

  it('creates one logical notification and two channel deliveries', async () => {
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
    prisma.notification.findUnique.mockResolvedValue(null);
    prisma.notification.create.mockResolvedValue({
      id: notificationId,
      userId: 'user-1',
      type: 'workshop_registration_confirmed',
      title: 'Workshop registration confirmed',
      body: 'body',
      data: { workshopTitle: 'Design Systems 101' },
      eventKey: `registration-confirmed:${registrationId}`,
      readAt: null,
      createdAt: new Date('2026-05-14T08:00:00.000Z'),
    });
    prisma.notificationDelivery.findUnique.mockResolvedValue(null);
    prisma.notificationDelivery.create
      .mockResolvedValueOnce({
        id: inAppDeliveryId,
        channel: 'in_app',
        createdAt: new Date('2026-05-14T08:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        id: emailDeliveryId,
        channel: 'email',
        createdAt: new Date('2026-05-14T08:00:01.000Z'),
      });
    prisma.notificationDelivery.update
      .mockResolvedValueOnce({
        id: inAppDeliveryId,
        channel: 'in_app',
        status: 'sent',
      })
      .mockResolvedValueOnce({
        id: emailDeliveryId,
        channel: 'email',
        status: 'sent',
      });

    const inAppProvider = {
      channel: 'in_app' as const,
      send: jest.fn().mockResolvedValue({ status: 'sent' }),
    };
    const emailProvider = {
      channel: 'email' as const,
      send: jest.fn().mockResolvedValue({
        status: 'sent',
        providerRef: 'message-1',
      }),
    };

    const orchestrator = new NotificationOrchestrator(
      prisma as never,
      new NotificationTemplateRenderer(),
      [inAppProvider, emailProvider],
    );

    const result = await orchestrator.dispatchWorkshopRegistrationConfirmed({
      type: 'workshop_registration_confirmed',
      registrationId,
    });

    expect(prisma.notification.create).toHaveBeenCalledTimes(1);
    expect(prisma.notificationDelivery.create).toHaveBeenCalledTimes(2);
    expect(inAppProvider.send).toHaveBeenCalledTimes(1);
    expect(emailProvider.send).toHaveBeenCalledTimes(1);
    expect(result?.deliveries).toHaveLength(2);
  });

  it('marks email delivery failed when provider throws without stopping in-app delivery', async () => {
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
    prisma.notification.findUnique.mockResolvedValue(null);
    prisma.notification.create.mockResolvedValue({
      id: notificationId,
      userId: 'user-1',
      type: 'workshop_registration_confirmed',
      title: 'Workshop registration confirmed',
      body: 'body',
      data: { workshopTitle: 'Design Systems 101' },
      eventKey: `registration-confirmed:${registrationId}`,
      readAt: null,
      createdAt: new Date('2026-05-14T08:00:00.000Z'),
    });
    prisma.notificationDelivery.findUnique.mockResolvedValue(null);
    prisma.notificationDelivery.create
      .mockResolvedValueOnce({
        id: inAppDeliveryId,
        channel: 'in_app',
        createdAt: new Date('2026-05-14T08:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        id: emailDeliveryId,
        channel: 'email',
        createdAt: new Date('2026-05-14T08:00:01.000Z'),
      });
    prisma.notificationDelivery.update
      .mockResolvedValueOnce({
        id: inAppDeliveryId,
        channel: 'in_app',
        status: 'sent',
      })
      .mockResolvedValueOnce({
        id: emailDeliveryId,
        channel: 'email',
        status: 'failed',
        errorMessage: 'SMTP timeout',
      });

    const orchestrator = new NotificationOrchestrator(
      prisma as never,
      new NotificationTemplateRenderer(),
      [
        {
          channel: 'in_app' as const,
          send: jest.fn().mockResolvedValue({ status: 'sent' }),
        },
        {
          channel: 'email' as const,
          send: jest.fn().mockRejectedValue(new Error('SMTP timeout')),
        },
      ],
    );

    const result = await orchestrator.dispatchWorkshopRegistrationConfirmed({
      type: 'workshop_registration_confirmed',
      registrationId,
    });

    expect(result?.deliveries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ channel: 'in_app', status: 'sent' }),
        expect.objectContaining({ channel: 'email', status: 'failed' }),
      ]),
    );
  });

  it('reuses existing notification and delivery records on retry', async () => {
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
    prisma.notification.findUnique.mockResolvedValue({
      id: notificationId,
      userId: 'user-1',
      type: 'workshop_registration_confirmed',
      title: 'Workshop registration confirmed',
      body: 'body',
      data: { workshopTitle: 'Design Systems 101' },
      eventKey: `registration-confirmed:${registrationId}`,
      readAt: null,
      createdAt: new Date('2026-05-14T08:00:00.000Z'),
    });
    prisma.notificationDelivery.findUnique
      .mockResolvedValueOnce({
        id: inAppDeliveryId,
        channel: 'in_app',
        status: 'sent',
      })
      .mockResolvedValueOnce({
        id: emailDeliveryId,
        channel: 'email',
        status: 'sent',
      });

    const orchestrator = new NotificationOrchestrator(
      prisma as never,
      new NotificationTemplateRenderer(),
      [],
    );

    const result = await orchestrator.dispatchWorkshopRegistrationConfirmed({
      type: 'workshop_registration_confirmed',
      registrationId,
    });

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(prisma.notificationDelivery.create).not.toHaveBeenCalled();
    expect(result?.deliveries).toHaveLength(2);
  });
});
