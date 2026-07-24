import { Request, Response, NextFunction } from 'express';
import { pricingService } from './pricing.service.js';
import { sendSuccess, sendCreated } from '../shared/responses.js';

export const pricingController = {
  async getRegions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const regions = await pricingService.getRegions();
      sendSuccess(res, regions);
    } catch (err) {
      next(err);
    }
  },

  async getRatesByRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rates = await pricingService.getRatesByRegion(req.params.regionCode as string);
      sendSuccess(res, rates);
    } catch (err) {
      next(err);
    }
  },

  async createRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rate = await pricingService.createRate(req.body);
      sendCreated(res, rate);
    } catch (err) {
      next(err);
    }
  },
};
