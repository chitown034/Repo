import express from 'express';
import crypto from 'node:crypto';
import { db, STAGE_KEYS } from './db.js';
import { upsertContact, updateContact, changeStage, getContact, logActivity, serializeContact, CONTACT_FIELDS } from './contacts.js';
import { performance } from './metrics.js';
import { enroll } from './workflows.js';
import { WEBHOOK_EVENTS, assertPublicUrl, contactPayload } from './hooks.js';
import { token } from './util.js';

/* ------------------------------- API keys ------------------------------- */

const hash = (k) => crypto.createHash('sha256').update(k).digest('hex');

export function createApiKey(userId, name) {
  const key = `crm_${token(30)}`;
  const id = db.prepare('INSERT INTO api_keys (name, prefix, key_hash, user_id) VALUES (?, ?, ?, ?)').run(name || 'API key', key.slice(0, 10), hash(key), userId).lastInsertRowid;
  return { id: Number(id), key };
}

export function listApiKeys() {
  return db.prepare('SELECT k.id, k.name, k.prefix, k.last_used_at, k.revoked, k.created_at, u.name user_name FROM api_keys k LEFT JOIN users u ON u.id = k.user_id ORDER BY k.id DESC').all();
}

export function revokeApiKey(id) {
  db.prepare('UPDATE api_keys SET revoked = 1 WHERE id = ?').run(id);
}

/* ------------------------------ Public REST ------------------------------ */

export const publicApi = express.Router();
const rate = new Map();

publicApi.use((req, res, next) => {
  const raw = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || req.headers['x-api-key'];
  if (!raw) return res.status(401).json({ error: 'Missing API key (Authorization: Bearer crm_...)' });
  const row = db.prepare('SELECT k.*, u.id uid, u.role, u.name, u.active FROM api_keys k JOIN users u ON u.id = k.user_id WHERE k.key_hash = ? AND k.revoked = 0').get(hash(String(raw)));
  if (!row || !row.active) return res.status(401).json({ error: 'Invalid or revoked API key' });
  const now = Date.now();
  const hits = (rate.get(row.id) || []).filter((t) => now - t < 60_000);
  if (hits.length >= 300) return res.status(429).json({ error: 'Rate limit: 300 requests/minute' });
  rate.set(row.id, [...hits, now]);
  db.prepare(`UPDATE api_keys SET last_used_at = datetime('now') WHERE id = ?`).run(row.id);
  req.apiUser = { id: row.uid, role: row.role, name: row.name };
  next();
});

const seesAll = (u) => ['owner', 'admin'].includes(u.role);
function load(req, res) {
  const c = getContact(Number(req.params.id));
  if (!c || (!seesAll(req.apiUser) && c.owner_id !== req.apiUser.id)) {
    res.status(404).json({ error: 'Contact not found' });
    return null;
  }
  return c;
}
const clean = (body) => Object.fromEntries(Object.entries(body || {}).filter(([k]) => CONTACT_FIELDS.includes(k) || k === 'name'));

publicApi.get('/me', (req, res) => res.json({ user: req.apiUser }));
publicApi.get('/events', (_req, res) => res.json(Object.entries(WEBHOOK_EVENTS).map(([key, description]) => ({ key, description }))));

