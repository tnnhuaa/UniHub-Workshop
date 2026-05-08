import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import { WorkshopService } from './workshop.service.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('organizer' satisfies UserRoleType)
  create(
    @Body(new ZodValidationPipe(createWorkshopSchema))
    body: CreateWorkshopInput,
  ) {
    return this.workshopService.create(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('organizer' satisfies UserRoleType)
  update(
    @Param(new ZodValidationPipe(workshopIdParamSchema))
    params: WorkshopIdParam,
    @Body(new ZodValidationPipe(updateWorkshopSchema))
    body: UpdateWorkshopInput,
  ) {
    return this.workshopService.update(params.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('organizer' satisfies UserRoleType)
  remove(
    @Param(new ZodValidationPipe(workshopIdParamSchema))
    params: WorkshopIdParam,
  ) {
    return this.workshopService.remove(params.id);
  }
}
