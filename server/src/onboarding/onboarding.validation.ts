import { z } from 'zod';

export const updateOnboardingSchema = z.object({
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
  role: z.string().max(50).optional(),
  companyName: z.string().max(255).optional(),
  companySize: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  experienceLevel: z.string().max(50).optional(),
  estimationStandards: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  aiMode: z.string().max(100).optional(),
  completed: z.boolean().optional(),
});
