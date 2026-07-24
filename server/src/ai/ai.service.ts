import { env } from '../config/index.js';
import { projectsRepository } from '../projects/projects.repository.js';
import { OpenAIProvider } from './providers/openai.provider.js';
import { ClaudeProvider } from './providers/claude.provider.js';
import { DeepSeekProvider } from './providers/deepseek.provider.js';
import { NotFoundError } from '../shared/errors.js';
import type { IAiProvider } from './providers/interface.js';
import type {
  AiCompletionRequest,
  AiCompletionResponse,
  DrawingAnalysisResult,
  BoqGenerationResult,
  AiProvider,
} from './ai.types.js';

const providers = new Map<string, IAiProvider>();

function getProvider(name?: string): IAiProvider {
  const providerName = name || env.AI_PROVIDER;
  let provider = providers.get(providerName);

  if (!provider) {
    switch (providerName) {
      case 'claude':
        provider = new ClaudeProvider();
        break;
      case 'deepseek':
        provider = new DeepSeekProvider();
        break;
      case 'openai':
      default:
        provider = new OpenAIProvider();
        break;
    }
    providers.set(providerName, provider);
  }

  return provider;
}

const SYSTEM_PROMPTS = {
  drawingClassification: `You are an expert architectural drawing analyst for quantity surveying. Analyze the provided architectural drawing and extract key information including drawing type, dimensions, rooms, walls, and openings. Respond with JSON only.`,

  quantityExtraction: `You are an expert quantity surveyor specializing in construction cost estimation. Extract quantities from the provided architectural drawing data. Generate a complete Bill of Quantities organized by construction stages. Always respond with valid JSON following the BOQ structure. Include plain language explanations for non-technical users.`,

  plainLanguage: `You are a construction expert who explains complex construction terms in simple, plain language that anyone can understand. Avoid jargon. Explain what each item means, why it's needed, and what it does in the construction process.`,

  boqGeneration: `You are an expert quantity surveyor. Generate a detailed Bill of Quantities based on the provided project data and drawing analysis. Structure the BOQ according to standard construction stages. Include accurate measurements, rates, and cost calculations. Always include a clear AI disclaimer noting this is an AI-assisted preliminary estimate.`,
};

export const aiService = {
  async complete(
    request: AiCompletionRequest,
    providerName?: string
  ): Promise<AiCompletionResponse> {
    const provider = getProvider(providerName);
    return provider.complete(request);
  },

  async analyzeDrawing(drawingData: {
    description: string;
    measurements?: Record<string, any>;
  }): Promise<DrawingAnalysisResult> {
    const provider = getProvider();
    const response = await provider.complete({
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.drawingClassification },
        { role: 'user', content: JSON.stringify(drawingData) },
      ],
    });
    return JSON.parse(response.content) as DrawingAnalysisResult;
  },

  async generateBoq(projectData: Record<string, any>): Promise<BoqGenerationResult> {
    if (projectData.projectId && projectData.userId) {
      const project = await projectsRepository.findByIdAndUser(projectData.projectId, projectData.userId);
      if (!project) throw new NotFoundError('Project not found');
    }
    const provider = getProvider();
    const response = await provider.complete({
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.boqGeneration },
        { role: 'user', content: JSON.stringify(projectData) },
      ],
    });
    return JSON.parse(response.content) as BoqGenerationResult;
  },

  async explainPlainLanguage(constructionText: string): Promise<string> {
    const provider = getProvider();
    const response = await provider.complete({
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.plainLanguage },
        { role: 'user', content: constructionText },
      ],
      temperature: 0.3,
    });
    return response.content;
  },

  async extractQuantities(drawingData: Record<string, any>): Promise<Record<string, any>> {
    const provider = getProvider();
    const response = await provider.complete({
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.quantityExtraction },
        { role: 'user', content: JSON.stringify(drawingData) },
      ],
    });
    return JSON.parse(response.content) as Record<string, any>;
  },
};
