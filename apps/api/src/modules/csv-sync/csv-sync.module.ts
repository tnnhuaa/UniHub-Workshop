import { Module } from '@nestjs/common';
import { CsvSyncService } from './csv-sync.service.js';

@Module({
  providers: [CsvSyncService],
  exports: [CsvSyncService],
})
export class CsvSyncModule {}
