import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { Project, CreateProjectInput } from './projects.types.js';

export const projectsRepository = {
  async findByUser(userId: string, limit: number, offset: number): Promise<Project[]> {
    return queryMany<Project>(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
  },

  async countByUser(userId: string): Promise<number> {
    const result = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM projects WHERE user_id = $1',
      [userId]
    );
    return parseInt(result?.count || '0', 10);
  },

  async findById(id: string): Promise<Project | null> {
    return queryOne<Project>('SELECT * FROM projects WHERE id = $1', [id]);
  },

  async findByIdAndUser(id: string, userId: string): Promise<Project | null> {
    return queryOne<Project>('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [id, userId]);
  },

  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    const id = generateId();
    const now = new Date().toISOString();

    await query(
      `INSERT INTO projects (id, user_id, name, client, type, location, currency, description, building_type, num_floors, total_area, start_date, completion_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        id,
        userId,
        input.name,
        input.client || null,
        input.type || 'residential',
        input.location || null,
        input.currency || 'NGN',
        input.description || null,
        input.building_type || null,
        input.num_floors || 1,
        input.total_area || null,
        input.start_date || null,
        input.completion_date || null,
        now,
        now,
      ]
    );

    return (await this.findById(id))!;
  },

  async update(id: string, input: Partial<CreateProjectInput>): Promise<Project | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        const dbKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
        fields.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    await query(`UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);

    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await query('DELETE FROM projects WHERE id = $1', [id]);
  },
};
