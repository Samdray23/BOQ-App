import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/index.js';
import type { AiCompletionRequest, AiCompletionResponse } from '../ai.types.js';
import type { IAiProvider } from './interface.js';

export class ClaudeProvider implements IAiProvider {
  public name = 'claude';
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: env.CLAUDE_API_KEY || env.AI_API_KEY });
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const userMessages = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await this.client.messages.create({
      model: env.CLAUDE_MODEL || env.AI_MODEL,
      system: systemMessage?.content,
      messages: userMessages,
      max_tokens: request.maxTokens ?? env.AI_MAX_TOKENS,
      temperature: request.temperature ?? env.AI_TEMPERATURE,
    });

    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('\n');

    return {
      content,
      model: response.model,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
    };
  }
}
