export interface AiProviderConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionRequest {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AiCompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface DrawingAnalysisResult {
  drawingType: string;
  confidence: number;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    area?: number;
  };
  rooms?: Array<{ name: string; area: number; level: string }>;
  walls?: Array<{ type: string; length: number; height: number; thickness: string }>;
  openings?: Array<{ type: 'door' | 'window'; width: number; height: number; count: number }>;
  floors?: number;
  hasRoof?: boolean;
  estimatedAccuracy: number;
}

export interface BoqGenerationResult {
  sections: Array<{
    name: string;
    code: string;
    items: Array<{
      description: string;
      unit: string;
      quantity: number;
      rate: number;
      amount: number;
      isProvisional: boolean;
      confidenceScore: number;
      plainLanguageNote: string;
    }>;
    plainLanguageSummary: string;
  }>;
  totalEstimatedCost: number;
  confidenceScore: number;
  plainLanguageSummary: string;
  aiDisclaimer: string;
}

export type AiProvider = 'openai' | 'claude' | 'deepseek';
