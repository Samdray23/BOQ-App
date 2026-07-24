export interface OnboardingData {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  company_size: string | null;
  country: string | null;
  region: string | null;
  experience_level: string | null;
  estimation_standards: string[];
  goals: string[];
  ai_mode: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateOnboardingInput {
  firstName?: string;
  lastName?: string;
  role?: string;
  companyName?: string;
  companySize?: string;
  country?: string;
  region?: string;
  experienceLevel?: string;
  estimationStandards?: string[];
  goals?: string[];
  aiMode?: string;
  completed?: boolean;
}

export interface OnboardingResponse {
  completed: boolean;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  companyName: string | null;
  companySize: string | null;
  country: string | null;
  region: string | null;
  experienceLevel: string | null;
  estimationStandards: string[];
  goals: string[];
  aiMode: string | null;
}
