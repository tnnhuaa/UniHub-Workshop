import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import type { FastifyRequest } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { CsvSyncService } from './csv-sync.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import {
  csvSyncBatchIdParamSchema,
  csvSyncCreateBatchSchema,
  csvSyncListQuerySchema,
  type CsvSyncBatchIdParam,
  type CsvSyncCreateBatchInput,
  type CsvSyncListQuery,
} from './csv-sync.schemas.js';

@Controller('csv-sync')
@UseGuards(AuthGuard, RolesGuard)
@Roles('organizer' satisfies UserRoleType)
export class CsvSyncController {
  constructor(private readonly csvSyncService: CsvSyncService) {}

  private asMultipartRequest(req: FastifyRequest) {
    return req as FastifyRequest & {
      file: () => Promise<MultipartFile | undefined>;
    };
  }

  @Post('batches')
  createBatch(
    @Body(new ZodValidationPipe(csvSyncCreateBatchSchema))
    body: CsvSyncCreateBatchInput,
  ) {
    return this.csvSyncService.createBatchAndPublish(body.sourceFile);
  }

  @Get('batches/:id')
  findBatch(
    @Param(new ZodValidationPipe(csvSyncBatchIdParamSchema))
    params: CsvSyncBatchIdParam,
  ) {
    return this.csvSyncService.findBatch(params.id);
  }

  @Get('batches')
  listBatches(
    @Query(new ZodValidationPipe(csvSyncListQuerySchema))
    query: CsvSyncListQuery,
  ) {
    return this.csvSyncService.listBatches(query);
  }

  @Post('batches/:id/process')
  async processBatch(
    @Param(new ZodValidationPipe(csvSyncBatchIdParamSchema))
    params: CsvSyncBatchIdParam,
  ) {
    const batch = await this.csvSyncService.findBatch(params.id);
    this.csvSyncService.publishBatch(batch.id, batch.sourceFile);
    return batch;
  }

  @Post('upload')
  async upload(@Req() req: FastifyRequest) {
    const file = await this.asMultipartRequest(req).file();
    if (!file) {
      throw new BadRequestException({
        code: 'CSV_UPLOAD_MISSING_FILE',
        message: 'CSV file is required',
      });
    }

    const { targetPath } = await this.csvSyncService.saveUpload(file);
    return this.csvSyncService.createBatchAndPublish(targetPath);
  }
}
