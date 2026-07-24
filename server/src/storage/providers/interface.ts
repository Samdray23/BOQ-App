import type { StorageFile } from '../storage.types.js';

export interface IStorageProvider {
  upload(file: {
    originalName: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  }): Promise<StorageFile>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
