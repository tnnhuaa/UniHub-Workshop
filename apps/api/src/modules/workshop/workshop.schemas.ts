import { z } from 'zod/v4';

export const workshopIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const workshopListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  speaker: z.string().trim().min(1).optional(),
  room: z.string().trim().min(1).optional(),
  startFrom: z.coerce.date().optional(),
  startTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

const baseWorkshopSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  speaker: z.string().trim().optional(),
  room: z.string().trim().optional(),
  capacity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  floorMapUrl: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
});

export const createWorkshopSchema = baseWorkshopSchema.refine(
  (data) => data.endTime.getTime() > data.startTime.getTime(),
  {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  },
);

export const updateWorkshopSchema = baseWorkshopSchema.partial();

export type WorkshopIdParam = z.infer<typeof workshopIdParamSchema>;
export type WorkshopListQuery = z.infer<typeof workshopListQuerySchema>;
export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;
