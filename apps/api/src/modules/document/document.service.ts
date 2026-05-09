import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  LLM_CLIENT,
  OBJECT_STORAGE,
  type ILLMClient,
  type IObjectStorage,
} from './document.adapters.js';
import type { DocumentUploadInput } from './document.schemas.js';

/**
 * DocumentService — manages workshop document uploads and AI summary jobs.
 * Uses IObjectStorage adapter for file storage.
 * Publishes AI summary jobs to RabbitMQ.
 *
 * @see blueprint/IMPLEMENTATION-GUIDE.md §1
 */
@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OBJECT_STORAGE)
    private readonly objectStorage: IObjectStorage,
    @Inject(LLM_CLIENT)
    private readonly llmClient: ILLMClient,
  ) {}

  async upload(workshopId: string, input: DocumentUploadInput) {
    await this.prisma.workshop.findUniqueOrThrow({
      where: { id: workshopId },
      select: { id: true },
    });

    const stored = await this.objectStorage.uploadWorkshopDocument({
      workshopId,
      fileName: input.fileName,
      contentBase64: input.contentBase64,
      contentType: input.contentType ?? 'application/pdf',
    });

    const createdDocument = await this.prisma.workshopDocument.create({
      data: {
        workshopId,
        fileName: stored.fileName,
        fileUrl: stored.fileUrl,
        processingStatus: 'processing',
      },
    });

    const createdJob = await this.prisma.aiSummaryJob.create({
      data: {
        documentId: createdDocument.id,
        status: 'running',
      },
    });

    try {
      const llmResult = await this.llmClient.summarizeDocument({
        documentId: createdDocument.id,
        workshopId,
        fileName: createdDocument.fileName,
        fileUrl: createdDocument.fileUrl,
      });

      const [document, summaryJob] = await this.prisma.$transaction([
        this.prisma.workshopDocument.update({
          where: { id: createdDocument.id },
          data: { processingStatus: 'completed' },
        }),
        this.prisma.aiSummaryJob.update({
          where: { id: createdJob.id },
          data: {
            status: 'completed',
            summaryText: llmResult.summaryText,
          },
        }),
      ]);

      return { document, summaryJob };
    } catch {
      const [document, summaryJob] = await this.prisma.$transaction([
        this.prisma.workshopDocument.update({
          where: { id: createdDocument.id },
          data: { processingStatus: 'failed' },
        }),
        this.prisma.aiSummaryJob.update({
          where: { id: createdJob.id },
          data: {
            status: 'failed',
            retryCount: { increment: 1 },
          },
        }),
      ]);

      return { document, summaryJob };
    }
  }

  findByWorkshop(workshopId: string) {
    return this.prisma.workshopDocument.findMany({
      where: { workshopId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getSummary(workshopId: string, documentId: string) {
    await this.prisma.workshopDocument.findFirstOrThrow({
      where: { id: documentId, workshopId },
      select: { id: true },
    });

    const job = await this.prisma.aiSummaryJob.findFirst({
      where: { documentId, status: 'completed' },
      orderBy: { createdAt: 'desc' },
    });

    if (job) {
      return {
        documentId,
        status: job.status,
        summaryText: job.summaryText,
        retryCount: job.retryCount,
        updatedAt: job.updatedAt,
      };
    }

    const latestJob = await this.prisma.aiSummaryJob.findFirst({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      documentId,
      status: latestJob?.status ?? 'pending',
      summaryText: null,
      retryCount: latestJob?.retryCount ?? 0,
      updatedAt: latestJob?.updatedAt ?? null,
    };
  }
}
