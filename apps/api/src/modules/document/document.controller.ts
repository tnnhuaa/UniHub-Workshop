import { Controller, Post, Get, Param } from '@nestjs/common';
import { DocumentService } from './document.service.js';

@Controller('admin/workshops/:workshopId/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  upload(@Param('workshopId') workshopId: string) {
    // TODO: Implement PDF upload via IObjectStorage adapter
    return this.documentService.upload(workshopId);
  }

  @Get()
  findByWorkshop(@Param('workshopId') workshopId: string) {
    return this.documentService.findByWorkshop(workshopId);
  }

  @Get(':id/summary')
  getSummary(@Param('id') documentId: string) {
    return this.documentService.getSummary(documentId);
  }
}
