import { Controller, Get, Post, Patch, Delete, Param } from '@nestjs/common';
import { WorkshopService } from './workshop.service.js';

@Controller('workshops')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Get()
  findAll() {
    return this.workshopService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workshopService.findOne(id);
  }

  @Post()
  create() {
    // TODO: Implement with Zod DTO validation
    return this.workshopService.create();
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    // TODO: Implement with Zod DTO validation
    return this.workshopService.update(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workshopService.remove(id);
  }
}
