import { config } from 'dotenv';
config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/boq_ai',
  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '5432', 10),
  DATABASE_NAME: process.env.DATABASE_NAME || 'boq_ai',
  DATABASE_USER: process.env.DATABASE_USER || 'postgres',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'postgres',

  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@boqai.com',

  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  APP_NAME: process.env.APP_NAME || 'BOQ AI',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  STORAGE_BUCKET: process.env.STORAGE_BUCKET || 'boq-ai-uploads',
  STORAGE_REGION: process.env.STORAGE_REGION || 'us-east-1',
  STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY || '',
  STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY || '',
  STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT || '',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',

  AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4',
  AI_MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS || '4096', 10),
  AI_TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE || '0.1'),

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',

  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',

  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || 'deepseek-chat',

  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'paystack',
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || '',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  REQUIRE_EMAIL_VERIFICATION: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
