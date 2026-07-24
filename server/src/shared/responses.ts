import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse['meta']
): void {
  if (res.headersSent) return;
  const response: ApiResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  res.setHeader('Content-Type', 'application/json');
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  if (res.headersSent) return;
  res.status(204).end();
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, any>
): void {
  if (res.headersSent) return;
  const response: ApiResponse = {
    success: false,
    error: { code, message, details },
  };
  res.setHeader('Content-Type', 'application/json');
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): void {
  sendSuccess(res, data, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
