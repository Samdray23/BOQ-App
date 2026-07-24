export interface Project {
  id: string;
  user_id: string;
  name: string;
  client: string | null;
  type: string;
  location: string | null;
  currency: string;
  description: string | null;
  status: string;
  building_type: string | null;
  num_floors: number;
  total_area: number | null;
  start_date: string | null;
  completion_date: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  client?: string;
  type?: string;
  location?: string;
  currency?: string;
  description?: string;
  building_type?: string;
  num_floors?: number;
  total_area?: number;
  start_date?: string;
  completion_date?: string;
}
