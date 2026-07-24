import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { onboardingController } from './onboarding.controller.js';
import { updateOnboardingSchema } from './onboarding.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', onboardingController.get);
router.put('/', validate(updateOnboardingSchema), onboardingController.update);

export default router;
