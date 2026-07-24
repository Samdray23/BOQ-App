export interface Region {
  id: string;
  country: string;
  state: string | null;
  city: string;
  code: string;
  markup_percentage: number;
  is_active: boolean;
}

export interface RateCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface RateEntry {
  id: string;
  region_id: string;
  category_id: string;
  item_description: string;
  unit: string;
  rate: number;
  currency: string;
  effective_from: string;
  effective_to: string | null;
  source: string | null;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
