import { Injectable } from '@nestjs/common';
import type {
  NotificationRenderable,
  NotificationType,
} from './notification.types.js';

type WorkshopRegistrationTemplateInput = {
  registrationId: string;
  workshopId: string;
  workshopTitle: string;
  startTime: string;
  endTime: string;
  room: string | null;
  qrCode: string | null;
};

@Injectable()
export class NotificationTemplateRenderer {
  renderWorkshopRegistrationConfirmed(
    input: WorkshopRegistrationTemplateInput,
  ): NotificationRenderable {
    return {
      type: 'workshop_registration_confirmed',
      title: 'Workshop registration confirmed',
      body: `Your registration for ${input.workshopTitle} is confirmed. You can open My Schedule to view the QR code and attendance details.`,
      data: input,
    };
  }

  renderManual(input: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    type?: NotificationType;
  }): NotificationRenderable {
    return {
      type: input.type ?? 'custom',
      title: input.title,
      body: input.body,
      data: input.data,
    };
  }
}
