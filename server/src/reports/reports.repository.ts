import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { Report } from './reports.types.js';

export const reportsRepository = {
  async findByProject(projectId: string): Promise<Report[]> {
    return queryMany<Report>(
      'SELECT * FROM reports WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
  },

  async findById(id: string): Promise<Report | null> {
    return queryOne<Report>('SELECT * FROM reports WHERE id = $1', [id]);
  },

  async create(input: {
    projectId: string;
    boqId?: string;
    userId: string;
    title: string;
    type: string;
    format: string;
  }): Promise<Report> {
    const id = generateId();
    await query(
      `INSERT INTO reports (id, project_id, boq_id, user_id, title, type, format, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'generating', NOW(), NOW())`,
      [
        id,
        input.projectId,
        input.boqId || null,
        input.userId,
        input.title,
        input.type,
        input.format,
      ]
    );
    return (await this.findById(id))!;
  },

  async updateStorage(id: string, storageKey: string, fileSize: number): Promise<void> {
    await query(
      `UPDATE reports SET status = 'complete', storage_key = $1, file_size = $2, generated_at = NOW(), updated_at = NOW()
       WHERE id = $3`,
      [storageKey, fileSize, id]
    );
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await query('UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  },
};
