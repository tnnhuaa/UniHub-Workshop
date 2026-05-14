import { Injectable } from '@nestjs/common';
import type { NotificationChannel } from '@prisma/client';
import { createTransport } from 'nodemailer';
import type { SentMessageInfo, Transporter } from 'nodemailer';
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

  async send(
    payload: NotificationProviderPayload,
  ): Promise<NotificationProviderResult> {
    if (!payload.recipient.email) {
      return {
        status: 'failed',
        errorMessage: 'Recipient email is missing',
      };
    }

    const smtpConfig = this.getSmtpConfig();
    if (!smtpConfig) {
      return {
        status: 'failed',
        errorMessage: 'SMTP configuration is missing',
      };
    }

    const transporter: Transporter = createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    const sendMail = transporter.sendMail.bind(transporter) as (
      mail: Parameters<Transporter['sendMail']>[0],
    ) => Promise<SentMessageInfo>;
    const infoUnknown: unknown = await sendMail({
      from: {
        name: smtpConfig.fromName,
        address: smtpConfig.fromEmail,
      },
      to: payload.recipient.email,
      subject: payload.notification.title,
      text: payload.notification.body,
      html: this.buildHtml(payload),
    });

    return {
      status: 'sent',
      providerRef: this.readMessageId(infoUnknown),
    };
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

  private readMessageId(value: unknown) {
    if (
      value &&
      typeof value === 'object' &&
      'messageId' in value &&
      typeof value.messageId === 'string'
    ) {
      return value.messageId;
    }

    return undefined;
  }

  private getSmtpConfig() {
    const host = process.env.SMTP_HOST?.trim();
    const portRaw = process.env.SMTP_PORT?.trim();
    const secureRaw = process.env.SMTP_SECURE?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    const fromName = process.env.SMTP_FROM_NAME?.trim();
    const fromEmail = process.env.SMTP_FROM_EMAIL?.trim();
    const port = portRaw ? Number(portRaw) : null;
    const secure =
      secureRaw === 'true' ? true : secureRaw === 'false' ? false : undefined;

    if (
      !host ||
      !port ||
      secure === undefined ||
      !user ||
      !pass ||
      !fromName ||
      !fromEmail
    ) {
      return null;
    }

    return {
      host,
      port,
      secure,
      user,
      pass,
      fromName,
      fromEmail,
    };
  }
}
