import { Request, Response, NextFunction } from 'express';
import { jobsService } from './jobs.service.js';
import { sendSuccess } from '../shared/responses.js';

export const jobsController = {
  async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await jobsService.getJobStatus(req.params.id as string, req.user!.userId);
      if (!status) {
        res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
        return;
      }
      sendSuccess(res, status);
    } catch (err) {
      next(err);
    }
  },
};
