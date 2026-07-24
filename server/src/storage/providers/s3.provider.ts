import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/index.js';
import { generateId } from '../../shared/utils.js';
import type { StorageFile } from '../storage.types.js';
import type { IStorageProvider } from './interface.js';

export class S3StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: env.STORAGE_REGION,
      endpoint: env.STORAGE_ENDPOINT || undefined,
      credentials: {
        accessKeyId: env.STORAGE_ACCESS_KEY,
        secretAccessKey: env.STORAGE_SECRET_KEY,
      },
    });
    this.bucket = env.STORAGE_BUCKET;
  }

  async upload(file: {
    originalName: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  }): Promise<StorageFile> {
    const ext = file.originalName.split('.').pop() || '';
    const key = `drawings/${generateId()}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
      })
    );

    return {
      key,
      bucket: this.bucket,
      mimeType: file.mimeType,
      size: file.size,
      url: this.getUrl(key),
    };
  }

  async download(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
    return Buffer.from(await response.Body!.transformToByteArray());
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  getUrl(key: string): string {
    return `https://${this.bucket}.s3.${env.STORAGE_REGION}.amazonaws.com/${key}`;
  }
}
