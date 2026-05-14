import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  use(request: FastifyRequest, _response: FastifyReply, next: () => void) {
    if (request.method.toUpperCase() !== 'POST') {
      next();
      return;
    }

    const rawKey = request.headers['idempotency-key'];
    const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;

    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      throw new BadRequestException({
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required',
      });
    }

    (request as { idempotencyKey?: string }).idempotencyKey = key;
    next();
  }
}
