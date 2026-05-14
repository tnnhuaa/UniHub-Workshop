import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module.js';
import { RedisModule } from './libs/redis/index.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { RabbitMqModule } from './modules/rabbitmq/index.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { WorkshopModule } from './modules/workshop/workshop.module.js';
import { RegistrationModule } from './modules/registration/registration.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { CheckinModule } from './modules/checkin/checkin.module.js';
import { StudentModule } from './modules/student/student.module.js';
import { NotificationModule } from './modules/notification/notification.module.js';
import { CsvSyncModule } from './modules/csv-sync/csv-sync.module.js';
import { DocumentModule } from './modules/document/document.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    // Infrastructure
    AppConfigModule,
    ScheduleModule.forRoot(),
    RedisModule,
    PrismaModule,
    RabbitMqModule,
    HealthModule,

    // Auth & cross-cutting (global)
    AuthModule,
    AuditModule,

    // Domain modules
    WorkshopModule,
    RegistrationModule,
    PaymentModule,
    CheckinModule,
    StudentModule,
    NotificationModule,
    CsvSyncModule,
    DocumentModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
