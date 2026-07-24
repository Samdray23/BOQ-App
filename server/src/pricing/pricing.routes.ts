import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/auditLog.js';
import { pricingController } from './pricing.controller.js';
import { createRateSchema } from './pricing.validation.js';

const router = Router();

router.use(authenticate);

router.get('/regions', pricingController.getRegions);
router.get('/rates/:regionCode', pricingController.getRatesByRegion);
router.post(
  '/rates',
  validate(createRateSchema),
  auditLog('pricing.createRate', 'rate_library'),
  pricingController.createRate
);

export default router;
