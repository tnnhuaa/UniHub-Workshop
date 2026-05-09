import { DocumentService } from './document.service.js';

describe('DocumentService', () => {
  const workshopId = '11111111-1111-4111-8111-111111111111';
  const documentId = '22222222-2222-4222-8222-222222222222';
  const jobId = '33333333-3333-4333-8333-333333333333';

  const buildPrisma = () => ({
    workshop: {
      findUniqueOrThrow: jest.fn(),
    },
    workshopDocument: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
    aiSummaryJob: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  });

  it('uploads document and completes summary job when LLM succeeds', async () => {
    const prisma = buildPrisma();
    prisma.workshop.findUniqueOrThrow.mockResolvedValue({ id: workshopId });
    prisma.workshopDocument.create.mockResolvedValue({
      id: documentId,
      workshopId,
      fileName: 'policy.pdf',
      fileUrl: 'mock://workshop-documents/policy.pdf',
      processingStatus: 'processing',
    });
    prisma.aiSummaryJob.create.mockResolvedValue({
      id: jobId,
      documentId,
      status: 'running',
      retryCount: 0,
    });
    prisma.workshopDocument.update.mockResolvedValue({
      id: documentId,
      processingStatus: 'completed',
    });
    prisma.aiSummaryJob.update.mockResolvedValue({
      id: jobId,
      status: 'completed',
      summaryText: 'Summary text',
      retryCount: 0,
    });
    prisma.$transaction.mockImplementation(async (items: unknown[]) =>
      Promise.all(items as Array<Promise<unknown>>),
    );

    const objectStorage = {
      uploadWorkshopDocument: jest.fn().mockResolvedValue({
        fileName: 'policy.pdf',
        fileUrl: 'mock://workshop-documents/policy.pdf',
      }),
    };

    const llmClient = {
      summarizeDocument: jest.fn().mockResolvedValue({
        summaryText: 'Summary text',
      }),
    };

    const service = new DocumentService(
      prisma as never,
      objectStorage,
      llmClient,
    );

    const result = await service.upload(workshopId, {
      fileName: 'policy.pdf',
      contentBase64: 'JVBERi0xLjQK',
      contentType: 'application/pdf',
    });

    expect(objectStorage.uploadWorkshopDocument).toHaveBeenCalled();
    expect(llmClient.summarizeDocument).toHaveBeenCalled();
    expect(result.document.processingStatus).toBe('completed');
    expect(result.summaryJob.status).toBe('completed');
  });

  it('marks summary job as failed when LLM call fails', async () => {
    const prisma = buildPrisma();
    prisma.workshop.findUniqueOrThrow.mockResolvedValue({ id: workshopId });
    prisma.workshopDocument.create.mockResolvedValue({
      id: documentId,
      workshopId,
      fileName: 'policy.pdf',
      fileUrl: 'mock://workshop-documents/policy.pdf',
      processingStatus: 'processing',
    });
    prisma.aiSummaryJob.create.mockResolvedValue({
      id: jobId,
      documentId,
      status: 'running',
      retryCount: 0,
    });
    prisma.workshopDocument.update.mockResolvedValue({
      id: documentId,
      processingStatus: 'failed',
    });
    prisma.aiSummaryJob.update.mockResolvedValue({
      id: jobId,
      status: 'failed',
      retryCount: 1,
    });
    prisma.$transaction.mockImplementation(async (items: unknown[]) =>
      Promise.all(items as Array<Promise<unknown>>),
    );

    const objectStorage = {
      uploadWorkshopDocument: jest.fn().mockResolvedValue({
        fileName: 'policy.pdf',
        fileUrl: 'mock://workshop-documents/policy.pdf',
      }),
    };

    const llmClient = {
      summarizeDocument: jest.fn().mockRejectedValue(new Error('LLM timeout')),
    };

    const service = new DocumentService(
      prisma as never,
      objectStorage,
      llmClient,
    );

    const result = await service.upload(workshopId, {
      fileName: 'policy.pdf',
      contentBase64: 'JVBERi0xLjQK',
      contentType: 'application/pdf',
    });

    expect(result.document.processingStatus).toBe('failed');
    expect(result.summaryJob.status).toBe('failed');
  });

  it('returns latest completed summary for workshop document', async () => {
    const prisma = buildPrisma();
    prisma.workshopDocument.findFirstOrThrow.mockResolvedValue({
      id: documentId,
    });
    prisma.aiSummaryJob.findFirst
      .mockResolvedValueOnce({
        id: jobId,
        documentId,
        status: 'completed',
        summaryText: 'Completed summary',
        retryCount: 0,
        updatedAt: new Date('2026-05-09T00:00:00.000Z'),
      })
      .mockResolvedValueOnce(null);

    const service = new DocumentService(
      prisma as never,
      {} as never,
      {} as never,
    );

    const result = await service.getSummary(workshopId, documentId);

    expect(result.status).toBe('completed');
    expect(result.summaryText).toBe('Completed summary');
  });
});
