import { z } from 'zod/v4';

export const notificationSendSchema = z.object({
  userId: z.string().trim().min(1),
  channel: z.enum(['email', 'in_app', 'telegram']),
  templateCode: z.string().trim().min(1),
  dedupeKey: z.string().trim().min(1).optional(),
});

export const notificationListQuerySchema = z.object({
  channel: z.enum(['email', 'in_app', 'telegram']).optional(),
  status: z.enum(['pending', 'sent', 'failed']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type NotificationSendInput = z.infer<typeof notificationSendSchema>;
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
