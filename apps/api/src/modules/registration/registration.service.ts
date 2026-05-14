import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaymentService } from '../payment/payment.service.js';
import { SeatAllocator } from './seat-allocator.js';
import type {
  CreateRegistrationInput,
  RegistrationListQuery,
} from './registration.schemas.js';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seatAllocator: SeatAllocator,
    private readonly paymentService: PaymentService,
  ) {}

  async create(input: CreateRegistrationInput, idempotencyKey: string) {
    const now = new Date();
    const existing = await this.prisma.registration.findUnique({
      where: {
        mssv_workshopId: {
          mssv: input.mssv,
          workshopId: input.workshopId,
        },
      },
    });

    const workshop = await this.prisma.workshop.findUniqueOrThrow({
      where: { id: input.workshopId },
      select: { price: true },
    });

    if (existing) {
      const activeHold =
        existing.status === 'pending' &&
        existing.heldUntil &&
        existing.heldUntil > now;
      const alreadyConfirmed =
        existing.status === 'confirmed' && existing.paymentStatus === 'paid';

      const payment = await this.prisma.payment.findFirst({
        where: {
          registrationId: existing.id,
          status: activeHold ? 'pending' : undefined,
        },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });

      if (alreadyConfirmed || activeHold) {
        const paymentRequired =
          Number(workshop.price) > 0 && existing.paymentStatus !== 'paid';

        return {
          registration: existing,
          paymentRequired,
          payment: payment
            ? this.paymentService.buildMockPaymentInfo(payment.id)
            : null,
        };
      }
    }

    if (Number(workshop.price) <= 0) {
      const registration = await this.seatAllocator.confirmFreeRegistration(
        input.mssv,
        input.workshopId,
      );

      const qrCode = registration.qrCode ?? `qr_${randomUUID()}`;
      const confirmed = await this.prisma.registration.update({
        where: { id: registration.id },
        data: { qrCode },
      });

      return { registration: confirmed, paymentRequired: false };
    }

    const registration = await this.seatAllocator.holdSeat(
      input.mssv,
      input.workshopId,
    );

    const payment = await this.paymentService.initiateMockPayment({
      registrationId: registration.id,
      amount: workshop.price,
      currency: 'VND',
      idempotencyKey,
    });

    return {
      registration,
      paymentRequired: true,
      payment,
    };
  }

  findOne(id: string) {
    return this.prisma.registration.findUniqueOrThrow({ where: { id } });
  }

  findByStudent(mssv: string, query: RegistrationListQuery) {
    const page = query.page;
    const pageSize = query.pageSize;

    return this.prisma.registration.findMany({
      where: {
        mssv,
        status: query.status,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { registeredAt: 'desc' },
    });
  }

  async getQrCode(id: string) {
    const registration = await this.prisma.registration.findUniqueOrThrow({
      where: { id },
      select: { qrCode: true },
    });

    if (!registration.qrCode) {
      throw new ConflictException({
        code: 'QR_NOT_READY',
        message: 'QR code is not available for this registration',
      });
    }
    return { qrCode: registration.qrCode };
  }
}
