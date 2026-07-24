export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }>;
}

export interface EmailTemplate {
  subject: string;
  text: (vars: Record<string, string>) => string;
  html: (vars: Record<string, string>) => string;
}
