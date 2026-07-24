import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service.js';
import { sendSuccess, sendCreated } from '../shared/responses.js';

export const reportsController = {
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await reportsService.generate({
        ...req.body,
        userId: req.user!.userId,
      });
      sendCreated(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reports = await reportsService.getByProject(req.user!.userId, req.params.projectId as string);
      sendSuccess(res, reports);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportsService.getById(req.user!.userId, req.params.id as string);
      sendSuccess(res, report);
    } catch (err) {
      next(err);
    }
  },
};
