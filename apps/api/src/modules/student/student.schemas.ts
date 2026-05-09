import { z } from 'zod/v4';

export const studentMssvParamSchema = z.object({
  mssv: z.string().trim().min(1),
});

export const studentListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  faculty: z.string().trim().min(1).optional(),
  className: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type StudentMssvParam = z.infer<typeof studentMssvParamSchema>;
export type StudentListQuery = z.infer<typeof studentListQuerySchema>;
