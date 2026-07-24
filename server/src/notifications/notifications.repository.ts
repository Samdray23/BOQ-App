import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { Notification } from './notifications.types.js';

export const notificationsRepository = {
  async findByUser(userId: string, limit: number, offset: number): Promise<Notification[]> {
    return queryMany<Notification>(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
  },

  async countUnread(userId: string): Promise<number> {
    const result = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    return parseInt(result?.count || '0', 10);
  },

  async create(input: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    category?: string;
    link?: string;
  }): Promise<Notification> {
    const id = generateId();
    await query(
      `INSERT INTO notifications (id, user_id, title, message, type, category, link, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        id,
        input.userId,
        input.title,
        input.message,
        input.type || 'info',
        input.category || null,
        input.link || null,
      ]
    );
    return (await queryOne<Notification>('SELECT * FROM notifications WHERE id = $1', [id]))!;
  },

  async markAsRead(id: string, userId: string): Promise<void> {
    await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, userId]);
  },

  async markAllAsRead(userId: string): Promise<void> {
    await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE', [
      userId,
    ]);
  },

  async delete(id: string, userId: string): Promise<void> {
    await query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [id, userId]);
  },
};
