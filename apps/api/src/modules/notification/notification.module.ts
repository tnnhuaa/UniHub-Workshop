import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { NotificationController } from './notification.controller.js';
import {
  EmailNotificationProvider,
  InAppNotificationProvider,
} from './notification.providers.js';
import { NOTIFICATION_PROVIDERS } from './notification.constants.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationOrchestrator } from './notification.orchestrator.js';
import { NotificationTemplateRenderer } from './notification.templates.js';

@Module({
  imports: [AuthModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationOrchestrator,
    NotificationTemplateRenderer,
    EmailNotificationProvider,
    InAppNotificationProvider,
    {
      provide: NOTIFICATION_PROVIDERS,
      useFactory: (
        emailProvider: EmailNotificationProvider,
        inAppProvider: InAppNotificationProvider,
      ) => [emailProvider, inAppProvider],
      inject: [EmailNotificationProvider, InAppNotificationProvider],
    },
  ],
  exports: [NotificationService, NotificationOrchestrator],
})
export class NotificationModule {}
