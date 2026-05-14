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
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminService } from './admin.service.js';
import { WorkshopService } from '../workshop/workshop.service.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import {
  adminDashboardQuerySchema,
  type AdminDashboardQuery,
} from './admin.schemas.js';
import {
  createWorkshopSchema,
  updateWorkshopSchema,
  workshopIdParamSchema,
  type CreateWorkshopInput,
  type UpdateWorkshopInput,
  type WorkshopIdParam,
} from '../workshop/workshop.schemas.js';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('organizer' satisfies UserRoleType)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly workshopService: WorkshopService,
  ) {}

  @Get('dashboard')
  getDashboard(
    @Query(new ZodValidationPipe(adminDashboardQuerySchema))
    query: AdminDashboardQuery,
  ) {
    return this.adminService.getDashboard(query);
  }

  @Post('workshops')
  createWorkshop(
    @Body(new ZodValidationPipe(createWorkshopSchema))
    body: CreateWorkshopInput,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workshopService.create(body, request.authUser?.id ?? '');
  }

  @Patch('workshops/:id')
  updateWorkshop(
    @Param(new ZodValidationPipe(workshopIdParamSchema))
    params: WorkshopIdParam,
    @Body(new ZodValidationPipe(updateWorkshopSchema))
    body: UpdateWorkshopInput,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workshopService.adminUpdate(
      params.id,
      body,
      request.authUser?.id ?? '',
    );
  }

  @Delete('workshops/:id')
  removeWorkshop(
    @Param(new ZodValidationPipe(workshopIdParamSchema))
    params: WorkshopIdParam,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workshopService.adminRemove(
      params.id,
      request.authUser?.id ?? '',
    );
  }
}
