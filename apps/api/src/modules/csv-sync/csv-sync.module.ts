import { Module } from '@nestjs/common';
import { CsvSyncService } from './csv-sync.service.js';
import { CsvSyncController } from './csv-sync.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [CsvSyncController],
  providers: [CsvSyncService],
  exports: [CsvSyncService],
})
export class CsvSyncModule {}
