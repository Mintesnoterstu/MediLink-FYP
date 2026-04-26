import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import { withMedilinkSession } from '../config/database.js';

function normalizeEnvValue(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  // Remove surrounding single/double quotes if present.
  return raw.replace(/^['"]|['"]$/g, '').trim();
}

function readMailConfig() {
  const host = normalizeEnvValue(process.env.SMTP_HOST);
  const port = Number(process.env.SMTP_PORT || 587);
  const user = normalizeEnvValue(process.env.SMTP_USER).toLowerCase();
  // Gmail app passwords are often copied with spaces (xxxx xxxx xxxx xxxx).
  // Normalize here so authentication works with either format.
  const pass = normalizeEnvValue(process.env.SMTP_PASS).replace(/\s+/g, '');
  const from = normalizeEnvValue(process.env.MAIL_FROM) || user || 'no-reply@medilink.local';
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
const smtpState = {
  checked: false,
  verified: false,
  lastError: null,
};

async function verifySmtpConnection() {
  if (!transporter || transportMode !== 'smtp') return;
  try {
    await transporter.verify();
    smtpState.checked = true;
    smtpState.verified = true;
    smtpState.lastError = null;
    logger.info('SMTP connection verified successfully', { mode: transportMode });
  } catch (error) {
    smtpState.checked = true;
    smtpState.verified = false;
    smtpState.lastError = String(error?.message || error);
    logger.warn('SMTP verification failed', { error: smtpState.lastError, mode: transportMode });
  }
}

// Fire-and-forget startup check so UI status reflects auth failures.
void verifySmtpConnection();

export function getEmailStatus() {
  if (transportMode === 'smtp') {
    if (smtpState.checked && !smtpState.verified) {
      return {
        mode: 'smtp',
        configured: false,
        message: `SMTP authentication failed: ${smtpState.lastError}`,
      };
    }
    return {
      mode: 'smtp',
      configured: true,
      message: smtpState.verified
        ? 'SMTP is configured for real-time email delivery.'
        : 'SMTP is configured. Verifying credentials...',
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

async function createEmailLog({
  toEmail,
  recipientName,
  recipientRole,
  emailType,
  subject,
  content,
}) {
  if (!toEmail) return null;
  try {
    const inserted = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const r = await client.query(
        `
        INSERT INTO email_logs (
          recipient_email, recipient_name, recipient_role, email_type,
          subject, content, status, sent_at, error_message
        )
        VALUES ($1,$2,$3,$4,$5,$6,'pending',NULL,NULL)
        RETURNING id
      `,
        [toEmail, recipientName || null, recipientRole || null, emailType, subject, content],
      );
      return r.rows[0];
    });
    return inserted?.id || null;
  } catch (e) {
    logger.warn('Failed to create email_logs record', { to: toEmail, emailType, error: String(e?.message || e) });
    return null;
  }
}

async function updateEmailLog(id, patch) {
  if (!id) return;
  const { status, sentAt, errorMessage } = patch || {};
  try {
    await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      await client.query(
        `
        UPDATE email_logs
        SET status = COALESCE($2, status),
            sent_at = COALESCE($3, sent_at),
            error_message = $4
        WHERE id = $1
      `,
        [id, status || null, sentAt || null, errorMessage ?? null],
      );
    });
  } catch (e) {
    logger.warn('Failed to update email_logs record', { id, error: String(e?.message || e) });
  }
}

async function sendAndLogEmail({
  toEmail,
  recipientName,
  recipientRole,
  emailType,
  subject,
  text,
}) {
  const from = mailer.from;
  const logId = await createEmailLog({
    toEmail,
    recipientName,
    recipientRole,
    emailType,
    subject,
    content: text,
  });

  try {
    // Do not block core workflows if SMTP isn't configured.
    // We still persist the email content and mark it failed.
    if (!transporter) {
      await updateEmailLog(logId, {
        status: 'failed',
        sentAt: null,
        errorMessage: 'SMTP is not configured (missing SMTP_HOST/SMTP_USER/SMTP_PASS)',
      });
      return { transport: transportMode, messageId: null, emailLogId: logId };
    }
    const info = await transporter.sendMail({ from, to: toEmail, subject, text });
    if (!smtpState.verified) {
      smtpState.checked = true;
      smtpState.verified = true;
      smtpState.lastError = null;
    }
    await updateEmailLog(logId, { status: 'sent', sentAt: new Date(), errorMessage: null });
    return { transport: transportMode, messageId: info?.messageId || null, emailLogId: logId };
  } catch (e) {
    smtpState.checked = true;
    smtpState.verified = false;
    smtpState.lastError = String(e?.message || e);
    await updateEmailLog(logId, { status: 'failed', sentAt: null, errorMessage: String(e?.message || e) });
    throw e;
  }
}

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const subject = 'MediLink Password Reset';
  const text = `Reset your password using this link: ${resetUrl}\nThis link expires in 30 minutes.`;
  await sendAndLogEmail({
    toEmail,
    recipientName: null,
    recipientRole: null,
    emailType: 'password_reset',
    subject,
    text,
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
Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

You will be required to change your password on first login.

For password recovery, use: ${recoveryEmail}

Thank you,
MediLink Team - Jimma Zone`;
  const info = await sendAndLogEmail({
    toEmail,
    recipientName: adminName,
    recipientRole: 'admin',
    emailType: 'account_creation',
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
Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

You will be required to change your password on first login.

For password recovery, use: ${recoveryEmail}

Thank you,
MediLink Team - ${areaName}`;
  const info = await sendAndLogEmail({
    toEmail,
    recipientName: adminName,
    recipientRole: 'facility_admin',
    emailType: 'account_creation',
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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Your MediLink Doctor Account Has Been Created';
  const text = `Dear Dr. ${doctorName},

You have been appointed as a Doctor at ${facilityName}.

Login Credentials:
Email: ${toEmail}
Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

You will be required to change your password on first login.

For password recovery, use your recovery email.

Thank you,
MediLink Team - ${facilityName}`;
  const info = await sendAndLogEmail({
    toEmail,
    recipientName: doctorName,
    recipientRole: 'doctor',
    emailType: 'account_creation',
    subject,
    text,
  });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendNurseAccountCreatedEmail({
  toEmail,
  nurseName,
  facilityName,
  temporaryPassword,
}) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Your MediLink Nurse Account Has Been Created';
  const text = `Dear Nurse ${nurseName},

You have been appointed as a Nurse at ${facilityName}.

Login Credentials:
Email: ${toEmail}
Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

You will be required to change your password on first login.

For password recovery, use your recovery email.

Thank you,
MediLink Team - ${facilityName}`;

  const info = await sendAndLogEmail({
    toEmail,
    recipientName: nurseName,
    recipientRole: 'nurse',
    emailType: 'account_creation',
    subject,
    text,
  });
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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Your MediLink Patient Account Has Been Created';
  const text = `Dear ${patientName},

Your MediLink account has been created at ${facilityName}.

Your Ethiopian Health ID: ${ethiopianHealthId}
Password: ${temporaryPassword}

Login URL: ${frontendUrl}/login

IMPORTANT:
- You must change your password on first login
- You can view your medical records (read only)
- You control which doctors can access your data
- You cannot edit your personal information

Thank you,
MediLink Team`;

  const info = await sendAndLogEmail({
    toEmail,
    recipientName: patientName,
    recipientRole: 'patient',
    emailType: 'account_creation',
    subject,
    text,
  });
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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = `${doctorName} Requested Access to Your Medical Records`;
  const text = `Dear ${patientName},

${doctorName} from ${facilityName} has requested access to your medical records.

Reason: ${reason || 'Clinical care'}

Please log in to your MediLink account to grant or deny this request.

Login URL: ${frontendUrl}/login

Thank you,
MediLink Team`;
  const info = await sendAndLogEmail({
    toEmail,
    recipientName: patientName,
    recipientRole: 'patient',
    emailType: 'consent_request',
    subject,
    text,
  });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendConsentGrantedEmailToProfessional({
  toEmail,
  doctorName,
  patientName,
  scope,
  expiresAt,
  dashboardLink,
}) {
  if (!toEmail) return { transport: 'none', messageId: null };
  const subject = `${patientName} Granted You Access to Their Medical Records`;
  const text = `Dear Dr. ${doctorName},

${patientName} has granted you access to their medical records.

Access Scope: ${scope}
Expires: ${expiresAt}

You can now view their records from your dashboard.
${dashboardLink ? `Direct Link: ${dashboardLink}` : ''}

Thank you,
MediLink Team`;
  const info = await sendAndLogEmail({
    toEmail,
    recipientName: doctorName,
    recipientRole: 'doctor',
    emailType: 'consent_granted',
    subject,
    text,
  });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendAutoRevokeEmailToPatient({
  toEmail,
  patientName,
  doctorName,
}) {
  if (!toEmail) return { transport: 'none', messageId: null };
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = `${doctorName} Updated Your Medical Record`;
  const text = `Dear ${patientName},

Dr. ${doctorName} has updated your medical record.

Their access has been temporarily revoked until you approve these changes.

Please log in to review and approve or dispute the changes.

Login URL: ${frontendUrl}/login

Thank you,
MediLink Team`;
  const info = await sendAndLogEmail({
    toEmail,
    recipientName: patientName,
    recipientRole: 'patient',
    emailType: 'record_updated',
    subject,
    text,
  });
  return { transport: transportMode, messageId: info?.messageId || null };
}

export async function sendChangeApprovedEmailToProfessional({
  toEmail,
  doctorName,
  patientName,
  dashboardLink,
}) {
  if (!toEmail) return { transport: 'none', messageId: null };
  const subject = `${patientName} Approved Your Changes`;
  const text = `Dear Dr. ${doctorName},

${patientName} has approved the changes you made to their medical record.

Your access has been restored.
${dashboardLink ? `\nDirect Link: ${dashboardLink}` : ''}

Thank you,
MediLink Team`;
  const info = await sendAndLogEmail({
    toEmail,
    recipientName: doctorName,
    recipientRole: 'doctor',
    emailType: 'change_approved',
    subject,
    text,
  });
  return { transport: transportMode, messageId: info?.messageId || null };
}

