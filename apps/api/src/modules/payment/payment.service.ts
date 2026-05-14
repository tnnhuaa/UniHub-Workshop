import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CircuitBreaker } from '../../libs/circuit-breaker/index.js';
import { NotificationOrchestrator } from '../notification/notification.orchestrator.js';
import type {
  PaymentMockActionInput,
  PaymentWebhookInput,
} from './payment.schemas.js';

/**
 * PaymentService — adapter layer for payment gateway integration.
 * Implements IPaymentGateway interface (to be defined).
 * Handles retry, circuit breaker, and idempotency.
 *
 * @see blueprint/IMPLEMENTATION-GUIDE.md §1
 */
@Injectable()
export class PaymentService {
  private readonly circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    openDurationMs: 60_000,
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationOrchestrator: NotificationOrchestrator,
  ) {}

  async handleWebhook(payload: PaymentWebhookInput) {
    if (payload.status === 'success') {
      return this.markPaymentSuccess({
        paymentId: payload.paymentId,
        providerRef: payload.providerRef,
      });
    }

    return this.markPaymentFailure({
      paymentId: payload.paymentId,
      providerRef: payload.providerRef,
    });
  }

  async initiateMockPayment(input: {
    registrationId: string;
    amount: Prisma.Decimal;
    currency: string;
    idempotencyKey: string;
  }) {
    return this.circuitBreaker.execute(async () => {
      const existing = await this.prisma.payment.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });

      if (existing) {
        return this.buildMockPaymentResponse(existing.id);
      }

      const pendingPayment = await this.prisma.payment.findFirst({
        where: {
          registrationId: input.registrationId,
          status: 'pending',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (pendingPayment) {
        return this.buildMockPaymentResponse(pendingPayment.id);
      }

      const payment = await this.prisma.payment.create({
        data: {
          registrationId: input.registrationId,
          provider: 'mock',
          idempotencyKey: input.idempotencyKey,
          amount: input.amount,
          currency: input.currency,
          status: 'pending',
        },
      });

      return this.buildMockPaymentResponse(payment.id);
    });
  }

  buildMockPaymentInfo(paymentId: string) {
    return this.buildMockPaymentResponse(paymentId);
  }

  async markPaymentSuccess(input: PaymentMockActionInput) {
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUniqueOrThrow({
        where: { id: input.paymentId },
        include: { registration: true },
      });

      if (payment.status === 'paid') {
        return { payment, registration: payment.registration };
      }

      if (
        payment.registration.heldUntil &&
        payment.registration.heldUntil < new Date()
      ) {
        throw new BadRequestException({
          code: 'HOLD_EXPIRED',
          message: 'Seat hold expired before payment confirmation',
        });
      }

      const qrCode = payment.registration.qrCode ?? `qr_${randomUUID()}`;

      const registration = await tx.registration.update({
        where: { id: payment.registrationId },
        data: {
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentCompletedAt: new Date(),
          heldUntil: null,
          qrCode,
        },
      });

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'paid',
          providerRef: input.providerRef ?? `mock_${randomUUID()}`,
          completedAt: new Date(),
        },
      });

      await tx.workshop.update({
        where: { id: payment.registration.workshopId },
        data: { registeredCount: { increment: 1 } },
      });

      return { payment: updatedPayment, registration };
    });

    await this.notificationOrchestrator.dispatchWorkshopRegistrationConfirmed({
      type: 'workshop_registration_confirmed',
      registrationId: result.registration.id,
    });

    return result;
  }

  async markPaymentFailure(input: PaymentMockActionInput) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUniqueOrThrow({
        where: { id: input.paymentId },
        include: { registration: true },
      });

      if (payment.status === 'failed') {
        return { payment, registration: payment.registration };
      }

      const registration = await tx.registration.update({
        where: { id: payment.registrationId },
        data: {
          status: 'cancelled',
          paymentStatus: 'failed',
          cancellationReason: 'payment_failed',
          heldUntil: null,
        },
      });

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          providerRef: input.providerRef ?? `mock_${randomUUID()}`,
          completedAt: new Date(),
        },
      });

      return { payment: updatedPayment, registration };
    });
  }

  private buildMockPaymentResponse(paymentId: string) {
    return {
      paymentId,
      mockActions: {
        successEndpoint: '/api/v1/payments/mock/success',
        failureEndpoint: '/api/v1/payments/mock/failure',
      },
    };
  }
}
