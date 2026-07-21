import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!env.smtpConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailInput): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    logger.warn('SMTP is not configured — skipping email send. Set SMTP_HOST/SMTP_USER/SMTP_PASS in .env to enable.', {
      to,
      subject,
    });
    return false;
  }

  try {
    await t.sendMail({ from: env.smtp.fromEmail, to, subject, html });
    return true;
  } catch (error) {
    logger.error('Failed to send email', { error, to, subject });
    return false;
  }
}

export function verificationEmailHtml(name: string, verifyUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Welcome to Marginalia, ${name}</h2>
      <p>Please verify your email address to activate your account.</p>
      <p><a href="${verifyUrl}" style="background:#C9932E;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;">Verify email</a></p>
      <p>If the button doesn't work, copy this link: ${verifyUrl}</p>
    </div>`;
}

export function resetPasswordEmailHtml(name: string, resetUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>Hi ${name}, click below to reset your Marginalia password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="background:#C9932E;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;">Reset password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>`;
}

export function reminderEmailHtml(name: string, noteTitle: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Reminder: ${noteTitle}</h2>
      <p>Hi ${name}, this is a reminder for your note "${noteTitle}" in Marginalia.</p>
    </div>`;
}
