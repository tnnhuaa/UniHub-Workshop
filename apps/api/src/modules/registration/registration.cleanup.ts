import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

@Injectable()
export class RegistrationCleanupService
  implements OnModuleInit, OnModuleDestroy
{
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.intervalId = setInterval(() => {
      void this.cleanupExpiredHolds();
    }, CLEANUP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async cleanupExpiredHolds() {
    const now = new Date();
    await this.prisma.registration.updateMany({
      where: {
        status: 'pending',
        paymentStatus: 'pending',
        heldUntil: { lt: now },
      },
      data: {
        status: 'expired',
        paymentStatus: 'failed',
        cancellationReason: 'hold_expired',
        heldUntil: null,
      },
    });
  }
}
