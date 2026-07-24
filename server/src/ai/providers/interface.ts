import type { AiCompletionRequest, AiCompletionResponse } from '../ai.types.js';

export interface IAiProvider {
  complete(request: AiCompletionRequest): Promise<AiCompletionResponse>;
  name: string;
}
