import { z } from 'zod';

export const generateReportSchema = z.object({
  projectId: z.string().uuid(),
  boqId: z.string().uuid().optional(),
  type: z.enum([
    'executive_summary',
    'labour_cost_summary',
    'material_quantity_cost_summary',
    'material_quantity_summary',
    'construction_stage_summary',
    'detailed_boq',
    'plain_language_explanation',
    'ai_disclaimer',
  ]),
  format: z.enum(['pdf', 'excel']).optional().default('pdf'),
});
