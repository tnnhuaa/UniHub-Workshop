import { z } from 'zod/v4';

export const notificationSendSchema = z.object({
  userId: z.string().trim().min(1),
  channel: z.enum(['email', 'in_app', 'telegram']),
  type: z.enum(['custom', 'workshop_registration_confirmed']).optional(),
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const notificationListQuerySchema = z.object({
  readStatus: z.enum(['unread', 'read', 'all']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type NotificationSendInput = z.infer<typeof notificationSendSchema>;
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
