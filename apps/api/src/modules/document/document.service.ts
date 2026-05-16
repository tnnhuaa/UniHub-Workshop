import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMqService, EVENTS_KEYS } from '../rabbitmq/index.js';
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
  private readonly logger = new Logger(DocumentService.name);
  private static readonly MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmq: RabbitMqService,
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

    const fileSizeBytes = Buffer.byteLength(input.contentBase64, 'base64');
    if (fileSizeBytes > DocumentService.MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException({
        code: 'DOCUMENT_TOO_LARGE',
        message: 'PDF must be 10MB or smaller.',
      });
    }

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
        status: 'pending',
      },
    });

    this.publishAiSummaryJob(createdDocument.id, workshopId, createdJob.id);

    return { document: createdDocument, summaryJob: createdJob };
  }

  publishAiSummaryJob(documentId: string, workshopId: string, jobId: string) {
    const correlationId = `ai-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    this.rabbitmq.publish(EVENTS_KEYS.AI_SUMMARY_REQUESTED, {
      correlationId,
      documentId,
      workshopId,
      jobId,
      publishedAt: new Date().toISOString(),
    });

    this.logger.debug(
      `Published AI summary job [${correlationId}] for document ${documentId}`,
    );
  }

  async processAiSummaryJob(documentId: string, jobId: string) {
    const document = await this.prisma.workshopDocument.findUniqueOrThrow({
      where: { id: documentId },
    });

    await this.prisma.aiSummaryJob.update({
      where: { id: jobId },
      data: { status: 'running' },
    });

    try {
      const llmResult = await this.llmClient.summarizeDocument({
        documentId,
        workshopId: document.workshopId,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
      });

      const [updatedDocument, summaryJob] = await this.prisma.$transaction([
        this.prisma.workshopDocument.update({
          where: { id: documentId },
          data: { processingStatus: 'completed' },
        }),
        this.prisma.aiSummaryJob.update({
          where: { id: jobId },
          data: {
            status: 'completed',
            summaryText: llmResult.summaryText,
          },
        }),
      ]);

      return { document: updatedDocument, summaryJob };
    } catch (error) {
      const [updatedDocument, summaryJob] = await this.prisma.$transaction([
        this.prisma.workshopDocument.update({
          where: { id: documentId },
          data: { processingStatus: 'failed' },
        }),
        this.prisma.aiSummaryJob.update({
          where: { id: jobId },
          data: {
            status: 'failed',
            retryCount: { increment: 1 },
          },
        }),
      ]);

      this.logger.error(
        `AI summary failed for document ${documentId} (job ${jobId})`,
        error,
      );

      return { document: updatedDocument, summaryJob };
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
