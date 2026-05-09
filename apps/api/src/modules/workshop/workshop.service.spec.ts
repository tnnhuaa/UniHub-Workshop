import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { AuditService } from '../audit/audit.service';
import type { CreateWorkshopInput } from './workshop.schemas';

describe('WorkshopService', () => {
  type WorkshopRow = {
    id: string;
    organizerId: string;
    startTime: Date;
    endTime: Date;
    capacity: number;
    registeredCount: number;
  };

  type PrismaMock = {
    workshop: {
      create: jest.Mock<
        Promise<{ id: string; title: string; status: string }>,
        [unknown]
      >;
      findUniqueOrThrow: jest.Mock<Promise<WorkshopRow>, [unknown]>;
      update: jest.Mock<Promise<unknown>, [unknown]>;
    };
  };

  type AuditServiceMock = {
    log: jest.Mock<void, [unknown]>;
  };

  type TestContext = {
    service: WorkshopService;
    prismaMock: PrismaMock;
    auditServiceMock: AuditServiceMock;
  };

  const baseInput: CreateWorkshopInput = {
    title: 'Intro to AI',
    description: 'Basics',
    speaker: 'Dr. Ada',
    room: 'A1',
    capacity: 50,
    startTime: new Date('2026-05-08T08:00:00.000Z'),
    endTime: new Date('2026-05-08T10:00:00.000Z'),
  };

  const createService = (): TestContext => {
    const prismaMock: PrismaMock = {
      workshop: {
        create: jest.fn<
          Promise<{ id: string; title: string; status: string }>,
          [unknown]
        >(),
        findUniqueOrThrow: jest.fn<Promise<WorkshopRow>, [unknown]>(),
        update: jest.fn<Promise<unknown>, [unknown]>(),
      },
    };

    const auditServiceMock: AuditServiceMock = {
      log: jest.fn<void, [unknown]>(),
    };

    const prisma = prismaMock as unknown as PrismaService;
    const auditService = auditServiceMock as unknown as AuditService;

    return {
      service: new WorkshopService(prisma, auditService),
      prismaMock,
      auditServiceMock,
    };
  };

  it('creates workshop with organizerId and default price', async () => {
    const { service, prismaMock, auditServiceMock } = createService();

    prismaMock.workshop.create.mockResolvedValue({
      id: 'workshop-1',
      title: baseInput.title,
      status: 'draft',
    });

    await expect(service.create(baseInput, 'organizer-1')).resolves.toEqual(
      expect.objectContaining({
        id: 'workshop-1',
      }),
    );

    const createArgs = prismaMock.workshop.create.mock.calls[0]?.[0] as {
      data: {
        organizerId: string;
        price: number;
      };
    };

    expect(createArgs.data.organizerId).toBe('organizer-1');
    expect(createArgs.data.price).toBe(0);
    expect(auditServiceMock.log).toHaveBeenCalled();
  });

  it('rejects updates from non-owners', async () => {
    const { service, prismaMock } = createService();

    prismaMock.workshop.findUniqueOrThrow.mockResolvedValue({
      id: 'workshop-1',
      organizerId: 'organizer-1',
      startTime: baseInput.startTime,
      endTime: baseInput.endTime,
      capacity: baseInput.capacity,
      registeredCount: 0,
    });

    await expect(
      service.update('workshop-1', { title: 'New' }, 'organizer-2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects capacity updates below registered count', async () => {
    const { service, prismaMock } = createService();

    prismaMock.workshop.findUniqueOrThrow.mockResolvedValue({
      id: 'workshop-1',
      organizerId: 'organizer-1',
      startTime: baseInput.startTime,
      endTime: baseInput.endTime,
      capacity: baseInput.capacity,
      registeredCount: 10,
    });

    await expect(
      service.update('workshop-1', { capacity: 5 }, 'organizer-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
