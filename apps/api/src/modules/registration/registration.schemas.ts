import { z } from 'zod/v4';

export const registrationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const registrationListQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'expired']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const createRegistrationSchema = z.object({
  mssv: z.string().trim().min(1),
  workshopId: z.string().uuid(),
});

export type RegistrationIdParam = z.infer<typeof registrationIdParamSchema>;
export type RegistrationListQuery = z.infer<typeof registrationListQuerySchema>;
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
