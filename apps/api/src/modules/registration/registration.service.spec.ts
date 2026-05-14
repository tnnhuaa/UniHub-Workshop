import { RegistrationService } from './registration.service.js';

describe('RegistrationService', () => {
  const buildPrisma = () => ({
    registration: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    workshop: {
      findUniqueOrThrow: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
    },
  });

  it('dispatches notification after free registration is confirmed', async () => {
    const prisma = buildPrisma();
    prisma.registration.findUnique.mockResolvedValue(null);
    prisma.workshop.findUniqueOrThrow.mockResolvedValue({ price: 0 });
    prisma.registration.update.mockResolvedValue({
      id: 'registration-1',
      qrCode: 'qr-1',
    });

    const seatAllocator = {
      confirmFreeRegistration: jest.fn().mockResolvedValue({
        id: 'registration-1',
        qrCode: null,
      }),
    };
    const paymentService = {
      buildMockPaymentInfo: jest.fn(),
      initiateMockPayment: jest.fn(),
    };
    const notificationOrchestrator = {
      dispatchWorkshopRegistrationConfirmed: jest.fn().mockResolvedValue(null),
    };

    const service = new RegistrationService(
      prisma as never,
      seatAllocator as never,
      paymentService as never,
      notificationOrchestrator as never,
    );

    const result = await service.create(
      { mssv: '2212345', workshopId: 'workshop-1' },
      'idem-key',
    );

    expect(result.paymentRequired).toBe(false);
    expect(
      notificationOrchestrator.dispatchWorkshopRegistrationConfirmed,
    ).toHaveBeenCalledWith({
      type: 'workshop_registration_confirmed',
      registrationId: 'registration-1',
    });
  });

  it('does not dispatch notification before paid registration is confirmed', async () => {
    const prisma = buildPrisma();
    prisma.registration.findUnique.mockResolvedValue(null);
    prisma.workshop.findUniqueOrThrow.mockResolvedValue({ price: 150000 });

    const seatAllocator = {
      confirmFreeRegistration: jest.fn(),
      holdSeat: jest.fn().mockResolvedValue({
        id: 'registration-2',
      }),
    };
    const paymentService = {
      buildMockPaymentInfo: jest.fn(),
      initiateMockPayment: jest.fn().mockResolvedValue({
        paymentId: 'payment-1',
      }),
    };
    const notificationOrchestrator = {
      dispatchWorkshopRegistrationConfirmed: jest.fn(),
    };

    const service = new RegistrationService(
      prisma as never,
      seatAllocator as never,
      paymentService as never,
      notificationOrchestrator as never,
    );

    const result = await service.create(
      { mssv: '2212345', workshopId: 'workshop-1' },
      'idem-key',
    );

    expect(result.paymentRequired).toBe(true);
    expect(
      notificationOrchestrator.dispatchWorkshopRegistrationConfirmed,
    ).not.toHaveBeenCalled();
  });
});
