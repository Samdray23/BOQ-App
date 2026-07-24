import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/auditLog.js';
import { paymentsController } from './payments.controller.js';
import { initializePaymentSchema, verifyPaymentSchema } from './payments.validation.js';

const router = Router();

router.use(authenticate);

router.post(
  '/initialize',
  validate(initializePaymentSchema),
  auditLog('payment.initialize', 'payment'),
  paymentsController.initializeSubscription
);
router.post(
  '/verify',
  validate(verifyPaymentSchema),
  auditLog('payment.verify', 'payment'),
  paymentsController.verifyPayment
);
router.get('/subscription', paymentsController.getSubscription);
router.get('/history', paymentsController.getPaymentHistory);

export default router;
