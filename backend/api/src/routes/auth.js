import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Joi from 'joi';
import { validateBody } from '../middleware/validation.js';
import { query } from '../config/database.js';
import { sendOtpSms } from '../services/smsService.js';
import { authRequired } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const router = Router();
const OTP_TTL_MINUTES = 10;
const RESET_TTL_MINUTES = 30;

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function generateSixDigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

const loginSchema = Joi.object({
  // Backward compatible with frontend: { email, password }
  // Also supports: { identifier, password } or { phone, password }
  email: Joi.string().email({ tlds: { allow: false } }),
  phone: Joi.string().min(8),
  identifier: Joi.string().min(3),
  password: Joi.string().min(6).required(),
}).or('email', 'phone', 'identifier');

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { password } = req.validatedBody;
    const identifier = req.validatedBody.identifier || req.validatedBody.email || req.validatedBody.phone;
    const isEmail = String(identifier).includes('@');
    const result = await query(
      `SELECT * FROM users WHERE ${isEmail ? 'email' : 'phone'} = $1 AND is_active = true`,
      [identifier],
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If 2FA enabled, issue a short-lived challenge token and send OTP via SMS.
    if (user.two_factor_enabled) {
      if (!user.phone) {
        return res.status(400).json({ error: '2FA enabled but user has no phone number' });
      }

      const otp = generateSixDigitOtp();
      const otpHash = sha256(otp);
      await query(
        `
        INSERT INTO auth_otp_codes (user_id, otp_hash, channel, expires_at)
        VALUES ($1, $2, 'sms', now() + ($3 || ' minutes')::interval)
      `,
        [user.id, otpHash, String(OTP_TTL_MINUTES)],
      );
      await sendOtpSms(user.phone, otp);
      const challengeToken = jwt.sign(
        { sub: user.id, role: user.role, purpose: '2fa' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' },
      );

      await query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);

      return res.json({
        requires2fa: true,
        challengeToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          phone: user.phone,
        },
      });
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    await query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
});

const verify2faSchema = Joi.object({
  challengeToken: Joi.string().required(),
  otp: Joi.string().length(6).required(),
});

router.post('/verify-2fa', validateBody(verify2faSchema), async (req, res, next) => {
  try {
    const { challengeToken, otp } = req.validatedBody;
    const payload = jwt.verify(challengeToken, process.env.JWT_SECRET);
    if (payload.purpose !== '2fa') {
      return res.status(400).json({ error: 'Invalid 2FA challenge token' });
    }

    const otpHash = sha256(otp);
    const otpRes = await query(
      `
      UPDATE auth_otp_codes
      SET consumed_at = now()
      WHERE id = (
        SELECT id
        FROM auth_otp_codes
        WHERE user_id = $1
          AND otp_hash = $2
          AND consumed_at IS NULL
          AND expires_at > now()
        ORDER BY created_at DESC
        LIMIT 1
      )
      RETURNING id
    `,
      [payload.sub, otpHash],
    );
    if (!otpRes.rows[0]) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    const userRes = await query('SELECT id, email, full_name, role FROM users WHERE id = $1', [
      payload.sub,
    ]);
    const user = userRes.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/logout', (req, res) => {
  return res.json({ success: true });
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
});

router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.validatedBody;
    const userRes = await query(
      'SELECT id, email FROM users WHERE email = $1 AND is_active = true LIMIT 1',
      [email],
    );
    const user = userRes.rows[0];

    // Privacy-safe response regardless of existence
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email exists, a password reset link has been sent.',
      });
    }

    const resetToken = generateResetToken();
    const tokenHash = sha256(resetToken);
    await query(
      `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, now() + ($3 || ' minutes')::interval)
    `,
      [user.id, tokenHash, String(RESET_TTL_MINUTES)],
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    const payload = {
      success: true,
      message: 'If that email exists, a password reset link has been sent.',
    };
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      payload.devResetToken = resetToken;
    }
    return res.json(payload);
  } catch (err) {
    return next(err);
  }
});

const resetPasswordSchema = Joi.object({
  // Compatibility mode for frontend authService.resetPassword(email)
  email: Joi.string().email({ tlds: { allow: false } }),
  token: Joi.string().min(16),
  newPassword: Joi.string().min(6),
}).xor('email', 'token');

router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, newPassword, email } = req.validatedBody;
    if (email && !token) {
      const userRes = await query(
        'SELECT id, email FROM users WHERE email = $1 AND is_active = true LIMIT 1',
        [email],
      );
      const user = userRes.rows[0];
      if (user) {
        const resetToken = generateResetToken();
        const tokenHashCompat = sha256(resetToken);
        await query(
          `
          INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
          VALUES ($1, $2, now() + ($3 || ' minutes')::interval)
        `,
          [user.id, tokenHashCompat, String(RESET_TTL_MINUTES)],
        );
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(user.email, resetUrl);
      }
      return res.json({
        success: true,
        message: 'If that email exists, a password reset link has been sent.',
      });
    }
    const tokenHash = sha256(token);

    const tokenRes = await query(
      `
      UPDATE password_reset_tokens
      SET consumed_at = now()
      WHERE id = (
        SELECT id
        FROM password_reset_tokens
        WHERE token_hash = $1
          AND consumed_at IS NULL
          AND expires_at > now()
        ORDER BY created_at DESC
        LIMIT 1
      )
      RETURNING user_id
    `,
      [tokenHash],
    );

    const row = tokenRes.rows[0];
    if (!row) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $2 WHERE id = $1', [row.user_id, newHash]);

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

const registerSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  phone: Joi.string().min(8).optional(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('patient', 'doctor', 'nurse').default('patient'),
});

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, phone, password, name, role } = req.validatedBody;
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await query(
      `
      INSERT INTO users (email, phone, password_hash, full_name, role, two_factor_enabled, is_active)
      VALUES ($1,$2,$3,$4,$5,false,true)
      RETURNING id, email, full_name, role
    `,
      [email, phone || null, passwordHash, name, role],
    );
    const user = created.rows[0];
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
});

router.patch('/users/:userId', authRequired, async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    if (req.user.id !== targetUserId) {
      return res.status(403).json({ error: 'Cannot update another user profile' });
    }
    const { name, language } = req.body || {};
    const r = await query(
      `
      UPDATE users
      SET full_name = COALESCE($2, full_name)
      WHERE id = $1
      RETURNING id, email, full_name, role
    `,
      [targetUserId, name || null],
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'User not found' });
    return res.json({
      id: r.rows[0].id,
      email: r.rows[0].email,
      name: r.rows[0].full_name,
      role: r.rows[0].role,
      language: language || 'en',
    });
  } catch (err) {
    return next(err);
  }
});

export default router;

