import { AdminService } from './admin.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  const buildPrisma = () => ({
    workshop: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    registration: {
      count: jest.fn(),
    },
    payment: {
      aggregate: jest.fn(),
    },
    csvLog: {
      findMany: jest.fn(),
    },
    aiSummaryJob: {
      groupBy: jest.fn(),
      findFirst: jest.fn(),
    },
  });

  it('builds dashboard summary with system health', async () => {
    const prisma = buildPrisma();
    prisma.workshop.count.mockResolvedValue(4);
    prisma.registration.count.mockResolvedValue(120);
    prisma.payment.aggregate.mockResolvedValue({
      _sum: { amount: 2560 },
    });
    prisma.workshop.findMany.mockResolvedValue([
      {
        id: 'workshop-1',
        title: 'AI 101',
        startTime: new Date('2026-05-14T10:00:00.000Z'),
        endTime: new Date('2026-05-14T12:00:00.000Z'),
        capacity: 50,
        registeredCount: 42,
        status: 'published',
      },
    ]);
    prisma.csvLog.findMany.mockResolvedValue([
      {
        id: 'batch-1',
        sourceFile: 'students.csv',
        status: 'failed',
        totalRecords: 100,
        successfulRecords: 96,
        failedRecords: 4,
        conflictRecords: 0,
        startedAt: new Date('2026-05-13T01:00:00.000Z'),
        completedAt: new Date('2026-05-13T01:10:00.000Z'),
        errors: [{ rowNumber: 42, message: 'EMAIL_INVALID' }],
      },
    ]);
    prisma.aiSummaryJob.groupBy.mockResolvedValue([
      { status: 'running', _count: { _all: 3 } },
      { status: 'completed', _count: { _all: 8 } },
    ]);
    prisma.aiSummaryJob.findFirst.mockResolvedValue({
      updatedAt: new Date('2026-05-14T08:00:00.000Z'),
    });

    const service = new AdminService(prisma as unknown as PrismaService);

    const result = await service.getDashboard();

    expect(result.kpis.totalWorkshops).toBe(4);
    expect(result.kpis.totalRegistrations).toBe(120);
    expect(result.kpis.grossRevenue).toBe(2560);
    expect(result.systemHealth.csvSync.batches[0]?.lastError).toEqual({
      rowNumber: 42,
      message: 'EMAIL_INVALID',
    });
    expect(result.systemHealth.aiSummary.counts.running).toBe(3);
    expect(result.systemHealth.aiSummary.counts.pending).toBe(0);
  });
});
