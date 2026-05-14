import { z } from 'zod/v4';

export const csvSyncBatchIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const csvSyncCreateBatchSchema = z.object({
  sourceFile: z.string().trim().min(1),
});

export const csvSyncListQuerySchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export type CsvSyncBatchIdParam = z.infer<typeof csvSyncBatchIdParamSchema>;
export type CsvSyncCreateBatchInput = z.infer<typeof csvSyncCreateBatchSchema>;
export type CsvSyncListQuery = z.infer<typeof csvSyncListQuerySchema>;
