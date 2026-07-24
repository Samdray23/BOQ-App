import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { Export } from './exports.types.js';

export const exportsRepository = {
  async findByUser(userId: string): Promise<Export[]> {
    return queryMany<Export>('SELECT * FROM exports WHERE user_id = $1 ORDER BY created_at DESC', [
      userId,
    ]);
  },

  async findById(id: string): Promise<Export | null> {
    return queryOne<Export>('SELECT * FROM exports WHERE id = $1', [id]);
  },

  async create(input: {
    userId: string;
    projectId: string;
    boqId?: string;
    type: string;
    format: string;
  }): Promise<Export> {
    const id = generateId();
    await query(
      `INSERT INTO exports (id, user_id, project_id, boq_id, type, format, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'processing', NOW())`,
      [id, input.userId, input.projectId, input.boqId || null, input.type, input.format]
    );
    return (await this.findById(id))!;
  },
};
