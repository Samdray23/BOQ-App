import { Request, Response, NextFunction } from 'express';
import { drawingsService } from './drawings.service.js';
import { sendSuccess, sendCreated } from '../shared/responses.js';

export const drawingsController = {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res
          .status(400)
          .json({ success: false, error: { code: 'BAD_REQUEST', message: 'No file uploaded' } });
        return;
      }
      const drawing = await drawingsService.upload(
        req.user!.userId,
        req.body.projectId,
        req.file,
        req.body.drawingType
      );
      sendCreated(res, drawing);
    } catch (err) {
      next(err);
    }
  },

  async getByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const drawings = await drawingsService.getByProject(
        req.user!.userId,
        req.params.projectId as string
      );
      sendSuccess(res, drawings);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const drawing = await drawingsService.getById(req.user!.userId, req.params.id as string);
      sendSuccess(res, drawing);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await drawingsService.delete(req.user!.userId, req.params.id as string);
      sendSuccess(res, { message: 'Drawing deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
