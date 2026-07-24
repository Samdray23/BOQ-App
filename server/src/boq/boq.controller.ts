import { Request, Response, NextFunction } from 'express';
import { boqService } from './boq.service.js';
import { sendSuccess, sendCreated } from '../shared/responses.js';

export const boqController = {
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId, drawingId, title } = req.body;
      const boq = await boqService.generate(req.user!.userId, projectId, title, drawingId);
      sendCreated(res, boq);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await boqService.getById(req.user!.userId, req.params.id as string);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const boqs = await boqService.getByProject(req.user!.userId, req.params.projectId as string);
      sendSuccess(res, boqs);
    } catch (err) {
      next(err);
    }
  },
};
