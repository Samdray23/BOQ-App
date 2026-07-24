import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors.js';
import { sendError } from '../shared/responses.js';
import { env } from '../config/index.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) {
    console.error('Error after headers sent:', err.message);
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  console.error('Unhandled error:', err);

  const message =
    env.NODE_ENV === 'development'
      ? err.message || 'An unexpected error occurred'
      : 'An unexpected error occurred';

  sendError(res, 500, 'INTERNAL_ERROR', message);
}

export function notFoundHandler(_req: Request, res: Response): void {
  if (res.headersSent) return;
  sendError(res, 404, 'NOT_FOUND', 'The requested resource was not found');
}
