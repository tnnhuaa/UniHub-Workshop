import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * DocumentService — manages workshop document uploads and AI summary jobs.
 * Uses IObjectStorage adapter for file storage.
 * Publishes AI summary jobs to RabbitMQ.
 *
 * @see blueprint/IMPLEMENTATION-GUIDE.md §1
 */
@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  upload(_workshopId: string): never {
    // TODO: Implement file upload via IObjectStorage adapter
    throw new Error('Not implemented');
  }

  findByWorkshop(workshopId: string) {
    return this.prisma.workshopDocument.findMany({
      where: { workshopId },
    });
  }

  async getSummary(documentId: string) {
    const job = await this.prisma.aiSummaryJob.findFirst({
      where: { documentId, status: 'completed' },
      orderBy: { createdAt: 'desc' },
    });
    return { summaryText: job?.summaryText ?? null };
  }
}
