import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AdminDashboardQuery } from './admin.schemas.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(query: AdminDashboardQuery = { page: 1, pageSize: 10 }) {
    const workshopWhere: Prisma.WorkshopWhereInput = {};
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    if (query.q) {
      workshopWhere.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { speaker: { contains: query.q, mode: 'insensitive' } },
        { room: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [
      totalWorkshops,
      matchingWorkshopCount,
      totalRegistrations,
      paymentAggregate,
      workshops,
      csvBatches,
      aiStatusCounts,
      lastCompletedSummary,
    ] = await Promise.all([
      this.prisma.workshop.count(),
      this.prisma.workshop.count({
        where: workshopWhere,
      }),
      this.prisma.registration.count(),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'paid' },
      }),
      this.prisma.workshop.findMany({
        where: workshopWhere,
        orderBy: { startTime: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
    const totalPages = Math.max(1, Math.ceil(matchingWorkshopCount / pageSize));

    return {
      kpis: {
        totalWorkshops,
        totalRegistrations,
        grossRevenue,
      },
      workshops,
      pagination: {
        page,
        pageSize,
        total: matchingWorkshopCount,
        totalPages,
      },
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
