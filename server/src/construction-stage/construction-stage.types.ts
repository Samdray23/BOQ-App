export interface ConstructionStage {
  id: string;
  code: string;
  name: string;
  display_order: number;
  description: string | null;
  created_at: string;
}

export interface StageSummary {
  stage: ConstructionStage;
  materialQuantities: Record<string, number>;
  labourCost: number;
  materialCost: number;
  stageTotal: number;
  plainLanguageSummary: string;
  itemCount: number;
}
