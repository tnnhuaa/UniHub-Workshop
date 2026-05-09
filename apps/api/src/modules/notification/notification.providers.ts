import { Injectable } from '@nestjs/common';
import type { NotificationChannel } from '@prisma/client';

export type NotificationSendPayload = {
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  templateCode: string;
};

export type NotificationSendResult = {
  status: 'sent' | 'failed';
};

export interface NotificationProvider {
  channel: NotificationChannel;
  send(payload: NotificationSendPayload): Promise<NotificationSendResult>;
}

@Injectable()
export class EmailNotificationProvider implements NotificationProvider {
  channel: NotificationChannel = 'email';

  send(payload: NotificationSendPayload): Promise<NotificationSendResult> {
    void payload;
    return Promise.resolve({ status: 'sent' });
  }
}
