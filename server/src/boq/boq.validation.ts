import { z } from 'zod';

export const generateBoqSchema = z.object({
  projectId: z.string().uuid(),
  drawingId: z.string().uuid().optional(),
  title: z.string().max(255).optional(),
});

export const updateBoqItemSchema = z.object({
  description: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().positive().optional(),
  unitRate: z.number().positive().optional(),
  isProvisional: z.boolean().optional(),
});
