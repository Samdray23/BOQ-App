import fs from 'fs/promises';
import path from 'path';
import { env } from '../../config/index.js';
import { generateId } from '../../shared/utils.js';
import type { StorageFile } from '../storage.types.js';
import type { IStorageProvider } from './interface.js';

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = env.UPLOAD_DIR;
    fs.mkdir(this.baseDir, { recursive: true }).catch(() => {});
  }

  async upload(file: {
    originalName: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  }): Promise<StorageFile> {
    const ext = path.extname(file.originalName);
    const key = `${generateId()}${ext}`;
    const filePath = path.join(this.baseDir, key);
    await fs.writeFile(filePath, file.buffer);
    return { key, mimeType: file.mimeType, size: file.size, url: this.getUrl(key) };
  }

  async download(key: string): Promise<Buffer> {
    return fs.readFile(path.join(this.baseDir, key));
  }

  async delete(key: string): Promise<void> {
    await fs.unlink(path.join(this.baseDir, key)).catch(() => {});
  }

  getUrl(key: string): string {
    return `${env.APP_URL}/uploads/${key}`;
  }
}
