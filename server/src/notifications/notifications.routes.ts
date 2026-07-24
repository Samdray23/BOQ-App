import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { notificationsController } from './notifications.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.list);
router.patch('/:id/read', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.delete);

export default router;
