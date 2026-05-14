import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMqService } from './rabbitmq.service.js';
import type { Env } from '../../config/env.schema.js';

@Global()
@Module({
  providers: [
    {
      provide: RabbitMqService,
      useFactory: async (configService: ConfigService<Env>) => {
        const rabbitmqUrl = configService.get('RABBITMQ_URL', {
          infer: true,
        });
        const service = new RabbitMqService(rabbitmqUrl);

        try {
          await service.connect();
        } catch {
          // Fail-soft in local/dev so the API can still serve HTTP requests
          // when RabbitMQ is not running.
        }

        return service;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RabbitMqService],
})
export class RabbitMqModule {}
