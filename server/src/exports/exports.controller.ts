import { Request, Response, NextFunction } from 'express';
import { exportsService } from './exports.service.js';
import { sendSuccess, sendCreated } from '../shared/responses.js';

export const exportsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exportRecord = await exportsService.createExport({
        ...req.body,
        userId: req.user!.userId,
      });
      sendCreated(res, exportRecord);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exports = await exportsService.getUserExports(req.user!.userId);
      sendSuccess(res, exports);
    } catch (err) {
      next(err);
    }
  },
};
