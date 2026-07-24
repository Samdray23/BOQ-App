import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service.js';
import { sendSuccess } from '../shared/responses.js';

export const aiController = {
  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messages, temperature, maxTokens, provider } = req.body;
      const result = await aiService.complete({ messages, temperature, maxTokens }, provider);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async analyzeDrawing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.analyzeDrawing(req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async explainPlainLanguage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.explainPlainLanguage(req.body.text);
      sendSuccess(res, { explanation: result });
    } catch (err) {
      next(err);
    }
  },

  async generateBoq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.generateBoq({
        projectId: req.params.projectId as string,
        userId: req.user!.userId,
        ...req.body,
      });
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
