import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/auditLog.js';
import { reportsController } from './reports.controller.js';
import { generateReportSchema } from './reports.validation.js';

const router = Router();

router.use(authenticate);

router.post(
  '/generate',
  validate(generateReportSchema),
  auditLog('report.generate', 'report'),
  reportsController.generate
);
router.get('/project/:projectId', reportsController.getByProject);
router.get('/:id', reportsController.getById);

export default router;
