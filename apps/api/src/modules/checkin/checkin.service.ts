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

    const checkin = await this.createCheckin({
      mssv: registration.mssv,
      workshopId: registration.workshopId,
      registrationId: registration.id,
      staffId,
      deviceEventId: input.deviceEventId,
    });

    console.log(
      `Check-in scanned for registration ${registration.id} by staff ${staffId}`,
      checkin,
    );
    return checkin;
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

    const checkin = await this.createCheckin({
      mssv: registration.mssv,
      workshopId: registration.workshopId,
      registrationId: registration.id,
      staffId,
      deviceEventId: input.deviceEventId,
    });

    console.log(
      `Check-in confirmed for registration ${input.registrationId} by staff ${staffId}`,
      checkin,
    );
    return checkin;
  }

  async findByWorkshop(workshopId: string, staffId: string) {
    await this.ensureStaffAssignment(staffId, workshopId);
    console.log(
      `Finding check-ins for workshop ${workshopId} by staff ${staffId}`,
    );

    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        registrations: {
          include: {
            student: {
              select: {
                mssv: true,
                fullName: true,
                email: true,
                phone: true,
                faculty: true,
                className: true,
              },
            },
            checkins: {
              include: {
                checkinStaff: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              take: 1, // Lấy bản ghi checkin mới nhất (quan hệ 1-n trong schema nhưng thực tế thường là 1)
              orderBy: {
                checkedInAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!workshop) {
      throw new Error('Workshop not found');
    }

    return {
      workshopId: workshop.id,
      title: workshop.title,
      description: workshop.description,
      status: workshop.status,
      registrations: workshop.registrations.map((reg) => {
        const checkin = reg.checkins.length > 0 ? reg.checkins[0] : null;

        return {
          id: reg.id,
          registrationStatus: reg.status,
          paymentStatus: reg.paymentStatus,

          checkedInAt: checkin?.checkedInAt || null,
          syncedAt: checkin?.syncedAt || null,
          syncStatus: checkin?.syncStatus || 'pending',

          student: {
            mssv: reg.student.mssv,
            fullName: reg.student.fullName,
            email: reg.student.email,
            phone: reg.student.phone,
            faculty: reg.student.faculty,
            className: reg.student.className,
          },

          checkinStaff: checkin?.checkinStaff
            ? {
                id: checkin.checkinStaff.id,
                name: checkin.checkinStaff.name,
                email: checkin.checkinStaff.email,
              }
            : null,
        };
      }),
    };
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
        console.error(
          `Error syncing check-in record with deviceEventId ${record.deviceEventId}:`,
          error,
        );
        throw error;
      }
    }

    console.log(
      `Sync completed for device ${input.deviceId} by staff ${staffId}`,
      results,
    );

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
