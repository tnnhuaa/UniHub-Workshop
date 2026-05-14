import { PaymentService } from './payment.service.js';

describe('PaymentService', () => {
  const buildPrisma = () => ({
    payment: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  });

  it('dispatches registration-confirmed notification after payment success', async () => {
    const prisma = buildPrisma();
    prisma.$transaction.mockResolvedValue({
      payment: { id: 'payment-1', status: 'paid' },
      registration: { id: 'registration-1', status: 'confirmed' },
    });

    const notificationOrchestrator = {
      dispatchWorkshopRegistrationConfirmed: jest.fn().mockResolvedValue(null),
    };

    const service = new PaymentService(
      prisma as never,
      notificationOrchestrator as never,
    );

    const result = await service.markPaymentSuccess({
      paymentId: '11111111-1111-4111-8111-111111111111',
    });

    expect(result.registration.id).toBe('registration-1');
    expect(
      notificationOrchestrator.dispatchWorkshopRegistrationConfirmed,
    ).toHaveBeenCalledWith({
      type: 'workshop_registration_confirmed',
      registrationId: 'registration-1',
    });
  });
});
