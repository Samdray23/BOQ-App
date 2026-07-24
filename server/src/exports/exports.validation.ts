import { z } from 'zod';

export const createExportSchema = z.object({
  projectId: z.string().uuid(),
  boqId: z.string().uuid().optional(),
  type: z.enum(['boq', 'report', 'material_schedule', 'cost_estimate']),
  format: z.enum(['pdf', 'excel']),
});
