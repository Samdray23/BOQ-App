import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/errors.js';

const roleHierarchy: Record<string, number> = {
  homeowner: 0,
  contractor: 1,
  architect: 2,
  quantity_surveyor: 3,
  enterprise_administrator: 4,
  admin: 5,
};

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const userRole = req.user.role;
    if (allowedRoles.includes(userRole)) {
      next();
      return;
    }

    const userLevel = roleHierarchy[userRole] ?? -1;
    const minLevel = Math.min(...allowedRoles.map((r) => roleHierarchy[r] ?? Infinity));

    if (userLevel >= minLevel) {
      next();
      return;
    }

    throw new ForbiddenError('Insufficient permissions');
  };
}

export function selfOrAuthorized(paramUserIdField = 'userId') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const targetUserId = req.params[paramUserIdField] || req.body[paramUserIdField];
    if (req.user.userId === targetUserId || roleHierarchy[req.user.role] >= 4) {
      next();
      return;
    }

    throw new ForbiddenError('Insufficient permissions');
  };
}
