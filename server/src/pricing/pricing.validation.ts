import { z } from 'zod';

export const createRateSchema = z.object({
  regionCode: z.string().length(2),
  categoryName: z.enum(['materials', 'labour', 'equipment']),
  itemDescription: z.string().min(1).max(255),
  unit: z.string().min(1).max(50),
  rate: z.number().positive(),
  currency: z.string().length(3).optional().default('NGN'),
  source: z.string().optional(),
});

export const updateRateSchema = createRateSchema.partial();

export const createRegionSchema = z.object({
  country: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  code: z.string().length(2),
  markupPercentage: z.number().min(0).max(100).optional().default(0),
});
