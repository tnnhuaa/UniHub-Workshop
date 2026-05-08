import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { WorkshopService } from './workshop.service.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import {
  createWorkshopSchema,
  updateWorkshopSchema,
  workshopIdParamSchema,
  workshopListQuerySchema,
  type CreateWorkshopInput,
  type UpdateWorkshopInput,
  type WorkshopIdParam,
  type WorkshopListQuery,
} from './workshop.schemas.js';

@Controller('workshops')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(workshopListQuerySchema))
    query: WorkshopListQuery,
  ) {
    return this.workshopService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param(new ZodValidationPipe(workshopIdParamSchema))
    params: WorkshopIdParam,
  ) {
    return this.workshopService.findOne(params.id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createWorkshopSchema))
    body: CreateWorkshopInput,
  ) {
    return this.workshopService.create(body);
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(workshopIdParamSchema))
    params: WorkshopIdParam,
    @Body(new ZodValidationPipe(updateWorkshopSchema))
    body: UpdateWorkshopInput,
  ) {
    return this.workshopService.update(params.id, body);
  }

  @Delete(':id')
  remove(
    @Param(new ZodValidationPipe(workshopIdParamSchema))
    params: WorkshopIdParam,
  ) {
    return this.workshopService.remove(params.id);
  }
}
