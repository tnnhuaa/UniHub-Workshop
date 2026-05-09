import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CheckinConfirmInput,
  CheckinScanInput,
  CheckinSyncInput,
} from './checkin.schemas.js';

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

  async scan(input: CheckinScanInput, staffId: string) {
    const registration = await this.prisma.registration.findFirst({
      where: { qrCode: input.qrCode },
      include: { student: true },
    });

    if (!registration) {
      throw new BadRequestException({
        code: 'QR_INVALID',
        message: 'QR code is not recognized',
      });
    }

    this.ensureRegistrationCheckinReady(registration);
    await this.ensureStaffAssignment(staffId, registration.workshopId);

    return this.createCheckin({
      mssv: registration.mssv,
      workshopId: registration.workshopId,
      registrationId: registration.id,
      staffId,
      deviceEventId: input.deviceEventId,
    });
  }

  async confirm(input: CheckinConfirmInput, staffId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: input.registrationId },
      include: { student: true },
    });

    if (!registration) {
      throw new BadRequestException({
        code: 'REGISTRATION_NOT_FOUND',
        message: 'Registration not found',
      });
    }

    this.ensureRegistrationCheckinReady(registration);
    await this.ensureStaffAssignment(staffId, registration.workshopId);

    return this.createCheckin({
      mssv: registration.mssv,
      workshopId: registration.workshopId,
      registrationId: registration.id,
      staffId,
      deviceEventId: input.deviceEventId,
    });
  }

  async findByWorkshop(workshopId: string, staffId: string) {
    await this.ensureStaffAssignment(staffId, workshopId);
    return this.prisma.checkin.findMany({
      where: { workshopId },
      include: { student: true },
      orderBy: { checkedInAt: 'desc' },
    });
  }

  async syncOffline(input: CheckinSyncInput, staffId: string) {
    const results = [] as Array<{
      deviceEventId: string;
      status: 'accepted' | 'duplicate' | 'rejected';
      reason?: string;
      checkinId?: string;
    }>;

    for (const record of input.records) {
      try {
        await this.ensureStaffAssignment(staffId, record.workshopId);

        const registration = await this.prisma.registration.findUnique({
          where: {
            mssv_workshopId: {
              mssv: record.mssv,
              workshopId: record.workshopId,
            },
          },
        });

        if (!registration) {
          results.push({
            deviceEventId: record.deviceEventId,
            status: 'rejected',
            reason: 'REGISTRATION_NOT_FOUND',
          });
          continue;
        }

        try {
          this.ensureRegistrationCheckinReady(registration);
        } catch (error) {
          if (error instanceof ConflictException) {
            results.push({
              deviceEventId: record.deviceEventId,
              status: 'rejected',
              reason: 'REGISTRATION_NOT_CONFIRMED',
            });
            continue;
          }
          throw error;
        }

        const outcome = await this.createCheckin({
          mssv: registration.mssv,
          workshopId: registration.workshopId,
          registrationId: registration.id,
          staffId,
          deviceEventId: record.deviceEventId,
        });

        results.push({
          deviceEventId: record.deviceEventId,
          status: outcome.status === 'created' ? 'accepted' : 'duplicate',
          checkinId: outcome.checkin.id,
        });
      } catch (error) {
        if (error instanceof ForbiddenException) {
          results.push({
            deviceEventId: record.deviceEventId,
            status: 'rejected',
            reason: 'STAFF_NOT_ASSIGNED',
          });
          continue;
        }
        throw error;
      }
    }

    return {
      deviceId: input.deviceId,
      results,
    };
  }

  private async ensureStaffAssignment(staffId: string, workshopId: string) {
    const assignment = await this.prisma.staffWorkshopAssignment.findUnique({
      where: {
        staffUserId_workshopId: {
          staffUserId: staffId,
          workshopId,
        },
      },
    });

    if (!assignment || assignment.status !== 'active') {
      throw new ForbiddenException({
        code: 'CHECKIN_NOT_ASSIGNED',
        message: 'Check-in staff is not assigned to this workshop',
      });
    }
  }

  private ensureRegistrationCheckinReady(registration: { status: string }) {
    if (registration.status !== 'confirmed') {
      throw new ConflictException({
        code: 'REGISTRATION_NOT_CONFIRMED',
        message: 'Registration is not confirmed',
      });
    }
  }

  private async createCheckin(input: {
    mssv: string;
    workshopId: string;
    registrationId: string;
    staffId: string;
    deviceEventId: string;
  }) {
    const existingByDevice = await this.prisma.checkin.findUnique({
      where: { deviceEventId: input.deviceEventId },
    });

    if (existingByDevice) {
      return { status: 'duplicate', checkin: existingByDevice } as const;
    }

    const existingByStudent = await this.prisma.checkin.findUnique({
      where: {
        mssv_workshopId: {
          mssv: input.mssv,
          workshopId: input.workshopId,
        },
      },
    });

    if (existingByStudent) {
      return { status: 'duplicate', checkin: existingByStudent } as const;
    }

    try {
      const checkin = await this.prisma.checkin.create({
        data: {
          mssv: input.mssv,
          workshopId: input.workshopId,
          registrationId: input.registrationId,
          checkinStaffId: input.staffId,
          deviceEventId: input.deviceEventId,
          syncStatus: 'synced',
          syncedAt: new Date(),
        },
      });

      return { status: 'created', checkin } as const;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.prisma.checkin.findFirst({
          where: {
            OR: [
              { deviceEventId: input.deviceEventId },
              {
                mssv: input.mssv,
                workshopId: input.workshopId,
              },
            ],
          },
        });

        if (existing) {
          return { status: 'duplicate', checkin: existing } as const;
        }
      }
      throw error;
    }
  }
}
