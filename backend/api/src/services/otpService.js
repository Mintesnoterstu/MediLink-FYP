import crypto from 'crypto';

const TTL_MS = 10 * 60 * 1000;
const store = new Map(); // userId -> { hash, expiresAt }

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

export function createOtp(userId) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  store.set(String(userId), { hash: hashOtp(otp), expiresAt: Date.now() + TTL_MS });
  return otp;
}

export function verifyOtp(userId, otp) {
  const rec = store.get(String(userId));
  if (!rec) return false;
  if (Date.now() > rec.expiresAt) {
    store.delete(String(userId));
    return false;
  }
  const ok = rec.hash === hashOtp(otp);
  if (ok) store.delete(String(userId));
  return ok;
}

