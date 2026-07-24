import { z } from 'zod';

export const initializePaymentSchema = z.object({
  plan: z.enum(['free', 'professional', 'enterprise']),
  interval: z.enum(['monthly', 'yearly']),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(1),
});
