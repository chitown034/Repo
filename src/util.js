import crypto from 'node:crypto';

export function normalizePhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  if (digits.length !== 10) return digits.length ? `+${digits}` : null;
  return `+1${digits}`;
}

export function formatPhone(e164) {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164 || '');
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164 || '';
}

export function normalizeEmail(raw) {
  if (!raw) return null;
  const e = String(raw).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

export function titleCase(s) {
  if (!s) return s;
  const str = String(s).trim();
  if (str !== str.toUpperCase() && str !== str.toLowerCase()) return str;
  return str.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

export function toNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[$,%\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function toDateISO(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function token(bytes = 24) {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** SQLite-compatible UTC timestamp: 'YYYY-MM-DD HH:MM:SS' */
export function sqlNow(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString().replace('T', ' ').slice(0, 19);
}

export function daysSince(ts) {
  if (!ts) return Infinity;
  const t = new Date(ts.includes('T') ? ts : `${ts.replace(' ', 'T')}Z`).getTime();
  return (Date.now() - t) / 86_400_000;
}

export function render(template, vars) {
  return String(template || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars[k] ?? '').toString());
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Minutes since midnight in the given IANA timezone. */
export function localMinutes(timezone, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === 'hour').value) % 24;
  const m = Number(parts.find((p) => p.type === 'minute').value);
  return h * 60 + m;
}

function hhmm(s) {
  const [h, m] = String(s).split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Quiet hours protect contacts from automated texts late at night (TCPA best practice). */
export function inQuietHours(timezone, quietStart, quietEnd, date = new Date()) {
  const now = localMinutes(timezone, date);
  const start = hhmm(quietStart);
  const end = hhmm(quietEnd);
  return start > end ? now >= start || now < end : now >= start && now < end;
}

/** Milliseconds until quiet hours end (0 when not in quiet hours). */
export function msUntilQuietEnds(timezone, quietStart, quietEnd, date = new Date()) {
  if (!inQuietHours(timezone, quietStart, quietEnd, date)) return 0;
  const now = localMinutes(timezone, date);
  let diff = hhmm(quietEnd) - now;
  if (diff <= 0) diff += 1440;
  return diff * 60_000;
}

export function fullName(c) {
  return [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email || c.phone || `Contact #${c.id}`;
}
