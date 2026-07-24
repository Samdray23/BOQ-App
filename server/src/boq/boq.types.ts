export interface Boq {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  version: number;
  status: string;
  currency: string;
  total_estimated_cost: number;
  material_cost_total: number;
  labour_cost_total: number;
  equipment_cost_total: number;
  contingencies: number;
  profit_margin: number;
  grand_total: number;
  ai_provider: string | null;
  ai_model: string | null;
  confidence_score: number | null;
  plain_language_summary: string | null;
  ai_disclaimer: string | null;
  drawing_id: string | null;
  job_id: string | null;
  metadata: Record<string, any>;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoqSection {
  id: string;
  boq_id: string;
  stage_id: string;
  section_code: string;
  section_name: string;
  display_order: number;
  subtotal: number;
  plain_language_summary: string | null;
  is_estimated: boolean;
  created_at: string;
}

export interface BoqItem {
  id: string;
  boq_id: string;
  section_id: string;
  stage_id: string;
  item_code: string;
  description: string;
  unit: string;
  quantity: number;
  unit_rate: number;
  amount: number;
  material_cost: number;
  labour_cost: number;
  equipment_cost: number;
  wastage_factor: number;
  is_provisional: boolean;
  confidence_score: number | null;
  plain_language_note: string | null;
  metadata: Record<string, any>;
  display_order: number;
  created_at: string;
}
