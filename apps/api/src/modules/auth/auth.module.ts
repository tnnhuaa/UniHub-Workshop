import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import { createBetterAuthInstance } from './auth.instance.js';
import { BETTER_AUTH_INSTANCE } from './auth.constants.js';
import type { Env } from '../../config/env.schema.js';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * AuthModule — BetterAuth integration placeholder.
 * Will provide hybrid session/JWT auth flow.
 *
 * @see blueprint/specs/auth.md
 */
@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: BETTER_AUTH_INSTANCE,
      useFactory: (prisma: PrismaService, config: ConfigService<Env, true>) => {
        const env: Env = {
          NODE_ENV: config.getOrThrow('NODE_ENV'),
          PORT: config.getOrThrow('PORT'),
          CORS_ORIGIN: config.getOrThrow('CORS_ORIGIN'),
          DATABASE_URL: config.getOrThrow('DATABASE_URL'),
          DIRECT_URL: config.getOrThrow('DIRECT_URL'),
          REDIS_URL: config.getOrThrow('REDIS_URL'),
          RABBITMQ_URL: config.get('RABBITMQ_URL') || 'amqp://localhost:5672',
          BETTER_AUTH_SECRET: config.getOrThrow('BETTER_AUTH_SECRET'),
          BETTER_AUTH_URL: config.getOrThrow('BETTER_AUTH_URL'),
          BETTER_AUTH_JWT_ISSUER: config.getOrThrow('BETTER_AUTH_JWT_ISSUER'),
          BETTER_AUTH_JWT_AUDIENCE: config.getOrThrow(
            'BETTER_AUTH_JWT_AUDIENCE',
          ),
          BETTER_AUTH_JWT_TTL: config.getOrThrow('BETTER_AUTH_JWT_TTL'),
          BETTER_AUTH_SESSION_TTL: config.getOrThrow('BETTER_AUTH_SESSION_TTL'),
          GOOGLE_OAUTH_CLIENT_ID: config.getOrThrow('GOOGLE_OAUTH_CLIENT_ID'),
          GOOGLE_OAUTH_CLIENT_SECRET: config.getOrThrow(
            'GOOGLE_OAUTH_CLIENT_SECRET',
          ),
          GOOGLE_OAUTH_REDIRECT_URI: config.get('GOOGLE_OAUTH_REDIRECT_URI'),
          GEMINI_API_KEY: config.get('GEMINI_API_KEY') || '',
          CSV_DROP_LOCATION: config.get('CSV_DROP_LOCATION') || '/tmp/csv-drop',
          CSV_SYNC_TIMEZONE: config.get('CSV_SYNC_TIMEZONE') || 'UTC',
          DOCUMENT_STORAGE_PATH:
            config.get('DOCUMENT_STORAGE_PATH') || '/tmp/unihub-documents',
        };

        return createBetterAuthInstance(prisma, env);
      },
      inject: [PrismaService, ConfigService],
    },
    AuthService,
    AuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, AuthGuard, RolesGuard],
})
export class AuthModule {}
