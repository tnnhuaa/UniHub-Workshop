import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CheckinController } from './checkin.controller.js';
import { CheckinService } from './checkin.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CheckinController],
  providers: [CheckinService],
  exports: [CheckinService],
})
export class CheckinModule {}
