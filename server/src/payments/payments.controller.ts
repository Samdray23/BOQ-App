import { Request, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service.js';
import { sendSuccess, sendCreated } from '../shared/responses.js';

export const paymentsController = {
  async initializeSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plan, interval } = req.body;
      const user = req.user!;
      const result = await paymentsService.initializeSubscription(
        user.userId,
        user.email,
        plan,
        interval
      );
      sendCreated(res, result);
    } catch (err) {
      next(err);
    }
  },

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await paymentsService.verifyPayment(req.user!.userId, req.body.reference);
      sendSuccess(res, { message: 'Payment verified successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscription = await paymentsService.getUserSubscription(req.user!.userId);
      sendSuccess(res, subscription);
    } catch (err) {
      next(err);
    }
  },

  async getPaymentHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await paymentsService.getPaymentHistory(req.user!.userId);
      sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  },
};
