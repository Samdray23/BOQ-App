import { Request, Response, NextFunction } from 'express';
import { query } from '../database/index.js';
import { generateId } from '../shared/utils.js';

export function auditLog(action: string, entityType?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let capturedBody: any = null;

    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      capturedBody = body;
      if (res.statusCode < 400) {
        const entityId = req.params.id || body?.data?.id || null;
        logAuditEvent({
          userId: req.user?.userId || null,
          action,
          entityType: entityType || null,
          entityId,
          metadata: {
            method: req.method,
            path: req.originalUrl || req.path,
            statusCode: res.statusCode,
            requestBody: sanitizeBody(req.body),
          },
          ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || null,
          userAgent: req.headers['user-agent'] || null,
        }).catch((err) => {
          console.error('Audit log failed:', err.message || err);
        });
      }
      return originalJson(body);
    };

    next();
  };
}

async function logAuditEvent(event: {
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        generateId(),
        event.userId,
        event.action,
        event.entityType,
        event.entityId,
        JSON.stringify(event.metadata),
        event.ipAddress,
        event.userAgent,
      ]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

function sanitizeBody(body: Record<string, any>): Record<string, any> {
  if (!body) return {};
  const sensitive = ['password', 'token', 'credential', 'secret', 'authorization'];
  const sanitized = { ...body };
  for (const key of sensitive) {
    if (key in sanitized) sanitized[key] = '***';
  }
  return sanitized;
}
