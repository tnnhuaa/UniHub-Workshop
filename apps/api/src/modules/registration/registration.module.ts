import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PaymentModule } from '../payment/payment.module.js';
import {
  IdempotencyMiddleware,
  IdempotencyModule,
} from '../../libs/idempotency/index.js';
import { RegistrationController } from './registration.controller.js';
import { RegistrationService } from './registration.service.js';
import { SeatAllocator } from './seat-allocator.js';
import { RegistrationCleanupService } from './registration.cleanup.js';

@Module({
  imports: [AuthModule, PaymentModule, IdempotencyModule],
  controllers: [RegistrationController],
  providers: [RegistrationService, SeatAllocator, RegistrationCleanupService],
  exports: [RegistrationService],
})
export class RegistrationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdempotencyMiddleware).forRoutes({
      path: 'registrations',
      method: RequestMethod.POST,
    });
  }
}
