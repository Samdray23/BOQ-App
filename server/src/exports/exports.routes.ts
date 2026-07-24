import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/auditLog.js';
import { exportsController } from './exports.controller.js';
import { createExportSchema } from './exports.validation.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validate(createExportSchema),
  auditLog('export.create', 'export'),
  exportsController.create
);
router.get('/', exportsController.list);

export default router;
