export type ReportType =
  | 'executive_summary'
  | 'labour_cost_summary'
  | 'material_quantity_cost_summary'
  | 'material_quantity_summary'
  | 'construction_stage_summary'
  | 'detailed_boq'
  | 'plain_language_explanation'
  | 'ai_disclaimer';

export type ReportFormat = 'pdf' | 'excel';

export interface Report {
  id: string;
  project_id: string;
  boq_id: string | null;
  user_id: string;
  title: string;
  type: string;
  format: string;
  status: string;
  storage_key: string | null;
  file_size: number | null;
  metadata: Record<string, any>;
  job_id: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}
