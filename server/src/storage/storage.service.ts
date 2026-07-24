import { env } from '../config/index.js';
import { LocalStorageProvider } from './providers/local.provider.js';
import { S3StorageProvider } from './providers/s3.provider.js';
import type { IStorageProvider } from './providers/interface.js';
import type { StorageFile } from './storage.types.js';

let provider: IStorageProvider;

function getProvider(): IStorageProvider {
  if (!provider) {
    switch (env.STORAGE_PROVIDER) {
      case 's3':
        provider = new S3StorageProvider();
        break;
      case 'local':
      default:
        provider = new LocalStorageProvider();
        break;
    }
  }
  return provider;
}

export const storageService = {
  async upload(file: {
    originalName: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  }): Promise<StorageFile> {
    return getProvider().upload(file);
  },

  async download(key: string): Promise<Buffer> {
    return getProvider().download(key);
  },

  async delete(key: string): Promise<void> {
    return getProvider().delete(key);
  },

  getUrl(key: string): string {
    return getProvider().getUrl(key);
  },
};
