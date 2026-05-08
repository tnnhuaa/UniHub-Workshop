import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema.js';
import * as path from 'node:path';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        '..',
        '.env',
      ),
      validate: (config: Record<string, unknown>) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          throw new Error(
            `Environment validation failed:\n${JSON.stringify(result.error.issues, null, 2)}`,
          );
        }
        return result.data;
      },
    }),
  ],
})
export class AppConfigModule {}
