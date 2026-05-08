import { Controller, Post, Get, Param } from '@nestjs/common';
import { CheckinService } from './checkin.service.js';

@Controller('checkins')
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
