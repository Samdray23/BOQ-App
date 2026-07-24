import { Request, Response, NextFunction } from 'express';
import { constructionStageService } from './construction-stage.service.js';
import { sendSuccess } from '../shared/responses.js';

export const constructionStageController = {
  async getAllStages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stages = await constructionStageService.getAllStages();
      sendSuccess(res, stages);
    } catch (err) {
      next(err);
    }
  },

  async getStageSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await constructionStageService.getStageSummary(
        req.user!.userId,
        req.params.boqId as string,
        req.params.stageId as string
      );
      sendSuccess(res, summary);
    } catch (err) {
      next(err);
    }
  },

  async getBoqBreakdown(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summaries = await constructionStageService.getBoqStageBreakdown(
        req.user!.userId,
        req.params.boqId as string
      );
      sendSuccess(res, summaries);
    } catch (err) {
      next(err);
    }
  },
};
