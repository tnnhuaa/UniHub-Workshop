import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import { CsvSyncService } from './csv-sync.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import {
  csvSyncBatchIdParamSchema,
  csvSyncCreateBatchSchema,
  type CsvSyncBatchIdParam,
  type CsvSyncCreateBatchInput,
} from './csv-sync.schemas.js';

@Controller('csv-sync')
@UseGuards(AuthGuard, RolesGuard)
@Roles('organizer' satisfies UserRoleType)
export class CsvSyncController {
  constructor(private readonly csvSyncService: CsvSyncService) {}

  @Post('batches')
  createBatch(
    @Body(new ZodValidationPipe(csvSyncCreateBatchSchema))
    body: CsvSyncCreateBatchInput,
  ) {
    return this.csvSyncService.createBatch(body.sourceFile);
  }

  @Get('batches/:id')
  findBatch(
    @Param(new ZodValidationPipe(csvSyncBatchIdParamSchema))
    params: CsvSyncBatchIdParam,
  ) {
    return this.csvSyncService.findBatch(params.id);
  }

  @Post('batches/:id/process')
  processBatch(
    @Param(new ZodValidationPipe(csvSyncBatchIdParamSchema))
    params: CsvSyncBatchIdParam,
  ) {
    return this.csvSyncService.processBatch(params.id);
  }
}
