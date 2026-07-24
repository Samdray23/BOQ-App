export interface Job {
  id: string;
  type: string;
  status: string;
  payload: Record<string, any>;
  result: Record<string, any>;
  error: string | null;
  progress: number;
  priority: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type JobType =
  | 'drawing-analysis'
  | 'ai-processing'
  | 'boq-generation'
  | 'report-generation'
  | 'export-generation'
  | 'email-notification';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobHandler {
  (payload: Record<string, any>): Promise<void>;
}
