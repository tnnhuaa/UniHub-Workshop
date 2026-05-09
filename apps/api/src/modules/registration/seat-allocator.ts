import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const HOLD_MINUTES = 10;

@Injectable()
export class SeatAllocator {
  constructor(private readonly prisma: PrismaService) {}

  async holdSeat(mssv: string, workshopId: string) {
    const now = new Date();
    const heldUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    return this.prisma.$transaction(
      async (tx) => {
        const workshop = await tx.workshop.findUniqueOrThrow({
          where: { id: workshopId },
          select: {
            id: true,
            capacity: true,
            registeredCount: true,
            price: true,
            status: true,
          },
        });

        if (workshop.status !== 'published') {
          throw new ConflictException({
            code: 'WORKSHOP_NOT_AVAILABLE',
            message: 'Workshop is not open for registration',
          });
        }

        const activeHolds = await tx.registration.count({
          where: {
            workshopId,
            status: 'pending',
            heldUntil: { gt: now },
          },
        });

        if (workshop.registeredCount + activeHolds >= workshop.capacity) {
          throw new ConflictException({
            code: 'WORKSHOP_FULL',
            message: 'No seats available for this workshop',
          });
        }

        return tx.registration.create({
          data: {
            mssv,
            workshopId,
            status: 'pending',
            paymentStatus: 'pending',
            heldUntil,
          },
        });
      },
      { isolationLevel: 'Serializable' },
    );
  }

  async confirmFreeRegistration(mssv: string, workshopId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const workshop = await tx.workshop.findUniqueOrThrow({
          where: { id: workshopId },
          select: {
            id: true,
            capacity: true,
            registeredCount: true,
            status: true,
          },
        });

        if (workshop.status !== 'published') {
          throw new ConflictException({
            code: 'WORKSHOP_NOT_AVAILABLE',
            message: 'Workshop is not open for registration',
          });
        }

        if (workshop.registeredCount >= workshop.capacity) {
          throw new ConflictException({
            code: 'WORKSHOP_FULL',
            message: 'No seats available for this workshop',
          });
        }

        const registration = await tx.registration.create({
          data: {
            mssv,
            workshopId,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentCompletedAt: new Date(),
          },
        });

        await tx.workshop.update({
          where: { id: workshopId },
          data: { registeredCount: { increment: 1 } },
        });

        return registration;
      },
      { isolationLevel: 'Serializable' },
    );
  }
}
