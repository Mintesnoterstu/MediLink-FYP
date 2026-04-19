import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Development fallback prints payload to logs.
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const transporter = createTransporter();

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const from = process.env.MAIL_FROM || 'no-reply@medilink.local';
  const subject = 'MediLink Password Reset';
  const text = `Reset your password using this link: ${resetUrl}\nThis link expires in 30 minutes.`;

  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    text,
  });

  logger.info('Password reset email queued', {
    to: toEmail,
    transport: info?.messageId ? 'smtp' : 'json',
  });
}

