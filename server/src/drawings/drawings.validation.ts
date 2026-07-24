import { z } from 'zod';

export const createDrawingSchema = z.object({
  projectId: z.string().uuid(),
  drawingType: z.string().optional(),
});

export const updateDrawingSchema = z.object({
  drawingType: z.string().optional(),
  status: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});
