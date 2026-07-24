import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadDrawing } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/auditLog.js';
import { drawingsController } from './drawings.controller.js';
import { createDrawingSchema } from './drawings.validation.js';

const router = Router();

router.use(authenticate);

router.post(
  '/upload',
  uploadDrawing,
  validate(createDrawingSchema),
  auditLog('drawing.upload', 'drawing'),
  drawingsController.upload
);

router.get('/project/:projectId', drawingsController.getByProject);
router.get('/:id', drawingsController.getById);
router.delete('/:id', auditLog('drawing.delete', 'drawing'), drawingsController.delete);

export default router;
