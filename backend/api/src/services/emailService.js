import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

function readMailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || user || 'no-reply@medilink.local';
  return { host, port, user, pass, from };
}

function hasSmtpConfig() {
  const cfg = readMailConfig();
  return Boolean(cfg.host && cfg.user && cfg.pass);
}

function createTransporter() {
  const cfg = readMailConfig();
  const forceJsonFallback = String(process.env.ALLOW_JSON_EMAIL_FALLBACK || '').toLowerCase() === 'true';
  if (!hasSmtpConfig() && forceJsonFallback) {
    return {
      transporter: nodemailer.createTransport({ jsonTransport: true }),
      mode: 'json',
      ...cfg,
    };
  }

  if (!hasSmtpConfig()) {
    return {
      transporter: null,
      mode: 'none',
      ...cfg,
    };
  }

  return {
    transporter: nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    }),
    mode: 'smtp',
    ...cfg,
  };
}

const mailer = createTransporter();
const transporter = mailer.transporter;
const transportMode = mailer.mode;

export function getEmailStatus() {
  if (transportMode === 'smtp') {
    return {
      mode: 'smtp',
      configured: true,
      message: 'SMTP is configured for real-time email delivery.',
    };
  }

  if (transportMode === 'json') {
    return {
      mode: 'json',
      configured: false,
      message: 'SMTP is not configured. Dev JSON fallback is active.',
    };
  }

  return {
    mode: 'none',
    configured: false,
    message: 'SMTP is not configured. Configure SMTP_* values in .env.',
  };
}

async function assertEmailReady() {
  if (!transporter) {
    const err = new Error('Email service is not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS.');
    err.status = 503;
    throw err;
  }
}

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  await assertEmailReady();
  const from = mailer.from;
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
    transport: transportMode,
  });
}

export async function sendAdminAccountCreatedEmail({
  toEmail,
  adminName,
  roleLabel,
  areaName,
  temporaryPassword,
  recoveryEmail,
}) {
  await assertEmailReady();
  const from = mailer.from;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Your MediLink Admin Account Has Been Created';
  const text = `Dear ${adminName},

You have been appointed as ${roleLabel} for ${areaName}.

Login Credentials:
Email: ${toEmail}
Temporary Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

You will be required to change your password on first login.

For password recovery, use: ${recoveryEmail}

Thank you,
MediLink Team - Jimma Zone`;

  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    text,
  });

  logger.info('Admin account email queued', {
    to: toEmail,
    roleLabel,
    areaName,
    transport: transportMode,
  });

  return {
    transport: transportMode,
    messageId: info?.messageId || null,
  };
}

export async function sendFacilityAdminAccountCreatedEmail({
  toEmail,
  adminName,
  facilityName,
  temporaryPassword,
  recoveryEmail,
  areaName,
}) {
  await assertEmailReady();
  const from = mailer.from;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Your MediLink Facility Admin Account Has Been Created';
  const text = `Dear ${adminName},

You have been appointed as Facility Admin for ${facilityName}.

Login Credentials:
Email: ${toEmail}
Temporary Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

You will be required to change your password on first login.

For password recovery, use: ${recoveryEmail}

Thank you,
MediLink Team - ${areaName}`;

  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    text,
  });

  logger.info('Facility admin account email queued', {
    to: toEmail,
    facilityName,
    areaName,
    transport: transportMode,
  });

  return {
    transport: transportMode,
    messageId: info?.messageId || null,
  };
}

