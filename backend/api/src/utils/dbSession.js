import { withMedilinkSession } from '../config/database.js';

export async function withRequestSession(req, fn) {
  const user = req.user;
  if (!user) {
    // unauthenticated: treat as service_role is NOT allowed; use empty role
    return withMedilinkSession({ userId: null, role: 'anonymous' }, fn);
  }
  return withMedilinkSession({ userId: user.id, role: user.role }, fn);
}

