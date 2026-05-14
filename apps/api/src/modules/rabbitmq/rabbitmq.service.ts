import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { connect } from 'amqplib';
import type { Channel, ChannelModel, Options } from 'amqplib';
import { EXCHANGES, QUEUES } from './rabbitmq.constants.js';

@Injectable()
export class RabbitMqService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private connected = false;

  constructor(private rabbitmqUrl: string = 'amqp://localhost:5672') {}

  /**
   * Connect to RabbitMQ and declare exchanges/queues
   */
  async connect(): Promise<void> {
    try {
      this.logger.log('Connecting to RabbitMQ...');
      const connection = await connect(this.rabbitmqUrl, {
        connectionName: 'unihub-api',
        heartbeat: 30,
        vhost: '/',
      });
      this.connection = connection;

      const channel = await connection.createChannel();
      this.channel = channel;

      // Set up global prefetch (fair dispatch)
      await channel.prefetch(1);

      // Declare exchanges and queues
      await this.declareInfrastructure();

      this.connected = true;
      this.logger.log('✓ Connected to RabbitMQ');
    } catch (error) {
      this.connected = false;
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  isConnected() {
    return this.connected;
  }

  /**
   * Declare all exchanges, queues, and bindings
   */
  private async declareInfrastructure(): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    // Declare main topic exchange
    await this.channel.assertExchange(EXCHANGES.EVENTS, 'topic', {
      durable: true,
    });

    // Declare Dead Letter Exchange (DLX)
    await this.channel.assertExchange('unihub.dlx', 'direct', {
      durable: true,
    });

    // Declare queues with DLX binding
    const queueOptions = {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'unihub.dlx',
        'x-dead-letter-routing-key': QUEUES.DLQ,
      },
    };

    // Notification queue
    await this.channel.assertQueue(QUEUES.NOTIFICATION, queueOptions);
    await this.channel.bindQueue(
      QUEUES.NOTIFICATION,
      EXCHANGES.EVENTS,
      'notification.*',
    );

    // CSV sync queue
    await this.channel.assertQueue(QUEUES.CSV_SYNC, queueOptions);
    await this.channel.bindQueue(
      QUEUES.CSV_SYNC,
      EXCHANGES.EVENTS,
      'csv-sync.*',
    );

    // AI summary queue
    await this.channel.assertQueue(QUEUES.AI_SUMMARY, queueOptions);
    await this.channel.bindQueue(
      QUEUES.AI_SUMMARY,
      EXCHANGES.EVENTS,
      'ai-summary.*',
    );

    // Dead Letter Queue
    await this.channel.assertQueue(QUEUES.DLQ, { durable: true });
    await this.channel.bindQueue(QUEUES.DLQ, 'unihub.dlx', QUEUES.DLQ);

    this.logger.debug('✓ RabbitMQ infrastructure declared');
  }

  /**
   * Publish a message to the event exchange
   */
  publish(
    routingKey: string,
    message: Record<string, unknown>,
    options: Partial<Options.Publish> = {},
  ): boolean {
    if (!this.channel) {
      this.logger.error('Channel not available for publishing');
      return false;
    }

    try {
      const correlationId =
        typeof message.correlationId === 'string'
          ? message.correlationId
          : this.generateCorrelationId();
      const messageBuffer = Buffer.from(JSON.stringify(message));
      const publishOptions: Options.Publish = {
        contentType: 'application/json',
        contentEncoding: 'utf-8',
        persistent: true,
        timestamp: Date.now(),
        headers: {
          'x-correlation-id': correlationId,
          'x-retry-count': 0,
        },
        ...options,
      };

      return this.channel.publish(
        EXCHANGES.EVENTS,
        routingKey,
        messageBuffer,
        publishOptions,
      );
    } catch (error) {
      this.logger.error(`Failed to publish message to ${routingKey}:`, error);
      throw error;
    }
  }

  /**
   * Get the channel instance for advanced operations
   */
  getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    return this.channel;
  }

  /**
   * Graceful shutdown
   */
  async onModuleDestroy(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.connected = false;
    this.logger.log('Disconnected from RabbitMQ');
  }

  /**
   * Generate correlation ID for tracing
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}
