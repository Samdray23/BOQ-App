import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/auditLog.js';
import { boqController } from './boq.controller.js';
import { generateBoqSchema } from './boq.validation.js';

const router = Router();

router.use(authenticate);

router.post(
  '/generate',
  validate(generateBoqSchema),
  auditLog('boq.generate', 'boq'),
  boqController.generate
);
router.get('/project/:projectId', boqController.getByProject);
router.get('/:id', boqController.getById);

export default router;
