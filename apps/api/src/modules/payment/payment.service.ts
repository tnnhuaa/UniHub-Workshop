import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * PaymentService — adapter layer for payment gateway integration.
 * Implements IPaymentGateway interface (to be defined).
 * Handles retry, circuit breaker, and idempotency.
 *
 * @see blueprint/IMPLEMENTATION-GUIDE.md §1
 */
@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  handleWebhook(): never {
    // TODO: Implement webhook processing with idempotency
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initiatePayment(_registrationId: string): never {
    // TODO: Implement via IPaymentGateway adapter
    throw new Error('Not implemented');
  }
}
