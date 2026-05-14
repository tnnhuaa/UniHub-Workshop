import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { CsvSyncService } from './csv-sync.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Env } from '../../config/env.schema.js';

@Injectable()
export class CsvSyncScheduler {
  private readonly logger = new Logger(CsvSyncScheduler.name);

  constructor(
    private readonly csvSyncService: CsvSyncService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  @Cron('0 0 1,4 * * *', {
    timeZone: 'UTC',
  })
  async handleScheduledSync() {
    const timezone = this.configService.get('CSV_SYNC_TIMEZONE', {
      infer: true,
    });

    if (timezone && timezone !== 'UTC') {
      this.logger.warn(
        `CSV scheduler timezone override detected: ${timezone}. The cron runs in UTC.`,
      );
    }

    const dropLocation = this.configService.get('CSV_DROP_LOCATION', {
      infer: true,
    });

    try {
      const files = await readdir(dropLocation);
      const csvFiles = files.filter((name) =>
        name.toLowerCase().endsWith('.csv'),
      );

      if (csvFiles.length === 0) {
        this.logger.debug('No CSV files found for scheduled sync');
        return;
      }

      for (const file of csvFiles) {
        const fullPath = path.join(dropLocation, file);
        const existing = await this.prisma.csvLog.findFirst({
          where: { sourceFile: fullPath },
        });

        if (existing) {
          this.logger.debug(`Skipping CSV file already processed: ${fullPath}`);
          continue;
        }

        const batch = await this.csvSyncService.createBatchAndPublish(fullPath);
        this.logger.log(
          `Scheduled CSV batch created and published: ${batch.id} (${file})`,
        );
      }
    } catch (error) {
      this.logger.error('CSV scheduler failed:', error);
    }
  }
}
