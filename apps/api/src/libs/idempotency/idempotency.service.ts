import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';

const DEFAULT_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class IdempotencyService {
  constructor(private readonly redis: RedisService) {}

  async getResponse<T>(key: string): Promise<T | null> {
    const payload = await this.redis.getClient().get(this.buildKey(key));
    if (!payload) {
      return null;
    }
    return JSON.parse(payload) as T;
  }

  async storeResponse<T>(key: string, response: T): Promise<void> {
    const payload = JSON.stringify(response);
    await this.redis
      .getClient()
      .set(this.buildKey(key), payload, { EX: DEFAULT_TTL_SECONDS });
  }

  private buildKey(key: string) {
    return `idempotency:${key}`;
  }
}
