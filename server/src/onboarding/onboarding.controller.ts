import { Request, Response, NextFunction } from 'express';
import { onboardingService } from './onboarding.service.js';
import { sendSuccess } from '../shared/responses.js';

export const onboardingController = {
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await onboardingService.get(req.user!.userId, req.user!.role);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await onboardingService.update(
        req.user!.userId,
        req.body,
        req.user!.role
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