export async function sendDoctorAccountCreatedEmail({
  toEmail,
  doctorName,
  facilityName,
  temporaryPassword,
}) {
  await assertEmailReady();
  const from = mailer.from;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Your MediLink Doctor Account Has Been Created';
  const text = `Dear Dr. ${doctorName},

You have been appointed as a Doctor at ${facilityName}.

Login Credentials:
Email: ${toEmail}
Temporary Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

You will be required to change your password on first login.

For password recovery, use your recovery email.

Thank you,
MediLink Team - ${facilityName}`;

  const info = await transporter.sendMail({ from, to: toEmail, subject, text });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendNurseAccountCreatedEmail({
  toEmail,
  nurseName,
  facilityName,
  temporaryPassword,
}) {
  await assertEmailReady();
  const from = mailer.from;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Your MediLink Nurse Account Has Been Created';
  const text = `Dear Nurse ${nurseName},

You have been appointed as a Nurse at ${facilityName}.

Login Credentials:
Email: ${toEmail}
Temporary Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

You will be required to change your password on first login.

For password recovery, use your recovery email.

Thank you,
MediLink Team - ${facilityName}`;

  const info = await transporter.sendMail({ from, to: toEmail, subject, text });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendPatientRegistrationEmail({
  toEmail,
  patientName,
  facilityName,
  ethiopianHealthId,
  temporaryPassword,
}) {
  if (!toEmail) return { transport: 'none', messageId: null };
  await assertEmailReady();
  const from = mailer.from;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Your MediLink Patient Account Has Been Created';
  const text = `Dear ${patientName},

Your MediLink account has been created at ${facilityName}.

Your Ethiopian Health ID: ${ethiopianHealthId}
Temporary Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

IMPORTANT:
- You must change your password on first login
- You can view your medical records (read only)
- You control which doctors can access your data
- You cannot edit your personal information

Thank you,
MediLink Team`;

  const info = await transporter.sendMail({ from, to: toEmail, subject, text });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendConsentRequestEmailToPatient({
  toEmail,
  patientName,
  doctorName,
  facilityName,
  reason,
}) {
  if (!toEmail) return { transport: 'none', messageId: null };
  await assertEmailReady();
  const from = mailer.from;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = `${doctorName} Requested Access to Your Medical Records`;
  const text = `Dear ${patientName},

${doctorName} from ${facilityName} has requested access to your medical records.

Reason: ${reason || 'Clinical care'}

Please log in to your MediLink account to grant or deny this request.

Login URL: ${frontendUrl}/login

Thank you,
MediLink Team`;
  const info = await transporter.sendMail({ from, to: toEmail, subject, text });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendConsentGrantedEmailToProfessional({
  toEmail,
  doctorName,
  patientName,
  scope,
  expiresAt,
}) {
  if (!toEmail) return { transport: 'none', messageId: null };
  await assertEmailReady();
  const from = mailer.from;
  const subject = `${patientName} Granted You Access to Their Medical Records`;
  const text = `Dear Dr. ${doctorName},

${patientName} has granted you access to their medical records.

Access Scope: ${scope}
Expires: ${expiresAt}

You can now view their records from your dashboard.

Thank you,
MediLink Team`;
  const info = await transporter.sendMail({ from, to: toEmail, subject, text });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendAutoRevokeEmailToPatient({
  toEmail,
  patientName,
  doctorName,
}) {
  if (!toEmail) return { transport: 'none', messageId: null };
  await assertEmailReady();
  const from = mailer.from;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = `${doctorName} Updated Your Medical Record`;
  const text = `Dear ${patientName},

Dr. ${doctorName} has updated your medical record.

Their access has been temporarily revoked until you approve these changes.

Please log in to review and approve or dispute the changes.

Login URL: ${frontendUrl}/login

Thank you,
MediLink Team`;
  const info = await transporter.sendMail({ from, to: toEmail, subject, text });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendChangeApprovedEmailToProfessional({
  toEmail,
  doctorName,
  patientName,
}) {
  if (!toEmail) return { transport: 'none', messageId: null };
  await assertEmailReady();
  const from = mailer.from;
  const subject = `${patientName} Approved Your Changes`;
  const text = `Dear Dr. ${doctorName},

${patientName} has approved the changes you made to their medical record.

Your access has been restored.

Thank you,
MediLink Team`;
  const info = await transporter.sendMail({ from, to: toEmail, subject, text });
  return { transport: transportMode, messageId: info?.messageId || null };
}

