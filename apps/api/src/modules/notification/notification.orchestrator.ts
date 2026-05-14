import { Inject, Injectable } from '@nestjs/common';
import type { NotificationChannel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { NOTIFICATION_PROVIDERS } from './notification.constants.js';
import { NotificationTemplateRenderer } from './notification.templates.js';
import type {
  NotificationProvider,
  NotificationProviderPayload,
  NotificationType,
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
  ): Promise<null | {
    deliveries: Array<{
      id: string;
      channel: NotificationChannel;
      status: string;
    }>;
  }> {
    if (event.type !== 'workshop_registration_confirmed') {
      return null;
    }

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

    if (!registration?.student.betterAuthUserId || !registration.student.user) {
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
        registration.student.user.name ?? registration.student.fullName ?? null,
      channels: ['in_app', 'email'],
      renderable,
      dedupePrefix: `registration-confirmed:${registration.id}`,
    });
  }

  async sendManual(input: {
    userId: string;
    channel: NotificationChannel;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    type?: NotificationType;
    dedupeKey?: string;
  }) {
    const user = await this.prisma.betterAuthUser.findUniqueOrThrow({
      where: { id: input.userId },
      select: { id: true, email: true, name: true },
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
      dedupePrefix: input.dedupeKey,
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
    dedupePrefix?: string;
  }) {
    const deliveries: Array<{
      id: string;
      channel: NotificationChannel;
      status: string;
    }> = [];

    for (const channel of input.channels) {
      const dedupeKey = input.dedupePrefix
        ? `${input.dedupePrefix}:${channel}`
        : `notification:${input.userId}:${channel}:${Date.now()}`;

      deliveries.push(
        await this.sendToChannel(
          input.userId,
          channel,
          dedupeKey,
          input.renderable,
          {
            email: input.recipientEmail,
            name: input.recipientName,
          },
        ),
      );
    }

    return { deliveries };
  }

  private async sendToChannel(
    userId: string,
    channel: NotificationChannel,
    dedupeKey: string,
    renderable: {
      type: NotificationType;
      title: string;
      body: string;
      data?: Record<string, unknown>;
    },
    recipient: { email: string | null; name: string | null },
  ): Promise<{ id: string; channel: NotificationChannel; status: string }> {
    const existing = await this.prisma.notificationDelivery.findUnique({
      where: { dedupeKey },
    });
    if (existing) {
      return {
        id: existing.id,
        channel: existing.channel,
        status: existing.status,
      };
    }

    const delivery = await this.prisma.notificationDelivery.create({
      data: {
        userId,
        channel,
        templateCode: renderable.type,
        status: 'pending',
        dedupeKey,
      },
    });

    const provider = this.providers.find((entry) => entry.channel === channel);
    if (!provider) {
      const failed = await this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: { status: 'failed' },
      });
      return { id: failed.id, channel: failed.channel, status: failed.status };
    }

    const payload: NotificationProviderPayload = {
      channel,
      delivery: {
        id: delivery.id,
        channel: delivery.channel,
        createdAt: delivery.createdAt,
      },
      notification: {
        id: delivery.id,
        type: renderable.type,
        title: renderable.title,
        body: renderable.body,
        data: renderable.data ?? null,
        createdAt: delivery.createdAt,
      },
      recipient: {
        userId,
        email: recipient.email,
        name: recipient.name,
      },
    };

    try {
      const result = await provider.send(payload);
      const updated = await this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: result.status,
          sentAt: result.status === 'sent' ? new Date() : null,
        },
      });
      return {
        id: updated.id,
        channel: updated.channel,
        status: updated.status,
      };
    } catch {
      const failed = await this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: { status: 'failed' },
      });
      return { id: failed.id, channel: failed.channel, status: failed.status };
    }
  }
}
