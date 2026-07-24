export type UserRole =
  | 'quantity_surveyor'
  | 'architect'
  | 'engineer'
  | 'builder'
  | 'contractor'
  | 'developer'
  | 'student';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type EstimationStandard = 'nrm' | 'cesmm' | 'smm7' | 'local';

export type OnboardingGoal =
  | 'generate_boq'
  | 'cost_estimation'
  | 'material_takeoff'
  | 'project_cost_tracking'
  | 'tender_preparation'
  | 'rate_analysis';

export type AiAssistantMode =
  | 'estimation_assistant'
  | 'boq_assistant'
  | 'measurement_assistant'
  | 'full_copilot';

export interface OnboardingData {
  firstName: string;
  lastName: string;
  role: UserRole;
  companyName: string;
  companySize: string;
  country: string;
  region: string;
  experienceLevel: ExperienceLevel;
  estimationStandards: EstimationStandard[];
  goals: OnboardingGoal[];
  aiMode: AiAssistantMode;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  onboarding?: OnboardingData;
  createdAt?: string;
}

export type ProjectStatus = 'draft' | 'processing' | 'complete' | 'error' | 'archived';
export type ProjectType = 'residential' | 'commercial' | 'mixed_use' | 'infrastructure' | 'other';

export interface Project {
  id: string;
  name: string;
  client: string;
  type: ProjectType;
  location: string;
  currency: string;
  status: ProjectStatus;
  startDate: string;
  completionDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type BoqStatus = 'generating' | 'complete' | 'failed' | 'regenerating';

export interface BoqSection {
  id: string;
  sectionCode: string;
  sectionName: string;
  displayOrder: number;
  subtotal: number;
  isEstimated: boolean;
}

export interface BoqItem {
  id: string;
  sectionId: string;
  itemCode: string;
  description: string;
  plainLanguageNote: string;
  unit: string;
  quantity: number;
  unitRate: number;
  amount: number;
  isProvisional: boolean;
  confidenceScore: number;
}

export interface Boq {
  id: string;
  projectId: string;
  title: string;
  version: number;
  status: BoqStatus;
  totalEstimatedCost: number;
  currency: string;
  sections: BoqSection[];
  items: BoqItem[];
  generatedAt?: string;
}

export interface CostEstimate {
  labourCost: number;
  materialCost: number;
  equipmentCost: number;
  overheads: number;
  profitMargin: number;
  contingencies: number;
  total: number;
}

export interface MaterialItem {
  id: string;
  materialType: string;
  description: string;
  unit: string;
  estimatedQuantity: number;
  wastageFactor: number;
  adjustedQuantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface MaterialSchedule {
  id: string;
  projectId: string;
  title: string;
  items: MaterialItem[];
  generatedAt?: string;
}

export interface RateEntry {
  id: string;
  itemDescription: string;
  unit: string;
  rate: number;
  category: string;
  region: string;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AiSuggestion {
  prompt: string;
  icon: string;
  category: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'professional' | 'enterprise';
  displayName: string;
  priceMonthly: number;
  priceYearly: number;
  projectsPerMonth: number | null;
  maxProjects: number | null;
  features: string[];
  canExport: boolean;
  canExportExcel: boolean;
  canExportCleanPdf: boolean;
  watermarkPdf: boolean;
  hasMaterialSchedules: boolean;
  hasRegionalPricing: boolean;
  hasTeamCollaboration: boolean;
  hasApiAccess: boolean;
  hasCustomRateLibraries: boolean;
  hasPriorityProcessing: boolean;
  targetAudience: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface DashboardKpi {
  label: string;
  value: number;
  change: number;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
}

export const BOQ_SECTIONS = [
  { code: 'A', name: 'Preliminaries' },
  { code: 'B', name: 'Site Works' },
  { code: 'C', name: 'Substructure' },
  { code: 'D', name: 'Blockwork' },
  { code: 'E', name: 'Roofing' },
  { code: 'F', name: 'Doors' },
  { code: 'G', name: 'Windows' },
  { code: 'H', name: 'Floor Finishes' },
  { code: 'I', name: 'Wall Finishes' },
  { code: 'J', name: 'Ceiling Finishes' },
  { code: 'K', name: 'Painting' },
  { code: 'L', name: 'External Works' },
] as const;

export const MATERIAL_TYPES = [
  'cement',
  'blocks',
  'sand',
  'granite',
  'reinforcement',
  'paint',
  'tiles',
  'roofing_sheets',
  'roofing_accessories',
] as const;

export const REGIONS = ['Lagos', 'Ibadan', 'Abuja', 'Port Harcourt', 'Kano'] as const;
