import crypto from 'node:crypto';
import { db } from './db.js';
import { token, sqlNow } from './util.js';

const SESSION_DAYS = 30;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export function createSession(userId) {
  const t = token(32);
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(t, userId, sqlNow(SESSION_DAYS * 86_400_000));
  return t;
}

export function destroySession(t) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(t);
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function sessionCookie(t, req) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  return `crm_session=${t}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}

export function publicUser(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

export function authenticate(req, _res, next) {
  const t = readCookie(req, 'crm_session');
  if (t) {
    const row = db
      .prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > datetime('now') AND u.active = 1`)
      .get(t);
    if (row) {
      req.user = publicUser(row);
      req.sessionToken = t;
    }
  }
  next();
}

export function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not signed in' });
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not signed in' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission to do that' });
    next();
  };
}

/** Members only see contacts assigned to them; owners and admins see the whole pipeline. */
export function canSeeAll(user) {
  return user.role === 'owner' || user.role === 'admin';
}

export function contactScope(user, alias = 'c') {
  return canSeeAll(user) ? { sql: '1=1', params: [] } : { sql: `${alias}.owner_id = ?`, params: [user.id] };
}
