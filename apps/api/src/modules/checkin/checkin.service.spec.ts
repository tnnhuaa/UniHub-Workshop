import { ConflictException, ForbiddenException } from '@nestjs/common';
import { CheckinService } from './checkin.service.js';

describe('CheckinService', () => {
  const staffId = 'staff-1';
  const registration = {
    id: 'registration-1',
    mssv: 'mssv-1',
    workshopId: 'workshop-1',
    status: 'confirmed',
  };

  const assignment = {
    id: 'assignment-1',
    status: 'active',
  };

  const checkin = {
    id: 'checkin-1',
  };

  const buildPrisma = () => ({
    registration: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    staffWorkshopAssignment: {
      findUnique: jest.fn(),
    },
    checkin: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  });

  it('creates a checkin on scan', async () => {
    const prisma = buildPrisma();
    prisma.registration.findFirst.mockResolvedValue(registration);
    prisma.staffWorkshopAssignment.findUnique.mockResolvedValue(assignment);
    prisma.checkin.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.checkin.create.mockResolvedValue(checkin);

    const service = new CheckinService(prisma as never);
    const result = await service.scan(
      {
        qrCode: 'qr_1',
        deviceId: 'device-1',
        deviceEventId: '11111111-1111-1111-1111-111111111111',
      },
      staffId,
    );

    expect(result.status).toBe('created');
    expect(result.checkin).toEqual(checkin);
    expect(prisma.checkin.create).toHaveBeenCalled();
  });

  it('returns duplicate when device event exists', async () => {
    const prisma = buildPrisma();
    prisma.registration.findFirst.mockResolvedValue(registration);
    prisma.staffWorkshopAssignment.findUnique.mockResolvedValue(assignment);
    prisma.checkin.findUnique.mockResolvedValue(checkin);

    const service = new CheckinService(prisma as never);
    const result = await service.scan(
      {
        qrCode: 'qr_1',
        deviceId: 'device-1',
        deviceEventId: '22222222-2222-2222-2222-222222222222',
      },
      staffId,
    );

    expect(result.status).toBe('duplicate');
    expect(result.checkin).toEqual(checkin);
    expect(prisma.checkin.create).not.toHaveBeenCalled();
  });

  it('rejects when staff not assigned', async () => {
    const prisma = buildPrisma();
    prisma.registration.findFirst.mockResolvedValue(registration);
    prisma.staffWorkshopAssignment.findUnique.mockResolvedValue(null);

    const service = new CheckinService(prisma as never);

    await expect(
      service.scan(
        {
          qrCode: 'qr_1',
          deviceId: 'device-1',
          deviceEventId: '33333333-3333-3333-3333-333333333333',
        },
        staffId,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects when registration not confirmed', async () => {
    const prisma = buildPrisma();
    prisma.registration.findFirst.mockResolvedValue({
      ...registration,
      status: 'pending',
    });
    prisma.staffWorkshopAssignment.findUnique.mockResolvedValue(assignment);

    const service = new CheckinService(prisma as never);

    await expect(
      service.scan(
        {
          qrCode: 'qr_1',
          deviceId: 'device-1',
          deviceEventId: '44444444-4444-4444-4444-444444444444',
        },
        staffId,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('syncOffline returns duplicate status for existing device event', async () => {
    const prisma = buildPrisma();
    prisma.staffWorkshopAssignment.findUnique.mockResolvedValue(assignment);
    prisma.registration.findUnique.mockResolvedValue(registration);
    prisma.checkin.findUnique.mockResolvedValue(checkin);

    const service = new CheckinService(prisma as never);
    const result = await service.syncOffline(
      {
        deviceId: 'device-1',
        records: [
          {
            deviceEventId: '55555555-5555-5555-5555-555555555555',
            mssv: 'mssv-1',
            workshopId: 'workshop-1',
          },
        ],
      },
      staffId,
    );

    expect(result.results[0]?.status).toBe('duplicate');
    expect(prisma.checkin.create).not.toHaveBeenCalled();
  });
});
