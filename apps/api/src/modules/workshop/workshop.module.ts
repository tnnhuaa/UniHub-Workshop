import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { WorkshopController } from './workshop.controller.js';
import { WorkshopService } from './workshop.service.js';

@Module({
  imports: [AuthModule],
  controllers: [WorkshopController],
  providers: [WorkshopService],
  exports: [WorkshopService],
})
export class WorkshopModule {}
