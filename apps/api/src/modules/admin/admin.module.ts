import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { WorkshopModule } from '../workshop/workshop.module.js';

@Module({
  imports: [AuthModule, WorkshopModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
