import { env } from '../config/index.js';

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel = LOG_LEVELS[env.LOG_LEVEL as LogLevel] ?? LOG_LEVELS.info;

function timestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, meta?: Record<string, any>): void {
  if (LOG_LEVELS[level] > currentLevel) return;

  const entry: Record<string, any> = {
    timestamp: timestamp(),
    level,
    message,
  };
  if (meta) entry.meta = meta;

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  error: (message: string, meta?: Record<string, any>) => log('error', message, meta),
  warn: (message: string, meta?: Record<string, any>) => log('warn', message, meta),
  info: (message: string, meta?: Record<string, any>) => log('info', message, meta),
  debug: (message: string, meta?: Record<string, any>) => log('debug', message, meta),
};
