import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { Job } from './jobs.types.js';

export const jobsRepository = {
  async findById(id: string): Promise<Job | null> {
    return queryOne<Job>('SELECT * FROM jobs WHERE id = $1', [id]);
  },

  async create(input: {
    type: string;
    payload: Record<string, any>;
    priority?: number;
    scheduledAt?: string;
  }): Promise<Job> {
    const id = generateId();
    await query(
      `INSERT INTO jobs (id, type, payload, priority, scheduled_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        id,
        input.type,
        JSON.stringify(input.payload),
        input.priority || 0,
        input.scheduledAt || null,
      ]
    );
    return (await this.findById(id))!;
  },

  async claimNext(): Promise<Job | null> {
    const job = await queryOne<Job>(
      `UPDATE jobs SET status = 'processing', started_at = NOW(), updated_at = NOW()
       WHERE id = (
         SELECT id FROM jobs WHERE status = 'pending'
         AND (scheduled_at IS NULL OR scheduled_at <= NOW())
         ORDER BY priority DESC, created_at ASC LIMIT 1
       )
       RETURNING *`
    );
    return job || null;
  },

  async updateProgress(id: string, progress: number): Promise<void> {
    await query('UPDATE jobs SET progress = $1, updated_at = NOW() WHERE id = $2', [progress, id]);
  },

  async complete(id: string, result: Record<string, any>): Promise<void> {
    await query(
      'UPDATE jobs SET status = $1, result = $2, completed_at = NOW(), updated_at = NOW() WHERE id = $3',
      ['completed', JSON.stringify(result), id]
    );
  },

  async fail(id: string, error: string): Promise<void> {
    await query('UPDATE jobs SET status = $1, error = $2, updated_at = NOW() WHERE id = $3', [
      'failed',
      error,
      id,
    ]);
  },
};
