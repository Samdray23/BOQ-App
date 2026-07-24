export interface Export {
  id: string;
  user_id: string;
  project_id: string | null;
  boq_id: string | null;
  type: string;
  format: string;
  status: string;
  storage_key: string | null;
  file_size: number | null;
  metadata: Record<string, any>;
  job_id: string | null;
  completed_at: string | null;
  created_at: string;
}

export type ExportType = 'boq' | 'report' | 'material_schedule' | 'cost_estimate';
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'word';
