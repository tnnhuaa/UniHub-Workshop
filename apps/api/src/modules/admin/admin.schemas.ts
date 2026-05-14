import { z } from 'zod/v4';

export const adminDashboardQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
});

export type AdminDashboardQuery = z.infer<typeof adminDashboardQuerySchema>;