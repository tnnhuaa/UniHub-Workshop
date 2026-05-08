import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * CheckinService — handles QR scan, confirmation, and offline sync.
 * Deduplication uses device_event_id unique constraint.
 *
 * @see blueprint/specs/checkin.md
 * @see blueprint/IMPLEMENTATION-GUIDE.md §3
 */
@Injectable()
export class CheckinService {
  constructor(private readonly prisma: PrismaService) {}

  scan(): never {
    // TODO: Implement QR code lookup + validation
    throw new Error('Not implemented');
  }

  confirm(): never {
    // TODO: Implement check-in confirmation with dedup
    throw new Error('Not implemented');
  }

  findByWorkshop(workshopId: string) {
    return this.prisma.checkin.findMany({
      where: { workshopId },
      include: { student: true },
    });
  }

  syncOffline(): never {
    // TODO: Implement offline sync batch processing
    throw new Error('Not implemented');
  }
}
