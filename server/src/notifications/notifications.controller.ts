import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service.js';
import { sendSuccess, sendPaginated } from '../shared/responses.js';

export const notificationsController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await notificationsService.list(req.user!.userId, req.query as any);
      sendPaginated(res, result.notifications, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationsService.markAsRead(req.user!.userId, req.params.id as string);
      sendSuccess(res, { message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationsService.markAllAsRead(req.user!.userId);
      sendSuccess(res, { message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationsService.delete(req.user!.userId, req.params.id as string);
      sendSuccess(res, { message: 'Notification deleted' });
    } catch (err) {
      next(err);
    }
  },
};
