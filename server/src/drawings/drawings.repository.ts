import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { Drawing } from './drawings.types.js';

export const drawingsRepository = {
  async findByProject(projectId: string): Promise<Drawing[]> {
    return queryMany<Drawing>(
      'SELECT * FROM drawings WHERE project_id = $1 ORDER BY version DESC',
      [projectId]
    );
  },

  async findById(id: string): Promise<Drawing | null> {
    return queryOne<Drawing>('SELECT * FROM drawings WHERE id = $1', [id]);
  },

  async create(input: {
    projectId: string;
    userId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    storageProvider: string;
    version: number;
    drawingType?: string;
    pageCount?: number;
  }): Promise<Drawing> {
    const id = generateId();
    await query(
      `INSERT INTO drawings (id, project_id, user_id, filename, original_name, mime_type, size_bytes, storage_key, storage_provider, version, drawing_type, page_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
      [
        id,
        input.projectId,
        input.userId,
        input.filename,
        input.originalName,
        input.mimeType,
        input.sizeBytes,
        input.storageKey,
        input.storageProvider,
        input.version,
        input.drawingType || null,
        input.pageCount || null,
      ]
    );
    return (await this.findById(id))!;
  },

  async updateVersion(id: string): Promise<void> {
    await query('UPDATE drawings SET version = version + 1, updated_at = NOW() WHERE id = $1', [
      id,
    ]);
  },

  async updateStatus(id: string, status: string, metadata?: Record<string, any>): Promise<void> {
    if (metadata) {
      await query(
        'UPDATE drawings SET status = $1, metadata = metadata || $2::jsonb, updated_at = NOW() WHERE id = $3',
        [status, JSON.stringify(metadata), id]
      );
    } else {
      await query('UPDATE drawings SET status = $1, updated_at = NOW() WHERE id = $2', [
        status,
        id,
      ]);
    }
  },

  async delete(id: string): Promise<void> {
    await query('DELETE FROM drawings WHERE id = $1', [id]);
  },

  async findLatestVersion(projectId: string): Promise<number> {
    const result = await queryOne<{ max: number | null }>(
      'SELECT MAX(version) as max FROM drawings WHERE project_id = $1',
      [projectId]
    );
    return result?.max || 0;
  },
};
