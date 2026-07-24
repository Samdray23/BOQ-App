import { jobsRepository } from './jobs.repository.js';
import { ForbiddenError } from '../shared/errors.js';
import type { Job, JobType } from './jobs.types.js';

export const jobsService = {
  async createJob(type: string, payload: Record<string, any>, priority?: number): Promise<Job> {
    return jobsRepository.create({ type, payload, priority });
  },

  async getJobStatus(jobId: string, userId: string): Promise<{
    id: string;
    type: string;
    status: string;
    progress: number;
    error: string | null;
  } | null> {
    const job = await jobsRepository.findById(jobId);
    if (!job) return null;
    const payload = job.payload as Record<string, any>;
    if (payload.userId && payload.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }
    return {
      id: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      error: job.error,
    };
  },
};
