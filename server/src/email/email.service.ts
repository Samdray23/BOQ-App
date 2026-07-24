import nodemailer from 'nodemailer';
import { env } from '../config/index.js';
import { emailTemplates } from './email.templates.js';
import type { EmailOptions } from './email.types.js';
import { logger } from '../utils/logger.js';

let transporter: nodemailer.Transporter;

const EMAIL_TIMEOUT_MS = 15000;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'localhost',
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      connectionTimeout: EMAIL_TIMEOUT_MS,
      greetingTimeout: EMAIL_TIMEOUT_MS,
      socketTimeout: EMAIL_TIMEOUT_MS,
    });
  }
  return transporter;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  if (!env.SMTP_HOST) {
    logger.warn('SMTP not configured — skipping email send', { to: options.to, subject: options.subject });
    return;
  }

  try {
    const info = await getTransporter().sendMail({
      from: env.FROM_EMAIL,
      to: options.to,
      cc: options.cc?.join(', '),
      bcc: options.bcc?.join(', '),
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    logger.info(`Email sent to ${options.to}`, {
      subject: options.subject,
      messageId: info.messageId,
    });
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}`, {
      subject: options.subject,
      error: (error as Error).message,
    });
  }
}

export const emailService = {
  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const verifyUrl = `${env.APP_URL}/verify-email/${token}`;
    const template = emailTemplates.verifyEmail;

    await sendEmail({
      to,
      subject: template.subject,
      text: template.text({ name, verifyUrl }),
      html: template.html({ name, verifyUrl }),
    });
  },

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const template = emailTemplates.welcome;
    await sendEmail({
      to,
      subject: template.subject,
      text: template.text({ name }),
      html: template.html({ name }),
    });
  },

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const resetUrl = `${env.APP_URL}/reset-password/${token}`;
    const template = emailTemplates.passwordReset;

    await sendEmail({
      to,
      subject: template.subject,
      text: template.text({ name, resetUrl }),
      html: template.html({ name, resetUrl }),
    });
  },

  async sendReportReadyEmail(to: string, name: string, reportTitle: string): Promise<void> {
    const template = emailTemplates.reportReady;
    await sendEmail({
      to,
      subject: template.subject,
      text: template.text({ name, reportTitle }),
      html: template.html({ name, reportTitle }),
    });
  },

  async sendPaymentConfirmationEmail(
    to: string,
    name: string,
    amount: string,
    plan: string
  ): Promise<void> {
    const template = emailTemplates.paymentConfirmation;
    await sendEmail({
      to,
      subject: template.subject,
      text: template.text({ name, amount, plan, date: new Date().toLocaleDateString() }),
      html: template.html({ name, amount, plan, date: new Date().toLocaleDateString() }),
    });
  },
};
