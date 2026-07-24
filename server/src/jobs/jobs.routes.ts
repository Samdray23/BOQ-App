import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { jobsController } from './jobs.controller.js';

const router = Router();

router.use(authenticate);

router.get('/:id/status', jobsController.getJobStatus);

export default router;
