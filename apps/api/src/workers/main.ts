/**
 * Worker Bootstrap — Standalone RabbitMQ Consumer Process
 *
 * This is the entry point for the background worker service.
 * It connects to RabbitMQ and starts consuming messages from configured queues.
 *
 * Usage:
 *   node dist/workers/main.js
 *
 * Or with NestJS CLI:
 *   npm run worker:start
 */

import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { RabbitMqService, QUEUES } from '../modules/rabbitmq/index.js';
import { NotificationService } from '../modules/notification/notification.service.js';
import { PrismaService } from '../modules/prisma/prisma.service.js';
import { CsvSyncService } from '../modules/csv-sync/csv-sync.service.js';
import { DocumentService } from '../modules/document/document.service.js';
import { NotificationConsumer } from './consumers/notification.consumer.js';
import { CsvSyncConsumer } from './consumers/csv-sync.consumer.js';
import { AiSummaryConsumer } from './consumers/ai-summary.consumer.js';

// Load environment variables
dotenv.config();

const logger = new Logger('WorkerBootstrap');

/**
 * Worker configuration from environment
 */
const config = {
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  nodeEnv: process.env.NODE_ENV || 'development',
};

async function bootstrap(): Promise<void> {
  try {
    logger.log('🚀 Starting UniHub Workshop Background Workers...');
    logger.log(`Environment: ${config.nodeEnv}`);

    // Create application context for DI
    const appContext = await NestFactory.createApplicationContext(AppModule, {
      logger: ['log', 'warn', 'error'],
    });

    // Get RabbitMQ channel from shared service
    const rabbitmq = appContext.get(RabbitMqService);
    const channel = rabbitmq.getChannel();

    // Resolve dependencies
    const prisma = appContext.get(PrismaService);
    const notificationService = appContext.get(NotificationService);
    const csvSyncService = appContext.get(CsvSyncService);
    const documentService = appContext.get(DocumentService);

    // Start consumers
    const notificationConsumer = new NotificationConsumer(
      channel,
      notificationService,
      prisma,
    );

    const csvSyncConsumer = new CsvSyncConsumer(channel, csvSyncService);
    const aiSummaryConsumer = new AiSummaryConsumer(channel, documentService);

    await channel.consume(QUEUES.NOTIFICATION, (msg) => {
      if (msg) {
        void notificationConsumer.handle(msg);
      }
    });

    await channel.consume(QUEUES.CSV_SYNC, (msg) => {
      if (msg) {
        void csvSyncConsumer.handle(msg);
      }
    });

    await channel.consume(QUEUES.AI_SUMMARY, (msg) => {
      if (msg) {
        void aiSummaryConsumer.handle(msg);
      }
    });

    logger.log('✓ Workers initialized and waiting for jobs...');

    // Graceful shutdown
    process.on('SIGINT', () => {
      void (async () => {
        logger.log('📦 Shutting down workers...');
        await appContext.close();
        logger.log('✓ Workers shut down');
        process.exit(0);
      })();
    });
  } catch (error) {
    logger.error('Failed to start workers:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  logger.error('Unexpected error in worker bootstrap:', error);
  process.exit(1);
});
