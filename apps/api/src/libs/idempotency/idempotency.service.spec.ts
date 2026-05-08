import { IdempotencyService } from './idempotency.service.js';

type FakeRedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { EX?: number }) => Promise<void>;
};

describe('IdempotencyService', () => {
  it('stores and retrieves cached responses', async () => {
    const store = new Map<string, string>();
    const client: FakeRedisClient = {
      get: (key) => Promise.resolve(store.get(key) ?? null),
      set: (key, value) => {
        store.set(key, value);
        return Promise.resolve();
      },
    };

    const redisService = {
      getClient: () => client,
    };

    const service = new IdempotencyService(redisService as never);
    await service.storeResponse('abc', { ok: true });

    const response = await service.getResponse<{ ok: boolean }>('abc');
    expect(response).toEqual({ ok: true });
  });

  it('returns null for missing keys', async () => {
    const client: FakeRedisClient = {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve(),
    };

    const redisService = {
      getClient: () => client,
    };

    const service = new IdempotencyService(redisService as never);
    const response = await service.getResponse('missing');
    expect(response).toBeNull();
  });
});
