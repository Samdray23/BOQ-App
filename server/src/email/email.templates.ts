import { env } from '../config/index.js';
import type { EmailTemplate } from './email.types.js';

function layout(title: string, bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
      <table cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
          <td style="padding: 32px 24px; background-color: #1a1a2e; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${env.APP_NAME}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 24px;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding: 24px; background-color: #f8f8f8; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  welcome: {
    subject: `Welcome to ${env.APP_NAME}!`,
    text: (vars) =>
      `Hi ${vars.name},\n\nWelcome to ${env.APP_NAME}! We're excited to have you on board.\n\nStart by creating your first project and uploading an architectural drawing.\n\nBest regards,\nThe ${env.APP_NAME} Team`,
    html: (vars) =>
      layout(
        'Welcome!',
        `
      <h2 style="color: #1a1a2e;">Welcome to ${env.APP_NAME}, ${vars.name}!</h2>
      <p style="color: #666; line-height: 1.6;">We're excited to have you on board. ${env.APP_NAME} helps you generate accurate Bills of Quantities from architectural drawings using AI.</p>
      <p style="color: #666; line-height: 1.6;">Start by creating your first project and uploading an architectural drawing.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${env.APP_URL}/projects" style="display: inline-block; padding: 12px 24px; background-color: #1a1a2e; color: #ffffff; text-decoration: none; border-radius: 6px;">Create Your First Project</a>
      </div>
    `
      ),
  },

  verifyEmail: {
    subject: `Verify your email – ${env.APP_NAME}`,
    text: (vars) =>
      `Hi ${vars.name},\n\nThank you for signing up. Please verify your email by visiting:\n${vars.verifyUrl}\n\nThis link expires in 24 hours.\n\nBest regards,\nThe ${env.APP_NAME} Team`,
    html: (vars) =>
      layout(
        'Verify your email',
        `
      <h2 style="color: #1a1a2e;">Welcome to ${env.APP_NAME}!</h2>
      <p style="color: #666; line-height: 1.6;">Hi ${vars.name},</p>
      <p style="color: #666; line-height: 1.6;">Thank you for signing up. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${vars.verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a1a2e; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Email</a>
      </div>
      <p style="color: #999; font-size: 12px;">Or copy this link: <span style="word-break: break-all;">${vars.verifyUrl}</span></p>
      <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
    `
      ),
  },

  passwordReset: {
    subject: `Reset your password – ${env.APP_NAME}`,
    text: (vars) =>
      `Hi ${vars.name},\n\nYou requested a password reset. Click the link below to reset your password:\n${vars.resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe ${env.APP_NAME} Team`,
    html: (vars) =>
      layout(
        'Reset your password',
        `
      <h2 style="color: #1a1a2e;">Reset Your Password</h2>
      <p style="color: #666; line-height: 1.6;">Hi ${vars.name},</p>
      <p style="color: #666; line-height: 1.6;">You requested a password reset. Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${vars.resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a1a2e; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Password</a>
      </div>
      <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    `
      ),
  },

  reportReady: {
    subject: `Your report is ready – ${env.APP_NAME}`,
    text: (vars) =>
      `Hi ${vars.name},\n\nYour report "${vars.reportTitle}" is ready. You can view and download it from your dashboard.\n\n${env.APP_URL}/projects/reports\n\nBest regards,\nThe ${env.APP_NAME} Team`,
    html: (vars) =>
      layout(
        'Report Ready',
        `
      <h2 style="color: #1a1a2e;">Your Report is Ready</h2>
      <p style="color: #666; line-height: 1.6;">Hi ${vars.name},</p>
      <p style="color: #666; line-height: 1.6;">Your report "<strong>${vars.reportTitle}</strong>" is ready. You can view and download it from your dashboard.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${env.APP_URL}/projects/reports" style="display: inline-block; padding: 12px 24px; background-color: #1a1a2e; color: #ffffff; text-decoration: none; border-radius: 6px;">View Report</a>
      </div>
    `
      ),
  },

  paymentConfirmation: {
    subject: `Payment confirmed – ${env.APP_NAME}`,
    text: (vars) =>
      `Hi ${vars.name},\n\nYour payment of ${vars.amount} has been confirmed. Your subscription is now active.\n\nAmount: ${vars.amount}\nPlan: ${vars.plan}\nDate: ${vars.date}\n\nBest regards,\nThe ${env.APP_NAME} Team`,
    html: (vars) =>
      layout(
        'Payment Confirmed',
        `
      <h2 style="color: #1a1a2e;">Payment Confirmed</h2>
      <p style="color: #666; line-height: 1.6;">Hi ${vars.name},</p>
      <p style="color: #666; line-height: 1.6;">Thank you! Your payment has been confirmed.</p>
      <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
        <tr><td style="padding: 8px; color: #666;">Amount</td><td style="padding: 8px; font-weight: bold;">${vars.amount}</td></tr>
        <tr><td style="padding: 8px; color: #666;">Plan</td><td style="padding: 8px; font-weight: bold;">${vars.plan}</td></tr>
        <tr><td style="padding: 8px; color: #666;">Date</td><td style="padding: 8px; font-weight: bold;">${vars.date}</td></tr>
      </table>
    `
      ),
  },
};
