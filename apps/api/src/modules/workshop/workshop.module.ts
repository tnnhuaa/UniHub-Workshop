import { Module } from '@nestjs/common';
import { WorkshopController } from './workshop.controller.js';
import { WorkshopService } from './workshop.service.js';

@Module({
  controllers: [WorkshopController],
  providers: [WorkshopService],
  exports: [WorkshopService],
})
export class WorkshopModule {}
