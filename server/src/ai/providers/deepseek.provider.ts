import { env } from '../../config/index.js';
import type { AiCompletionRequest, AiCompletionResponse } from '../ai.types.js';
import type { IAiProvider } from './interface.js';

export class DeepSeekProvider implements IAiProvider {
  public name = 'deepseek';

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY || env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL || env.AI_MODEL,
        messages: request.messages,
        temperature: request.temperature ?? env.AI_TEMPERATURE,
        max_tokens: request.maxTokens ?? env.AI_MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || 'deepseek-chat',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
