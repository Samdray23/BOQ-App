import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  client: z.string().max(255).optional(),
  type: z
    .enum(['residential', 'commercial', 'mixed_use', 'infrastructure', 'other'])
    .optional()
    .default('residential'),
  location: z.string().max(255).optional(),
  currency: z.string().length(3).optional().default('NGN'),
  description: z.string().optional(),
  building_type: z.string().max(100).optional(),
  num_floors: z.number().int().min(1).optional().default(1),
  total_area: z.number().positive().optional(),
  start_date: z.string().optional(),
  completion_date: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();
