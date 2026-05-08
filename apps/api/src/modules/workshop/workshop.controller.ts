import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import { WorkshopService } from './workshop.service.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
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
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workshopService.create(body, request.authUser?.id ?? '');
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('organizer' satisfies UserRoleType)
  update(
    @Param(new ZodValidationPipe(workshopIdParamSchema))
    params: WorkshopIdParam,
    @Body(new ZodValidationPipe(updateWorkshopSchema))
    body: UpdateWorkshopInput,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workshopService.update(
      params.id,
      body,
      request.authUser?.id ?? '',
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('organizer' satisfies UserRoleType)
  remove(
    @Param(new ZodValidationPipe(workshopIdParamSchema))
    params: WorkshopIdParam,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workshopService.remove(params.id, request.authUser?.id ?? '');
  }
}
