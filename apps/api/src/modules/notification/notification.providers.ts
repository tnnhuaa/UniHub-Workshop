import { Injectable } from '@nestjs/common';
import type { NotificationChannel } from '@prisma/client';
import type {
  NotificationProvider,
  NotificationProviderPayload,
  NotificationProviderResult,
} from './notification.types.js';

@Injectable()
export class InAppNotificationProvider implements NotificationProvider {
  channel: NotificationChannel = 'in_app';

  send(): Promise<NotificationProviderResult> {
    return Promise.resolve({ status: 'sent' });
  }
}

@Injectable()
export class EmailNotificationProvider implements NotificationProvider {
  channel: NotificationChannel = 'email';

  send(
    payload: NotificationProviderPayload,
  ): Promise<NotificationProviderResult> {
    if (!payload.recipient.email) {
      return Promise.resolve({
        status: 'failed',
        errorMessage: 'Recipient email is missing',
      });
    }

    const hasSender =
      Boolean(process.env.SMTP_FROM_NAME?.trim()) &&
      Boolean(process.env.SMTP_FROM_EMAIL?.trim());
    if (!hasSender) {
      return Promise.resolve({
        status: 'failed',
        errorMessage: 'SMTP sender configuration is missing',
      });
    }

    this.buildHtml(payload);
    return Promise.resolve({ status: 'sent' });
  }

  private buildHtml(payload: NotificationProviderPayload) {
    const lines = [
      `<p>${payload.notification.body}</p>`,
      payload.notification.type === 'workshop_registration_confirmed'
        ? this.renderWorkshopDetails(payload.notification.data)
        : '',
    ];

    return lines.filter(Boolean).join('');
  }

  private renderWorkshopDetails(data: Record<string, unknown> | null) {
    if (!data) {
      return '';
    }

    const workshopTitle = this.readString(data.workshopTitle);
    const startTime = this.readString(data.startTime);
    const endTime = this.readString(data.endTime);
    const room = this.readNullableString(data.room);
    const qrCode = this.readNullableString(data.qrCode);

    return [
      '<ul>',
      workshopTitle
        ? `<li><strong>Workshop:</strong> ${workshopTitle}</li>`
        : '',
      startTime ? `<li><strong>Start:</strong> ${startTime}</li>` : '',
      endTime ? `<li><strong>End:</strong> ${endTime}</li>` : '',
      room ? `<li><strong>Room:</strong> ${room}</li>` : '',
      qrCode ? `<li><strong>QR code:</strong> ${qrCode}</li>` : '',
      '</ul>',
    ]
      .filter(Boolean)
      .join('');
  }

  private readString(value: unknown) {
    return typeof value === 'string' ? value : '';
  }

  private readNullableString(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }
}
