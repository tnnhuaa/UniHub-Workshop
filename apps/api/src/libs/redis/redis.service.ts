import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type RedisClientType } from 'redis';
import type { Env } from '../../config/env.schema.js';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClientType;

  constructor(private readonly config: ConfigService<Env, true>) {
    const url = this.config.getOrThrow<Env['REDIS_URL']>('REDIS_URL');
    this.client = createClient({ url });
    this.client.on('error', (error) => {
      this.logger.error('Redis client error', error as Error);
    });
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async onModuleInit() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}
