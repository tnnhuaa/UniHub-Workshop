import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import { CheckinService } from './checkin.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('checkins')
@UseGuards(AuthGuard, RolesGuard)
@Roles('checkin_staff' satisfies UserRoleType)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('scan')
  scan() {
    // TODO: Implement QR scan with Zod DTO (CheckinScanDTO)
    return this.checkinService.scan();
  }

  @Post('confirm')
  confirm() {
    // TODO: Implement check-in confirmation
    return this.checkinService.confirm();
  }

  @Get('workshop/:id')
  findByWorkshop(@Param('id') workshopId: string) {
    return this.checkinService.findByWorkshop(workshopId);
  }

  @Post('sync')
  syncOffline() {
    // TODO: Implement offline sync with dedup strategy
    return this.checkinService.syncOffline();
  }
}
