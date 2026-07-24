import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { aiController } from './ai.controller.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const completionSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  provider: z.string().optional(),
});

const analyzeDrawingSchema = z.object({
  description: z.string().min(1),
  measurements: z.record(z.any()).optional(),
});

router.post(
  '/complete',
  authenticate,
  rateLimiter,
  validate(completionSchema),
  aiController.complete
);
router.post(
  '/analyze-drawing',
  authenticate,
  rateLimiter,
  validate(analyzeDrawingSchema),
  aiController.analyzeDrawing
);
router.post('/explain', authenticate, rateLimiter, aiController.explainPlainLanguage);
router.post('/generate-boq/:projectId', authenticate, rateLimiter, aiController.generateBoq);

export default router;
