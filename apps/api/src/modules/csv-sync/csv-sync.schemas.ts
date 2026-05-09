import { z } from 'zod/v4';

export const csvSyncBatchIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const csvSyncCreateBatchSchema = z.object({
  sourceFile: z.string().trim().min(1),
});

export type CsvSyncBatchIdParam = z.infer<typeof csvSyncBatchIdParamSchema>;
export type CsvSyncCreateBatchInput = z.infer<typeof csvSyncCreateBatchSchema>;
