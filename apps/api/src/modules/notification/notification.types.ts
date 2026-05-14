import type {
  NotificationChannel,
  NotificationDelivery,
  NotificationType,
} from '@prisma/client';

export type NotificationRenderable = {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export type NotificationWorkflowEvent = {
  type: 'workshop_registration_confirmed';
  registrationId: string;
};

export type NotificationProviderPayload = {
  channel: NotificationChannel;
  delivery: Pick<NotificationDelivery, 'id' | 'channel' | 'createdAt'>;
  notification: {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    createdAt: Date;
  };
  recipient: {
    userId: string;
    email: string | null;
    name: string | null;
  };
};

export type NotificationProviderResult = {
  status: 'sent' | 'failed';
  providerRef?: string;
  errorMessage?: string;
};

export interface NotificationProvider {
  channel: NotificationChannel;
  send(
    payload: NotificationProviderPayload,
  ): Promise<NotificationProviderResult>;
}