publicApi.get('/contacts', (req, res) => {
  const where = [seesAll(req.apiUser) ? '1=1' : `owner_id = ${Number(req.apiUser.id)}`];
  const p = [];
  if (req.query.q) { where.push(`(first_name || ' ' || COALESCE(last_name,'') LIKE ? OR email LIKE ? OR phone_norm LIKE ?)`); const l = `%${req.query.q}%`; p.push(l, l, l); }
  if (req.query.stage) { where.push('stage = ?'); p.push(req.query.stage); }
  if (req.query.email) { where.push('email_norm = ?'); p.push(String(req.query.email).toLowerCase()); }
  if (req.query.updated_since) { where.push('updated_at >= ?'); p.push(String(req.query.updated_since).replace('T', ' ').slice(0, 19)); }
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const rows = db.prepare(`SELECT * FROM contacts WHERE ${where.join(' AND ')} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...p, limit, Number(req.query.offset) || 0);
  res.json({ data: rows.map(contactPayload) });
});

publicApi.post('/contacts', (req, res) => {
  try {
    const body = clean(req.body);
    if (!seesAll(req.apiUser)) body.owner_id = req.apiUser.id;
    const r = upsertContact(body, { source: body.source || 'API', userId: req.apiUser.id });
    res.status(r.created ? 201 : 200).json({ created: r.created, data: contactPayload(r.contact) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

publicApi.get('/contacts/:id', (req, res) => {
  const c = load(req, res);
  if (c) res.json({ data: { ...contactPayload(c), facts: serializeContact(c).facts, score_reasons: serializeContact(c).score_reasons } });
});

publicApi.patch('/contacts/:id', (req, res) => {
  const c = load(req, res);
  if (!c) return;
  const body = clean(req.body);
  if (!seesAll(req.apiUser)) delete body.owner_id;
  res.json({ data: contactPayload(updateContact(c.id, body, { userId: req.apiUser.id })) });
});

publicApi.post('/contacts/:id/notes', (req, res) => {
  const c = load(req, res);
  if (!c) return;
  if (!req.body?.body) return res.status(400).json({ error: 'body is required' });
  logActivity(c.id, { type: 'note', body: String(req.body.body), userId: req.apiUser.id, meta: { via: 'api' } });
  res.status(201).json({ ok: true });
});

publicApi.post('/contacts/:id/stage', (req, res) => {
  const c = load(req, res);
  if (!c) return;
  if (!STAGE_KEYS.includes(req.body?.stage)) return res.status(400).json({ error: `stage must be one of ${STAGE_KEYS.join(', ')}` });
  res.json({ data: contactPayload(changeStage(c.id, req.body.stage, { userId: req.apiUser.id, reason: 'api' })) });
});

publicApi.post('/tasks', (req, res) => {
  if (!req.body?.title) return res.status(400).json({ error: 'title is required' });
  if (req.body.contact_id) {
    req.params.id = req.body.contact_id;
    if (!load(req, res)) return;
  }
  const id = db.prepare('INSERT INTO tasks (contact_id, user_id, title, due_at) VALUES (?, ?, ?, ?)').run(req.body.contact_id || null, req.apiUser.id, String(req.body.title).slice(0, 240), req.body.due_at || null).lastInsertRowid;
  res.status(201).json({ data: { id: Number(id) } });
});

publicApi.post('/workflows/:id/enroll', (req, res) => {
  const workflowId = Number(req.params.id);
  req.params.id = req.body?.contact_id;
  const c = load(req, res);
  if (!c) return;
  const runId = enroll(workflowId, c.id, { reason: 'api', force: true });
  res.status(runId ? 201 : 409).json(runId ? { data: { run_id: runId } } : { error: 'Already enrolled or workflow not found' });
});

publicApi.get('/metrics', (req, res) => {
  const m = performance({ days: Number(req.query.days) || 30, ownerId: seesAll(req.apiUser) ? (Number(req.query.owner_id) || null) : req.apiUser.id });
  res.json({ data: m });
});

/* REST hooks (Zapier "subscribe/unsubscribe" pattern) */
publicApi.post('/hooks', (req, res) => {
  if (!seesAll(req.apiUser)) return res.status(403).json({ error: 'Owner or admin key required' });
  try {
    assertPublicUrl(req.body?.url);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const events = (Array.isArray(req.body.events) ? req.body.events : [req.body.event]).filter((e) => e === '*' || WEBHOOK_EVENTS[e]);
  if (!events.length) return res.status(400).json({ error: `events must include one of: ${Object.keys(WEBHOOK_EVENTS).join(', ')}` });
  const secret = token(24);
  const id = db.prepare('INSERT INTO webhooks (url, events, secret, description) VALUES (?, ?, ?, ?)').run(req.body.url, JSON.stringify(events), secret, req.body.description || 'API subscription').lastInsertRowid;
  res.status(201).json({ data: { id: Number(id), url: req.body.url, events, secret } });
});

publicApi.delete('/hooks/:id', (req, res) => {
  if (!seesAll(req.apiUser)) return res.status(403).json({ error: 'Owner or admin key required' });
  db.prepare('DELETE FROM webhooks WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

publicApi.use((_req, res) => res.status(404).json({ error: 'Not found' }));

/* ------------------------------ Calendar feed ------------------------------ */

const icsEscape = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
// SQL timestamps ("YYYY-MM-DD HH:MM:SS") are UTC; browser datetime-local values ("YYYY-MM-DDTHH:MM") are server-local.
const parseDue = (v) => (v.includes('T') ? new Date(v) : new Date(`${v.replace(' ', 'T')}Z`));
const icsDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** iCalendar feed of a user's open tasks and appointments (subscribe from Google/Outlook/Apple Calendar). */
export function calendarIcs(userId, appUrl) {
  const tasks = db
    .prepare(`SELECT t.*, c.first_name, c.last_name, c.phone_norm FROM tasks t LEFT JOIN contacts c ON c.id = t.contact_id WHERE t.user_id = ? AND t.done = 0 AND t.due_at IS NOT NULL AND t.due_at >= datetime('now','-30 days') ORDER BY t.due_at LIMIT 500`)
    .all(userId);
  const now = icsDate(new Date());
  const events = tasks.map((t) => {
    const due = parseDue(t.due_at);
    const start = icsDate(due);
    const end = icsDate(new Date(due.getTime() + 30 * 60_000));
    const who = [t.first_name, t.last_name].filter(Boolean).join(' ');
    return ['BEGIN:VEVENT', `UID:task-${t.id}@mortgage-crm`, `DTSTAMP:${now}`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${icsEscape((t.kind === 'appointment' ? '📅 ' : '✅ ') + t.title + (who ? ` - ${who}` : ''))}`, `DESCRIPTION:${icsEscape([t.phone_norm && `Phone: ${t.phone_norm}`, t.contact_id && `${appUrl}/#/contacts/${t.contact_id}`].filter(Boolean).join('\n'))}`, 'END:VEVENT'].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mortgage Lead CRM//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:CRM Tasks', ...events, 'END:VCALENDAR'].join('\r\n');
}

