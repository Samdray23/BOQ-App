import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { usersController } from './users.controller.js';
import { updateProfileSchema } from './users.validation.js';

const router = Router();

router.use(authenticate);

router.get('/profile', usersController.getProfile);
router.patch('/profile', validate(updateProfileSchema), usersController.updateProfile);

export default router;
