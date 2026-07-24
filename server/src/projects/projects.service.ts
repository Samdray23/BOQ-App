import { projectsRepository } from './projects.repository.js';
import { parsePagination } from '../shared/utils.js';
import { NotFoundError, ForbiddenError } from '../shared/errors.js';
import type { CreateProjectInput, Project } from './projects.types.js';

export const projectsService = {
  async list(userId: string, queryParams: { page?: string; limit?: string }) {
    const { page, limit, offset } = parsePagination(queryParams);
    const [projects, total] = await Promise.all([
      projectsRepository.findByUser(userId, limit, offset),
      projectsRepository.countByUser(userId),
    ]);
    return { projects, total, page, limit };
  },

  async getById(userId: string, projectId: string): Promise<Project> {
    const project = await projectsRepository.findByIdAndUser(projectId, userId);
    if (!project) throw new NotFoundError('Project not found');
    return project;
  },

  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    return projectsRepository.create(userId, input);
  },

  async update(
    userId: string,
    projectId: string,
    input: Partial<CreateProjectInput>
  ): Promise<Project> {
    await this.getById(userId, projectId);
    const updated = await projectsRepository.update(projectId, input);
    if (!updated) throw new NotFoundError('Project not found');
    return updated;
  },

  async delete(userId: string, projectId: string): Promise<void> {
    await this.getById(userId, projectId);
    await projectsRepository.delete(projectId);
  },
};
