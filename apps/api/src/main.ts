import { Logger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './shared/errors/index.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const corsOrigins = Array.from(
    new Set(
      (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  );

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      // Document uploads are currently sent as JSON with base64 content,
      // so the HTTP body needs headroom beyond the raw PDF size.
      bodyLimit: 20 * 1024 * 1024,
    }),
    { rawBody: true },
  );

  await app.register(multipart as never, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });

  app.useGlobalFilters(new HttpExceptionFilter(app.get(HttpAdapterHost)));

  const port = Number(process.env.PORT ?? 4001);
  await app.listen({ port, host: '0.0.0.0' });

  logger.log(`Application running on ${await app.getUrl()}`);
}
void bootstrap();
