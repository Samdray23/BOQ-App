export interface Drawing {
  id: string;
  project_id: string;
  user_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string;
  storage_provider: string;
  version: number;
  drawing_type: string | null;
  page_count: number | null;
  status: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DrawingVersion {
  id: string;
  drawing_id: string;
  version: number;
  filename: string;
  storage_key: string;
  size_bytes: number;
  created_by: string;
  change_notes: string | null;
  created_at: string;
}

export type DrawingStatus = 'uploaded' | 'processing' | 'analysed' | 'failed';
