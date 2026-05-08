import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * CsvSyncService — orchestrates CSV import batches.
 * Uses IStorageAdapter (S3 primary, SFTP for hardening phase).
 *
 * @see blueprint/specs/csv-sync.md
 * @see blueprint/IMPLEMENTATION-GUIDE.md §5
 */
@Injectable()
export class CsvSyncService {
  constructor(private readonly prisma: PrismaService) {}

  createBatch(sourceFile: string) {
    return this.prisma.csvImportBatch.create({
      data: {
        sourceFile,
        totalRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        conflictRecords: 0,
        status: 'pending',
      },
    });
  }

  findBatch(id: string) {
    return this.prisma.csvImportBatch.findUniqueOrThrow({
      where: { id },
      include: { errors: true },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processBatch(_batchId: string): never {
    // TODO: Implement CSV parsing + student upsert via StudentService
    throw new Error('Not implemented');
  }
}
