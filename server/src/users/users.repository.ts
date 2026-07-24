import { query, queryOne } from '../database/index.js';
import type { UserProfile } from './users.types.js';

export const usersRepository = {
  async findById(id: string): Promise<UserProfile | null> {
    return queryOne<UserProfile>(
      'SELECT id, name, email, role, is_verified, avatar_url, last_login_at, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
  },

  async update(
    id: string,
    input: Partial<{ name: string; avatar_url: string }>
  ): Promise<UserProfile | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(input.name);
      paramIndex++;
    }
    if (input.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramIndex}`);
      values.push(input.avatar_url);
      paramIndex++;
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
    return this.findById(id);
  },
};
