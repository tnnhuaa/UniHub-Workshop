import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { JobStatus } from '@prisma/client';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import type { MultipartFile } from '@fastify/multipart';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMqService, EVENTS_KEYS } from '../rabbitmq/index.js';
import type { Env } from '../../config/env.schema.js';

/**
 * CsvSyncService — orchestrates CSV import batches.
 * Uses IStorageAdapter (S3 primary, SFTP for hardening phase).
 *
 * @see blueprint/specs/csv-sync.md
 * @see blueprint/IMPLEMENTATION-GUIDE.md §5
 */
@Injectable()
export class CsvSyncService {
  private readonly logger = new Logger(CsvSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmq: RabbitMqService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  private getDropLocation() {
    return this.configService.get('CSV_DROP_LOCATION', { infer: true });
  }

  private getTimezone() {
    return this.configService.get('CSV_SYNC_TIMEZONE', { infer: true });
  }

  async createBatch(sourceFile: string) {
    return this.prisma.csvLog.create({
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

  async findBatch(id: string) {
    return this.prisma.csvLog.findUniqueOrThrow({
      where: { id },
      include: { errors: true },
    });
  }

  async listBatches(query: {
    page: number;
    pageSize: number;
    status?: JobStatus;
  }) {
    const where: { status?: JobStatus } = {};
    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.csvLog.findMany({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }

  async processBatch(batchId: string) {
    const batch = await this.prisma.csvLog.findUniqueOrThrow({
      where: { id: batchId },
    });

    await this.prisma.csvLog.update({
      where: { id: batch.id },
      data: { status: 'running', startedAt: new Date() },
    });

    const counters = {
      total: 0,
      successful: 0,
      failed: 0,
      conflicts: 0,
    };

    try {
      await this.processFile(batch, counters);

      return await this.prisma.csvLog.update({
        where: { id: batch.id },
        data: {
          totalRecords: counters.total,
          successfulRecords: counters.successful,
          failedRecords: counters.failed,
          conflictRecords: counters.conflicts,
          status: 'completed',
          completedAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.csvLog.update({
        where: { id: batch.id },
        data: {
          totalRecords: counters.total,
          successfulRecords: counters.successful,
          failedRecords: counters.failed,
          conflictRecords: counters.conflicts,
          status: 'failed',
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  publishBatch(batchId: string, sourceFile: string) {
    const correlationId = `csv-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    this.rabbitmq.publish(EVENTS_KEYS.CSV_SYNC_REQUESTED, {
      correlationId,
      batchId,
      fileUrl: sourceFile,
      chunkSize: 1000,
      timezone: this.getTimezone(),
      publishedAt: new Date().toISOString(),
    });

    this.logger.debug(
      `Published CSV sync job [${correlationId}] for batch ${batchId}`,
    );
  }

  async createBatchAndPublish(sourceFile: string) {
    const batch = await this.createBatch(sourceFile);
    this.publishBatch(batch.id, sourceFile);
    return batch;
  }

  async saveUpload(file: MultipartFile) {
    if (!file.filename.endsWith('.csv')) {
      throw new BadRequestException({
        code: 'CSV_UPLOAD_INVALID_FILE',
        message: 'Only .csv files are supported',
      });
    }

    const dropLocation = this.getDropLocation();
    await mkdir(dropLocation, { recursive: true });

    const safeName = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}-${safeName}`;
    const targetPath = path.join(dropLocation, uniqueName);

    await pipeline(file.file, createWriteStream(targetPath));

    return { targetPath, originalName: file.filename };
  }

  private async processFile(
    batch: { id: string; sourceFile: string },
    counters: {
      total: number;
      successful: number;
      failed: number;
      conflicts: number;
    },
  ) {
    const stream = createReadStream(batch.sourceFile, { encoding: 'utf-8' });
    const reader = createInterface({ input: stream, crlfDelay: Infinity });

    let header: string[] | null = null;
    let lineNumber = 0;
    const chunkSize = 1000;
    const buffer: Array<{
      rowNumber: number;
      data: {
        mssv: string;
        email: string | null;
        fullName: string | null;
        phone: string | null;
        faculty: string | null;
        className: string | null;
        status: string | null;
      };
    }> = [];

    for await (const line of reader) {
      lineNumber += 1;
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      const columns = this.parseCsvLine(line);
      if (!header) {
        header = columns.map((value) => this.normalizeHeader(value));
        continue;
      }

      const row = this.buildRow(header, columns);
      counters.total += 1;

      const validationError = this.validateRow(row);
      if (validationError) {
        counters.failed += 1;
        await this.prisma.csvLogError.create({
          data: {
            batchId: batch.id,
            rowNumber: lineNumber,
            message: validationError,
            rawRow: row,
          },
        });
        continue;
      }

      buffer.push({
        rowNumber: lineNumber,
        data: row as {
          mssv: string;
          email: string | null;
          fullName: string | null;
          phone: string | null;
          faculty: string | null;
          className: string | null;
          status: string | null;
        },
      });

      if (buffer.length >= chunkSize) {
        await this.flushChunk(batch.id, buffer, counters);
        buffer.length = 0;
      }
    }

    if (buffer.length > 0) {
      await this.flushChunk(batch.id, buffer, counters);
    }
  }

  private normalizeHeader(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  private buildRow(header: string[], columns: string[]) {
    const row: Record<string, string | null> = {};
    header.forEach((key, index) => {
      const value = columns[index]?.trim();
      row[key] = value ? value : null;
    });

    return {
      mssv: row.mssv ?? row.student_id ?? row.studentid ?? null,
      email: row.email ?? null,
      fullName: row.full_name ?? row.fullname ?? row.name ?? null,
      phone: row.phone ?? row.phone_number ?? null,
      faculty: row.faculty ?? row.department ?? null,
      className: row.class_name ?? row.class ?? null,
      status: row.status ?? null,
    };
  }

  private validateRow(row: {
    mssv: string | null;
    email: string | null;
    phone: string | null;
  }) {
    if (!row.mssv) {
      return 'MSSV_REQUIRED';
    }

    if (row.email && !this.isValidEmail(row.email)) {
      return 'EMAIL_INVALID';
    }

    if (row.phone && !this.isValidPhone(row.phone)) {
      return 'PHONE_INVALID';
    }

    return null;
  }

  private isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private isValidPhone(value: string) {
    return /^[+0-9\-()\s]{6,20}$/.test(value);
  }

  private async flushChunk(
    batchId: string,
    rows: Array<{
      rowNumber: number;
      data: {
        mssv: string;
        email: string | null;
        fullName: string | null;
        phone: string | null;
        faculty: string | null;
        className: string | null;
        status: string | null;
      };
    }>,
    counters: {
      successful: number;
      conflicts: number;
      failed: number;
    },
  ) {
    const mssvList = rows.map((row) => row.data.mssv);
    const existing = await this.prisma.student.findMany({
      where: { mssv: { in: mssvList } },
      select: { mssv: true },
    });
    const existingSet = new Set(existing.map((row) => row.mssv));

    let attempt = 0;
    while (attempt < 3) {
      try {
        await this.prisma.$transaction(
          rows.map((row) =>
            this.prisma.student.upsert({
              where: { mssv: row.data.mssv },
              update: {
                email: row.data.email,
                fullName: row.data.fullName,
                phone: row.data.phone,
                faculty: row.data.faculty,
                className: row.data.className,
                status: row.data.status,
                csvSyncedAt: new Date(),
              },
              create: {
                mssv: row.data.mssv,
                email: row.data.email,
                fullName: row.data.fullName,
                phone: row.data.phone,
                faculty: row.data.faculty,
                className: row.data.className,
                status: row.data.status,
                csvSyncedAt: new Date(),
              },
            }),
          ),
        );

        const conflictCount = rows.filter((row) =>
          existingSet.has(row.data.mssv),
        ).length;
        counters.conflicts += conflictCount;
        counters.successful += rows.length;
        return;
      } catch (error) {
        attempt += 1;
        if (attempt >= 3) {
          counters.failed += rows.length;
          await this.prisma.csvLogError.createMany({
            data: rows.map((row) => ({
              batchId,
              rowNumber: row.rowNumber,
              message: 'CHUNK_UPSERT_FAILED',
              rawRow: row.data,
            })),
          });
          throw error;
        }
      }
    }
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        const next = line[i + 1];
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    result.push(current);
    return result;
  }
}
