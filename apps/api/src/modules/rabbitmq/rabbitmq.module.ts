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
        await service.connect();
        return service;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RabbitMqService],
})
export class RabbitMqModule {}
