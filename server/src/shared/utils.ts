import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export function generateId(): string {
  return uuidv4();
}

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_');
}

export function parsePagination(query: { page?: string; limit?: string }): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(2));
}

export function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

export function roundTo(value: number, decimals = 2): number {
  return parseFloat(value.toFixed(decimals));
}
