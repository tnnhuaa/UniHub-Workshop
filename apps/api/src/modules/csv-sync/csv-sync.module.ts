import { Module } from '@nestjs/common';
import { CsvSyncService } from './csv-sync.service.js';
import { CsvSyncScheduler } from './csv-sync.scheduler.js';
import { CsvSyncController } from './csv-sync.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [CsvSyncController],
  providers: [CsvSyncService, CsvSyncScheduler],
  exports: [CsvSyncService],
})
export class CsvSyncModule {}
