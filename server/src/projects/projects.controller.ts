import { Request, Response, NextFunction } from 'express';
import { projectsService } from './projects.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../shared/responses.js';

export const projectsController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projects, total, page, limit } = await projectsService.list(
        req.user!.userId,
        req.query as any
      );
      sendPaginated(res, projects, total, page, limit);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectsService.getById(req.user!.userId, req.params.id as string);
      sendSuccess(res, project);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectsService.create(req.user!.userId, req.body);
      sendCreated(res, project);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectsService.update(
        req.user!.userId,
        req.params.id as string,
        req.body
      );
      sendSuccess(res, project);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await projectsService.delete(req.user!.userId, req.params.id as string);
      sendSuccess(res, { message: 'Project deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
