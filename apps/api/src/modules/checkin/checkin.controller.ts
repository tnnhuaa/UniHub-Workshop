import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import { CheckinService } from './checkin.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import {
  checkinConfirmSchema,
  checkinScanSchema,
  checkinSyncSchema,
  checkinWorkshopParamSchema,
  type CheckinConfirmInput,
  type CheckinScanInput,
  type CheckinSyncInput,
  type CheckinWorkshopParam,
} from './checkin.schemas.js';

@Controller('checkins')
@UseGuards(AuthGuard, RolesGuard)
@Roles('checkin_staff' satisfies UserRoleType)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('scan')
  scan(
    @Body(new ZodValidationPipe(checkinScanSchema)) body: CheckinScanInput,
    @Req() request: AuthenticatedRequest,
  ) {
    const staffId = request.authUser?.id;
    if (!staffId) {
      throw new ForbiddenException({
        code: 'CHECKIN_STAFF_REQUIRED',
        message: 'Check-in staff identity is required',
      });
    }

    return this.checkinService.scan(body, staffId);
  }

  @Post('confirm')
  confirm(
    @Body(new ZodValidationPipe(checkinConfirmSchema))
    body: CheckinConfirmInput,
    @Req() request: AuthenticatedRequest,
  ) {
    const staffId = request.authUser?.id;
    if (!staffId) {
      throw new ForbiddenException({
        code: 'CHECKIN_STAFF_REQUIRED',
        message: 'Check-in staff identity is required',
      });
    }

    return this.checkinService.confirm(body, staffId);
  }

  @Get('workshop/:id')
  findByWorkshop(
    @Param(new ZodValidationPipe(checkinWorkshopParamSchema))
    params: CheckinWorkshopParam,
    @Req() request: AuthenticatedRequest,
  ) {
    const staffId = request.authUser?.id;
    if (!staffId) {
      throw new ForbiddenException({
        code: 'CHECKIN_STAFF_REQUIRED',
        message: 'Check-in staff identity is required',
      });
    }

    return this.checkinService.findByWorkshop(params.id, staffId);
  }

  @Post('sync')
  syncOffline(
    @Body(new ZodValidationPipe(checkinSyncSchema)) body: CheckinSyncInput,
    @Req() request: AuthenticatedRequest,
  ) {
    const staffId = request.authUser?.id;
    if (!staffId) {
      throw new ForbiddenException({
        code: 'CHECKIN_STAFF_REQUIRED',
        message: 'Check-in staff identity is required',
      });
    }

    return this.checkinService.syncOffline(body, staffId);
  }
}
