import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import { sendSuccess } from '../shared/responses.js';

export const usersController = {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await usersService.getProfile(req.user!.userId);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await usersService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  },
};
