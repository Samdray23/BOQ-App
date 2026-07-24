import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { sendError } from './shared/responses.js';

// Route imports
import authRoutes from './auth/auth.routes.js';
import projectsRoutes from './projects/projects.routes.js';
import drawingsRoutes from './drawings/drawings.routes.js';
import boqRoutes from './boq/boq.routes.js';
import aiRoutes from './ai/ai.routes.js';
import pricingRoutes from './pricing/pricing.routes.js';
import constructionStageRoutes from './construction-stage/construction-stage.routes.js';
import reportsRoutes from './reports/reports.routes.js';
import exportsRoutes from './exports/exports.routes.js';
import paymentsRoutes from './payments/payments.routes.js';
import notificationsRoutes from './notifications/notifications.routes.js';
import jobsRoutes from './jobs/jobs.routes.js';
import onboardingRoutes from './onboarding/onboarding.routes.js';

const app = express();

// Security middleware
app.use(
  cors({
    origin: env.APP_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads (dev mode)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Global rate limiter
app.use('/api/', rateLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Root welcome message
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to the BOQ AI API Server',
    status: 'running',
    health: '/api/health',
    version: '1.0.0'
  });
});

// API v1 routes
const apiPrefix = '/api/v1';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/projects`, projectsRoutes);
app.use(`${apiPrefix}/drawings`, drawingsRoutes);
app.use(`${apiPrefix}/boq`, boqRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);
app.use(`${apiPrefix}/pricing`, pricingRoutes);
app.use(`${apiPrefix}/construction-stages`, constructionStageRoutes);
app.use(`${apiPrefix}/reports`, reportsRoutes);
app.use(`${apiPrefix}/exports`, exportsRoutes);
app.use(`${apiPrefix}/payments`, paymentsRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes);
app.use(`${apiPrefix}/jobs`, jobsRoutes);
app.use(`${apiPrefix}/onboarding`, onboardingRoutes);

// Legacy auth routes (backward compatibility)
app.use('/api/auth', authRoutes);

// Catch-all: ensure every request gets a JSON response, never empty or HTML
app.use((_req, res) => {
  if (!res.headersSent) {
    sendError(res, 404, 'NOT_FOUND', 'The requested resource was not found');
  }
});

// Final error handler — must be last
app.use(errorHandler);

export default app;
