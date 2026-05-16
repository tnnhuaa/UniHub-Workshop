import { z } from 'zod/v4';

export const adminDashboardQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export type AdminDashboardQuery = z.infer<typeof adminDashboardQuerySchema>;
