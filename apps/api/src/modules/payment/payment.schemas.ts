import { z } from 'zod/v4';

export const paymentMockActionSchema = z.object({
  paymentId: z.string().uuid(),
  providerRef: z.string().trim().min(1).optional(),
});

export const paymentWebhookSchema = z.object({
  paymentId: z.string().uuid(),
  status: z.enum(['success', 'failure']),
  providerRef: z.string().trim().min(1).optional(),
});

export type PaymentMockActionInput = z.infer<typeof paymentMockActionSchema>;
export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
