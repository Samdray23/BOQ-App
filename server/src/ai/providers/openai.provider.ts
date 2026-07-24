import OpenAI from 'openai';
import { env } from '../../config/index.js';
import type { AiCompletionRequest, AiCompletionResponse } from '../ai.types.js';
import type { IAiProvider } from './interface.js';

export class OpenAIProvider implements IAiProvider {
  public name = 'openai';
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY || env.AI_API_KEY });
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const response = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL || env.AI_MODEL,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: request.temperature ?? env.AI_TEMPERATURE,
      max_tokens: request.maxTokens ?? env.AI_MAX_TOKENS,
    });

    const choice = response.choices[0];
    return {
      content: choice?.message?.content || '',
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }
}
