import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Initialize Resend SDK if RESEND_API_KEY is present
const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!env.smtpConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
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
  const fromAddress = env.smtp.fromEmail || 'onboarding@resend.dev';

  // ------------------------------------------------------------------
  // 1. PRIMARY PATH: Resend HTTP API (Port 443 — bypasses host blocks)
  // ------------------------------------------------------------------
  if (resend) {
    try {
      logger.info('Sending email via Resend HTTP API...', { to, subject });

      const { data, error } = await resend.emails.send({
        from: `Marginalia <${fromAddress}>`,
        to: [to],
        subject,
        html,
      });

      if (error) {
        throw new Error(`Resend API Error: ${error.message}`);
      }

      logger.info('Email sent successfully via Resend', { id: data?.id, to });
      return true;
    } catch (error) {
      logger.warn('Resend HTTP API failed — attempting SMTP fallback', { error, to, subject });
    }
  }

  // ------------------------------------------------------------------
  // 2. FALLBACK PATH: Nodemailer SMTP
  // ------------------------------------------------------------------
  const t = getTransporter();
  if (!t) {
    logger.warn('Neither Resend nor SMTP is configured — skipping email send.', { to, subject });
    return false;
  }

  try {
    logger.info('Sending email via Nodemailer SMTP...', { to, subject });
    await t.sendMail({ from: `Marginalia <${fromAddress}>`, to, subject, html });
    logger.info('Email sent successfully via Nodemailer SMTP', { to });
    return true;
  } catch (error) {
    logger.error('Failed to send email via both Resend and SMTP', { error, to, subject });
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