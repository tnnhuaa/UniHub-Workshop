import { z } from 'zod/v4';

export const documentWorkshopParamSchema = z.object({
  workshopId: z.string().uuid(),
});

export const documentSummaryParamSchema = z.object({
  workshopId: z.string().uuid(),
  documentId: z.string().uuid(),
});

export const documentUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1)
    .regex(/\.pdf$/i, 'fileName must end with .pdf'),
  contentBase64: z.string().trim().min(1),
  contentType: z.literal('application/pdf').optional(),
});

export type DocumentWorkshopParam = z.infer<typeof documentWorkshopParamSchema>;
export type DocumentSummaryParam = z.infer<typeof documentSummaryParamSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
