import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { NotificationController } from './notification.controller.js';
import { EmailNotificationProvider } from './notification.providers.js';
import { NOTIFICATION_PROVIDERS } from './notification.constants.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailNotificationProvider,
    {
      provide: NOTIFICATION_PROVIDERS,
      useFactory: (emailProvider: EmailNotificationProvider) => [emailProvider],
      inject: [EmailNotificationProvider],
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
