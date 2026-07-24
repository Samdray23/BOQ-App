import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/auditLog.js';
import { projectsController } from './projects.controller.js';
import { createProjectSchema, updateProjectSchema } from './projects.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', projectsController.list);
router.get('/:id', projectsController.getById);
router.post(
  '/',
  validate(createProjectSchema),
  auditLog('project.create', 'project'),
  projectsController.create
);
router.put(
  '/:id',
  validate(updateProjectSchema),
  auditLog('project.update', 'project'),
  projectsController.update
);
router.delete('/:id', auditLog('project.delete', 'project'), projectsController.delete);

export default router;
