export interface StorageFile {
  key: string;
  bucket?: string;
  mimeType: string;
  size: number;
  url?: string;
}

export interface StorageProvider {
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
