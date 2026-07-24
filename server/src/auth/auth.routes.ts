import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/auditLog.js';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from './auth.validation.js';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  auditLog('auth.register', 'user'),
  authController.register
);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google', validate(googleAuthSchema), authController.googleAuth);
router.get('/verify/:token', authController.verifyEmail);
router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  authController.resendVerification
);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

export default router;
