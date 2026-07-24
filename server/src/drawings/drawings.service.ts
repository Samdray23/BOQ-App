import fs from 'fs/promises';
import path from 'path';
import { drawingsRepository } from './drawings.repository.js';
import { projectsRepository } from '../projects/projects.repository.js';
import { storageService } from '../storage/storage.service.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../shared/errors.js';
import { env } from '../config/index.js';
import type { Drawing } from './drawings.types.js';

export const drawingsService = {
  async upload(
    userId: string,
    projectId: string,
    file: Express.Multer.File,
    drawingType?: string
  ): Promise<Drawing> {
    const project = await projectsRepository.findByIdAndUser(projectId, userId);
    if (!project) throw new NotFoundError('Project not found');

    const buffer = await fs.readFile(file.path);
    const storageFile = await storageService.upload({
      originalName: file.originalname,
      buffer,
      mimeType: file.mimetype,
      size: file.size,
    });

    const latestVersion = await drawingsRepository.findLatestVersion(projectId);

    const drawing = await drawingsRepository.create({
      projectId,
      userId,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storageKey: storageFile.key,
      storageProvider: env.STORAGE_PROVIDER,
      version: latestVersion + 1,
      drawingType,
    });

    // Clean up temp file
    await fs.unlink(file.path).catch(() => {});

    return drawing;
  },

  async getByProject(userId: string, projectId: string): Promise<Drawing[]> {
    const project = await projectsRepository.findByIdAndUser(projectId, userId);
    if (!project) throw new NotFoundError('Project not found');
    return drawingsRepository.findByProject(projectId);
  },

  async getById(userId: string, drawingId: string): Promise<Drawing> {
    const drawing = await drawingsRepository.findById(drawingId);
    if (!drawing) throw new NotFoundError('Drawing not found');
    const project = await projectsRepository.findByIdAndUser(drawing.project_id, userId);
    if (!project) throw new ForbiddenError('Access denied');
    return drawing;
  },

  async updateStatus(
    drawingId: string,
    status: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await drawingsRepository.updateStatus(drawingId, status, metadata);
  },

  async delete(userId: string, drawingId: string): Promise<void> {
    const drawing = await this.getById(userId, drawingId);
    await storageService.delete(drawing.storage_key);
    await drawingsRepository.delete(drawingId);
  },
};
