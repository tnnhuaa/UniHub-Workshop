import { Inject, Injectable } from '@nestjs/common';
import type {
  Prisma,
  Notification as NotificationModel,
  NotificationChannel,
  NotificationType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { NOTIFICATION_PROVIDERS } from './notification.constants.js';
import { NotificationTemplateRenderer } from './notification.templates.js';
import type {
  NotificationProvider,
  NotificationProviderPayload,
  NotificationWorkflowEvent,
} from './notification.types.js';

@Injectable()
export class NotificationOrchestrator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly renderer: NotificationTemplateRenderer,
    @Inject(NOTIFICATION_PROVIDERS)
    private readonly providers: NotificationProvider[],
  ) {}

  async dispatchWorkshopRegistrationConfirmed(
    event: NotificationWorkflowEvent,
  ) {
    if (event.type !== 'workshop_registration_confirmed') {
      return null;
    }

    try {
      const registration = await this.prisma.registration.findUnique({
        where: { id: event.registrationId },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          workshop: true,
        },
      });

      if (
        !registration?.student.betterAuthUserId ||
        !registration.student.user
      ) {
        return null;
      }

      const renderable = this.renderer.renderWorkshopRegistrationConfirmed({
        registrationId: registration.id,
        workshopId: registration.workshopId,
        workshopTitle: registration.workshop.title,
        startTime: registration.workshop.startTime.toISOString(),
        endTime: registration.workshop.endTime.toISOString(),
        room: registration.workshop.room ?? null,
        qrCode: registration.qrCode ?? null,
      });

      return this.deliverNotification({
        userId: registration.student.betterAuthUserId,
        recipientEmail:
          registration.student.user.email ?? registration.student.email ?? null,
        recipientName:
          registration.student.user.name ??
          registration.student.fullName ??
          null,
        eventKey: `registration-confirmed:${registration.id}`,
        channels: ['in_app', 'email'],
        renderable,
      });
    } catch {
      return null;
    }
  }

  async sendManual(input: {
    userId: string;
    channel: NotificationChannel;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    type?: NotificationType;
  }) {
    const user = await this.prisma.betterAuthUser.findUniqueOrThrow({
      where: { id: input.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const renderable = this.renderer.renderManual({
      title: input.title,
      body: input.body,
      data: input.data,
      type: input.type,
    });

    return this.deliverNotification({
      userId: user.id,
      recipientEmail: user.email,
      recipientName: user.name ?? null,
      channels: [input.channel],
      renderable,
    });
  }

  private async deliverNotification(input: {
    userId: string;
    recipientEmail: string | null;
    recipientName: string | null;
    renderable: {
      type: NotificationType;
      title: string;
      body: string;
      data?: Record<string, unknown>;
    };
    channels: NotificationChannel[];
    eventKey?: string;
  }) {
    const notification = await this.findOrCreateNotification({
      userId: input.userId,
      type: input.renderable.type,
      title: input.renderable.title,
      body: input.renderable.body,
      data: input.renderable.data,
      eventKey: input.eventKey,
    });

    const deliveries: Awaited<ReturnType<typeof this.sendToChannel>>[] = [];
    for (const channel of input.channels) {
      deliveries.push(
        await this.sendToChannel(notification, channel, {
          email: input.recipientEmail,
          name: input.recipientName,
        }),
      );
    }

    return {
      ...notification,
      deliveries,
    };
  }

  private async findOrCreateNotification(input: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    eventKey?: string;
  }) {
    if (input.eventKey) {
      const existing = await this.prisma.notification.findUnique({
        where: { eventKey: input.eventKey },
      });

      if (existing) {
        return existing;
      }
    }

    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data as Prisma.InputJsonValue | undefined,
        eventKey: input.eventKey,
      },
    });
  }

  private async sendToChannel(
    notification: NotificationModel,
    channel: NotificationChannel,
    recipient: { email: string | null; name: string | null },
  ) {
    const dedupeKey = `notification:${notification.id}:${channel}`;
    const existing = await this.prisma.notificationDelivery.findUnique({
      where: { dedupeKey },
    });

    if (existing) {
      return existing;
    }

    const delivery = await this.prisma.notificationDelivery.create({
      data: {
        notificationId: notification.id,
        channel,
        status: 'pending',
        dedupeKey,
      },
    });

    const provider = this.providers.find((entry) => entry.channel === channel);
    if (!provider) {
      return this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'failed',
          errorMessage: 'Notification channel is not supported yet',
        },
      });
    }

    const payload: NotificationProviderPayload = {
      channel,
      delivery,
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: (notification.data as Record<string, unknown> | null) ?? null,
        createdAt: notification.createdAt,
      },
      recipient: {
        userId: notification.userId,
        email: recipient.email,
        name: recipient.name,
      },
    };

    try {
      const result = await provider.send(payload);
      return this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: result.status,
          providerRef: result.providerRef,
          errorMessage: result.errorMessage,
          sentAt: result.status === 'sent' ? new Date() : null,
        },
      });
    } catch (error) {
      return this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'failed',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Notification delivery failed',
        },
      });
    }
  }
}
