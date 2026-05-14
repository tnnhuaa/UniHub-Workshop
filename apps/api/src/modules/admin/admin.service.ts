import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalWorkshops,
      totalRegistrations,
      paymentAggregate,
      workshops,
      csvBatches,
      aiStatusCounts,
      lastCompletedSummary,
    ] = await Promise.all([
      this.prisma.workshop.count(),
      this.prisma.registration.count(),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'paid' },
      }),
      this.prisma.workshop.findMany({
        orderBy: { startTime: 'asc' },
        take: 10,
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
          capacity: true,
          registeredCount: true,
          status: true,
        },
      }),
      this.prisma.csvLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: {
          errors: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.aiSummaryJob.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.aiSummaryJob.findFirst({
        where: { status: 'completed' },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const aiSummaryCounts = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    aiStatusCounts.forEach((entry) => {
      aiSummaryCounts[entry.status] = entry._count._all;
    });

    const grossRevenue = Number(paymentAggregate._sum.amount ?? 0);

    return {
      kpis: {
        totalWorkshops,
        totalRegistrations,
        grossRevenue,
      },
      workshops,
      systemHealth: {
        csvSync: {
          batches: csvBatches.map((batch) => ({
            id: batch.id,
            sourceFile: batch.sourceFile,
            status: batch.status,
            totalRecords: batch.totalRecords,
            successfulRecords: batch.successfulRecords,
            failedRecords: batch.failedRecords,
            conflictRecords: batch.conflictRecords,
            startedAt: batch.startedAt,
            completedAt: batch.completedAt,
            lastError: batch.errors[0]
              ? {
                  rowNumber: batch.errors[0].rowNumber,
                  message: batch.errors[0].message,
                }
              : null,
          })),
        },
        aiSummary: {
          counts: aiSummaryCounts,
          lastCompletedAt: lastCompletedSummary?.updatedAt ?? null,
        },
      },
    };
  }
}
