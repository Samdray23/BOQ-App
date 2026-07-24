import nodemailer from 'nodemailer';
import { env } from '../config.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'localhost',
  port: env.SMTP_PORT,
  secure: false,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${env.APP_URL}/verify-email/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Welcome to BOQ AI!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
      <a href="${verifyUrl}"
         style="display: inline-block; padding: 12px 24px; background-color: #1a1a2e; color: #ffffff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #666; font-size: 14px;">Or copy this link into your browser:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">This link expires in 24 hours.</p>
    </div>
  `;

  const text = `Welcome to BOQ AI!\n\nHi ${name},\n\nThank you for signing up. Please verify your email by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.`;

  const info = await transporter.sendMail({
    from: env.FROM_EMAIL,
    to,
    subject: 'Verify your email – BOQ AI',
    text,
    html,
  });

  console.log(`\n📧 Verification email sent to ${to}`);
  console.log(`   Preview URL (dev): ${nodemailer.getTestMessageUrl(info) || 'n/a'}`);
  console.log(`   Verify link: ${verifyUrl}\n`);
}
