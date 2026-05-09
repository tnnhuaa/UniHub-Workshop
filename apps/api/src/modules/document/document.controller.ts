import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import { DocumentService } from './document.service.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import {
  documentSummaryParamSchema,
  documentUploadSchema,
  documentWorkshopParamSchema,
  type DocumentSummaryParam,
  type DocumentUploadInput,
  type DocumentWorkshopParam,
} from './document.schemas.js';

@Controller('admin/workshops/:workshopId/documents')
@UseGuards(AuthGuard, RolesGuard)
@Roles('organizer' satisfies UserRoleType)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  upload(
    @Param(new ZodValidationPipe(documentWorkshopParamSchema))
    params: DocumentWorkshopParam,
    @Body(new ZodValidationPipe(documentUploadSchema))
    body: DocumentUploadInput,
  ) {
    return this.documentService.upload(params.workshopId, body);
  }

  @Get()
  findByWorkshop(
    @Param(new ZodValidationPipe(documentWorkshopParamSchema))
    params: DocumentWorkshopParam,
  ) {
    return this.documentService.findByWorkshop(params.workshopId);
  }

  @Get(':documentId/summary')
  getSummary(
    @Param(new ZodValidationPipe(documentSummaryParamSchema))
    params: DocumentSummaryParam,
  ) {
    return this.documentService.getSummary(
      params.workshopId,
      params.documentId,
    );
  }
}
