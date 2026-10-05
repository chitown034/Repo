import express from 'express';
import { db, getSettings, publicSettings, setSetting, SETTING_KEYS, STAGES, STAGE_KEYS, json, tx } from './db.js';
import { hashPassword, verifyPassword, createSession, destroySession, sessionCookie, requireUser, requireRole, canSeeAll, contactScope, publicUser } from './auth.js';
import { upsertContact, updateContact, changeStage, getContact, logActivity, serializeContact, CONTACT_FIELDS } from './contacts.js';
import { parseCSV, autoMap, toCSV } from './csv.js';
import { rescoreAll, rescoreContact } from './scoring.js';
import { proposeOutreach, approveDraft, rejectDraft, scanForOutreach, handleInbound, sendManual } from './assistant.js';
import { startCall, providerStatus, SendBlocked, APP_URL, signId } from './messaging.js';
import { TRIGGERS, previewAudience, launchCampaign, campaignStats } from './campaigns.js';
import { generateCampaignCopy, aiEnabled } from './ai.js';
import { buildMonthlyReport, previousPeriod } from './reports.js';
import { emit } from './events.js';
import { enrichContact, enrichmentStatus } from './enrichment.js';
import { listDrops, saveDrop, deleteDrop, dropVoicemail, dropMany } from './voicemail.js';
import QRCode from 'qrcode';
import { performance } from './metrics.js';
import { WF_TRIGGERS, STEP_TYPES, CONDITION_FIELDS, RECIPES, installRecipe, enroll, workflowStats, validateSteps, exitRuns } from './workflows.js';
import { WEBHOOK_EVENTS, slackNotify, processDeliveries, webhookStats, assertPublicUrl } from './hooks.js';
import { nextBestActions, coachBriefing, generateContent, CONTENT_KINDS, publishContent, copilotTurn, listThreads, getThread, findOpportunities } from './agents.js';
import { createApiKey, listApiKeys, revokeApiKey } from './publicapi.js';
import { token } from './util.js';
import { googleAuthUrl, googleStatus, googleDisconnect, syncGoogle, fubStatus, syncFollowUpBoss, inboundKey, lastRuns } from './integrations.js';

export const api = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ----------------------------- Auth & setup ----------------------------- */

api.get('/setup-status', (_req, res) => {
  res.json({ needsSetup: db.prepare('SELECT COUNT(*) n FROM users').get().n === 0 });
});

api.post('/setup', (req, res) => {
  if (db.prepare('SELECT COUNT(*) n FROM users').get().n > 0) return res.status(400).json({ error: 'Already set up' });
  const { name, email, password, company_name } = req.body || {};
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email, and a password of 8+ characters are required' });
  const r = db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'owner')`).run(name.trim(), email.trim().toLowerCase(), hashPassword(password));
  if (company_name) setSetting('company_name', company_name.trim());
  setSetting('loan_officer_name', name.trim());
  const t = createSession(Number(r.lastInsertRowid));
  res.setHeader('Set-Cookie', sessionCookie(t, req));
  res.json({ ok: true });
});

const loginAttempts = new Map();
api.post('/login', (req, res) => {
  const ip = req.ip;
  const a = loginAttempts.get(ip) || { n: 0, t: Date.now() };
  if (Date.now() - a.t > 15 * 60_000) Object.assign(a, { n: 0, t: Date.now() });
  if (a.n >= 10) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  const { email, password } = req.body || {};
  const u = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(String(email || '').trim().toLowerCase());
  if (!u || !verifyPassword(String(password || ''), u.password_hash)) {
    a.n++;
    loginAttempts.set(ip, a);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  loginAttempts.delete(ip);
  res.setHeader('Set-Cookie', sessionCookie(createSession(u.id), req));
  res.json({ user: publicUser(u) });
});

api.post('/logout', (req, res) => {
  if (req.sessionToken) destroySession(req.sessionToken);
  res.setHeader('Set-Cookie', 'crm_session=; Path=/; Max-Age=0');
  res.json({ ok: true });
});

api.use(requireUser);

api.get('/me', (req, res) => res.json({ user: req.user }));

api.get('/meta', (req, res) => {
  const s = publicSettings();
  res.json({
    user: req.user,
    stages: STAGES,
    triggers: TRIGGERS,
    settings: s,
    providers: providerStatus(),
    app_url: APP_URL,
    users: db.prepare('SELECT id, name, role, active FROM users ORDER BY name').all(),
    partners: db.prepare('SELECT id, name, company FROM partners WHERE active = 1 ORDER BY name').all(),
    ai: aiEnabled(),
  });
});

/* ------------------------------ Dashboard ------------------------------- */

function callList(user, limit) {
  const scope = contactScope(user);
  const rows = db
    .prepare(
      `SELECT c.* FROM contacts c
       WHERE ${scope.sql} AND c.dnc = 0 AND c.phone_norm IS NOT NULL
         AND c.stage NOT IN ('lost','application','processing','underwriting','clear_to_close')
         AND (c.last_contacted_at IS NULL OR c.last_contacted_at < date('now'))
       ORDER BY c.score DESC, c.created_at DESC LIMIT ?`,
    )
    .all(...scope.params, limit);
  return rows.map(serializeContact);
}

api.get('/dashboard', (req, res) => {
  const scope = contactScope(req.user);
  const s = getSettings();
  const counts = db.prepare(`SELECT stage, COUNT(*) n FROM contacts c WHERE ${scope.sql} GROUP BY stage`).all(...scope.params);
  const kpi = db
    .prepare(
      `SELECT COUNT(*) total,
         SUM(created_at >= datetime('now','-7 days')) new_7d,
         SUM(score >= 60) hot,
         SUM(current_rate IS NOT NULL AND current_rate - ? >= 0.75) refi_opps,
         SUM(COALESCE(last_contacted_at, created_at) <= datetime('now', ?)) dormant
       FROM contacts c WHERE ${scope.sql} AND dnc = 0`,
    )
    .get(Number(s.market_rate_30yr), `-${Number(s.dormant_days) || 90} days`, ...scope.params);
  const taskScope = canSeeAll(req.user) ? '1=1' : 't.user_id = ' + Number(req.user.id);
  const tasks = db
    .prepare(
      `SELECT t.*, c.first_name, c.last_name FROM tasks t LEFT JOIN contacts c ON c.id = t.contact_id
       WHERE ${taskScope} AND t.done = 0 AND (t.due_at IS NULL OR t.due_at <= datetime('now','+1 day'))
       ORDER BY t.kind = 'handoff' DESC, t.due_at LIMIT 30`,
    )
    .all();
  const drafts = db.prepare(`SELECT COUNT(*) n FROM ai_drafts d JOIN contacts c ON c.id = d.contact_id WHERE d.status = 'pending' AND ${scope.sql}`).get(...scope.params).n;
  const recent = db
    .prepare(
      `SELECT a.*, c.first_name, c.last_name FROM activities a JOIN contacts c ON c.id = a.contact_id
       WHERE ${scope.sql} AND a.type IN ('sms','email','call','form','ai','stage_change') ORDER BY a.created_at DESC, a.id DESC LIMIT 15`,
    )
    .all(...scope.params);
  const movers = db
    .prepare(`SELECT c.* FROM contacts c WHERE ${scope.sql} AND c.score - c.score_prev >= 5 AND c.score_updated_at >= datetime('now','-2 days') ORDER BY c.score - c.score_prev DESC LIMIT 5`)
    .all(...scope.params)
    .map(serializeContact);
  res.json({
    kpi,
    stages: counts,
    callList: callList(req.user, Number(s.daily_call_list_size) || 25),
    tasks,
    pendingDrafts: drafts,
    recent,
    movers,
  });
});

api.get('/call-list', (req, res) => res.json(callList(req.user, Math.min(200, Number(req.query.limit) || 25))));

/* ------------------------------- Contacts ------------------------------- */

function loadContact(req, res) {
  const c = getContact(Number(req.params.id));
  if (!c || (!canSeeAll(req.user) && c.owner_id !== req.user.id)) {
    res.status(404).json({ error: 'Contact not found' });
    return null;
  }
  return c;
}

const SORTS = { score: 'c.score DESC', recent: 'c.created_at DESC', name: 'c.last_name COLLATE NOCASE, c.first_name COLLATE NOCASE', last_contact: 'c.last_contacted_at IS NOT NULL, c.last_contacted_at', updated: 'c.updated_at DESC' };

api.get('/contacts', (req, res) => {
  const scope = contactScope(req.user);
  const where = [scope.sql];
  const params = [...scope.params];
  const q = String(req.query.q || '').trim();
  if (q) {
    where.push(`(c.first_name || ' ' || COALESCE(c.last_name,'') LIKE ? OR c.email LIKE ? OR c.phone_norm LIKE ? OR c.tags LIKE ? OR c.city LIKE ?)`);
    const like = `%${q}%`;
    params.push(like, like, `%${q.replace(/\D/g, '') || q}%`, like, like);
  }
  for (const f of ['stage', 'lead_type', 'loan_type', 'source']) {
    if (req.query[f]) { where.push(`c.${f} = ?`); params.push(req.query[f]); }
  }
  if (req.query.owner_id) { where.push('c.owner_id = ?'); params.push(Number(req.query.owner_id)); }
  if (req.query.min_score) { where.push('c.score >= ?'); params.push(Number(req.query.min_score)); }
  if (req.query.tag) { where.push(`(',' || c.tags || ',') LIKE ?`); params.push(`%,${req.query.tag},%`); }
  if (req.query.ai_paused) { where.push('c.ai_paused = ?'); params.push(Number(req.query.ai_paused)); }
  const sort = SORTS[req.query.sort] || SORTS.score;
  const limit = Math.min(500, Number(req.query.limit) || 100);
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const total = db.prepare(`SELECT COUNT(*) n FROM contacts c WHERE ${where.join(' AND ')}`).get(...params).n;
  const rows = db
    .prepare(`SELECT c.*, u.name owner_name FROM contacts c LEFT JOIN users u ON u.id = c.owner_id WHERE ${where.join(' AND ')} ORDER BY ${sort} LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  res.json({ total, contacts: rows.map(serializeContact) });
});

api.post('/contacts', (req, res) => {
  const body = { ...req.body };
  if (!canSeeAll(req.user)) body.owner_id = req.user.id;
  const r = upsertContact(body, { source: body.source || 'manual', userId: req.user.id });
  res.status(r.created ? 201 : 200).json({ ...r, contact: serializeContact(r.contact) });
});

api.get('/contacts/:id', (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  const activities = db
    .prepare('SELECT a.*, u.name user_name FROM activities a LEFT JOIN users u ON u.id = a.user_id WHERE contact_id = ? ORDER BY a.created_at DESC, a.id DESC LIMIT 300')
    .all(c.id)
    .map((a) => ({ ...a, meta: json(a.meta, {}) }));
  const tasks = db.prepare('SELECT * FROM tasks WHERE contact_id = ? ORDER BY done, due_at').all(c.id);
  const history = db.prepare('SELECT score, created_at FROM score_history WHERE contact_id = ? ORDER BY created_at').all(c.id);
  const drafts = db.prepare(`SELECT * FROM ai_drafts WHERE contact_id = ? AND status = 'pending' ORDER BY id DESC`).all(c.id);
  const campaigns = db
    .prepare('SELECT s.*, cp.name FROM campaign_sends s JOIN campaigns cp ON cp.id = s.campaign_id WHERE s.contact_id = ? ORDER BY s.id DESC')
    .all(c.id);
  const owner = c.owner_id ? db.prepare('SELECT id, name FROM users WHERE id = ?').get(c.owner_id) : null;
  res.json({ contact: serializeContact(c), owner, activities, tasks, history, drafts, campaigns });
});

api.patch('/contacts/:id', (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  const patch = { ...req.body };
  if (!canSeeAll(req.user)) delete patch.owner_id;
  for (const k of Object.keys(patch)) if (!CONTACT_FIELDS.includes(k)) delete patch[k];
  if ('ai_paused' in patch && Number(patch.ai_paused) !== c.ai_paused) {
    logActivity(c.id, { type: 'system', body: Number(patch.ai_paused) ? 'Assistant paused (human takeover)' : 'Assistant resumed', userId: req.user.id });
  }
  res.json({ contact: serializeContact(updateContact(c.id, patch, { userId: req.user.id })) });
});

api.delete('/contacts/:id', requireRole('owner', 'admin'), (req, res) => {
  db.prepare('DELETE FROM contacts WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

api.post('/contacts/:id/stage', (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  if (!STAGE_KEYS.includes(req.body.stage)) return res.status(400).json({ error: 'Unknown stage' });
  res.json({ contact: serializeContact(changeStage(c.id, req.body.stage, { userId: req.user.id })) });
});

api.post('/contacts/:id/notes', (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  if (!req.body.body?.trim()) return res.status(400).json({ error: 'Note is empty' });
  logActivity(c.id, { type: 'note', body: req.body.body.trim(), userId: req.user.id });
  res.json({ ok: true });
});

const CALL_OUTCOMES = ['connected', 'left_voicemail', 'no_answer', 'bad_number', 'appointment_set'];
api.post('/contacts/:id/calls', (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  const outcome = CALL_OUTCOMES.includes(req.body.outcome) ? req.body.outcome : 'connected';
  logActivity(c.id, {
    type: 'call',
    direction: req.body.direction === 'in' ? 'in' : 'out',
    body: req.body.notes || null,
    meta: { outcome, duration_min: Number(req.body.duration_min) || null },
    userId: req.user.id,
  });
  // Automated stage transitions based on what actually happened on the call.
  const auto = getSettings().auto_stage_rules === '1';
  if (auto && ['connected', 'appointment_set'].includes(outcome) && ['new', 'nurture', 'lost'].includes(c.stage)) changeStage(c.id, 'contacted', { userId: req.user.id, reason: 'call connected' });
  if (outcome === 'bad_number') db.prepare('UPDATE contacts SET ai_paused = 1 WHERE id = ?').run(c.id);
  if (outcome === 'appointment_set') {
    db.prepare(`INSERT INTO tasks (contact_id, user_id, title, kind, due_at) VALUES (?, ?, ?, 'appointment', ?)`).run(c.id, req.user.id, req.body.appointment_title || 'Consultation call', req.body.appointment_at || null);
  }
  if (req.body.follow_up_at) {
    db.prepare(`INSERT INTO tasks (contact_id, user_id, title, due_at) VALUES (?, ?, ?, ?)`).run(c.id, req.user.id, req.body.follow_up_title || 'Follow up', req.body.follow_up_at);
  }
  rescoreContact(c.id);
  res.json({ ok: true });
});

api.post('/contacts/:id/call', wrap(async (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  try {
    res.json(await startCall(c.id, req.user));
  } catch (err) {
    if (err instanceof SendBlocked) return res.status(400).json({ error: err.message });
    throw err;
  }
}));

api.post('/contacts/:id/messages', wrap(async (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  try {
    const r = await sendManual(c.id, { channel: req.body.channel, subject: req.body.subject, body: req.body.body, userId: req.user.id });
    res.json(r);
  } catch (err) {
    if (err instanceof SendBlocked) return res.status(400).json({ error: err.message });
    throw err;
  }
}));

/** Log an inbound reply by hand (e.g., a text to your cell) - runs the same AI pipeline as webhooks. */
api.post('/contacts/:id/inbound', wrap(async (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  if (!req.body.body?.trim()) return res.status(400).json({ error: 'Message is empty' });
  const analysis = await handleInbound(c.id, { channel: req.body.channel === 'email' ? 'email' : 'sms', body: req.body.body.trim(), subject: req.body.subject, meta: { logged_by: req.user.id } });
  res.json({ analysis });
}));

api.post('/contacts/:id/ai-draft', wrap(async (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  const id = await proposeOutreach(c.id, req.body.reason || 'Manual request from loan officer', { channel: req.body.channel, force: true });
  if (!id) return res.status(400).json({ error: 'No reachable channel for this contact (check phone/email and opt-outs)' });
  res.json({ draft: db.prepare('SELECT * FROM ai_drafts WHERE id = ?').get(id) });
}));

api.post('/contacts/:id/tasks', (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  if (!req.body.title?.trim()) return res.status(400).json({ error: 'Task title is required' });
  const r = db.prepare('INSERT INTO tasks (contact_id, user_id, title, due_at) VALUES (?, ?, ?, ?)').run(c.id, Number(req.body.user_id) || c.owner_id || req.user.id, req.body.title.trim(), req.body.due_at || null);
  res.status(201).json({ task: db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(r.lastInsertRowid)) });
});

api.post('/contacts/bulk', (req, res) => {
  const ids = (req.body.ids || []).map(Number).filter(Boolean);
  const { action, value } = req.body;
  const visible = ids.filter((id) => {
    const c = getContact(id);
    return c && (canSeeAll(req.user) || c.owner_id === req.user.id);
  });
  tx(() => {
    for (const id of visible) {
      if (action === 'stage') changeStage(id, value, { userId: req.user.id });
      else if (action === 'assign' && canSeeAll(req.user)) updateContact(id, { owner_id: Number(value) }, { userId: req.user.id });
      else if (action === 'tag') {
        const c = getContact(id);
        updateContact(id, { tags: [...new Set([...(c.tags || '').split(','), value].filter(Boolean))].join(',') }, { userId: req.user.id });
      } else if (action === 'pause_ai') updateContact(id, { ai_paused: value ? 1 : 0 }, { userId: req.user.id });
      else if (action === 'delete' && canSeeAll(req.user)) db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    }
  });
  res.json({ updated: visible.length });
});

/* --------------------------- Import / export ---------------------------- */

api.post('/import/preview', (req, res) => {
  const { headers, records } = parseCSV(req.body.csv || '');
  if (!headers.length) return res.status(400).json({ error: 'That file looks empty' });
  res.json({ headers, mapping: autoMap(headers), sample: records.slice(0, 5), rows: records.length, fields: ['name', ...CONTACT_FIELDS.filter((f) => !['opted_out_sms', 'opted_out_email', 'dnc', 'ai_paused', 'owner_id'].includes(f))] });
});

api.post('/import', (req, res) => {
  const { records } = parseCSV(req.body.csv || '');
  const mapping = req.body.mapping || {};
  const defaults = req.body.defaults || {};
  const summary = { created: 0, merged: 0, skipped: 0, errors: [] };
  tx(() => {
    records.forEach((rec, i) => {
      const raw = { ...defaults };
      for (const [col, field] of Object.entries(mapping)) {
        if (!field || rec[col] === undefined || rec[col] === '') continue;
        raw[field] = field === 'tags' && defaults.tags ? `${defaults.tags},${rec[col]}` : rec[col];
      }
      if (!canSeeAll(req.user)) raw.owner_id = req.user.id;
      try {
        const r = upsertContact(raw, { source: defaults.source || 'import', userId: req.user.id, emitEvents: false });
        if (r.created) summary.created++;
        else summary.merged++;
      } catch (err) {
        summary.skipped++;
        if (summary.errors.length < 20) summary.errors.push(`Row ${i + 2}: ${err.message}`);
      }
    });
  });
  res.json(summary);
});

api.get('/export.csv', (req, res) => {
  const scope = contactScope(req.user);
  const rows = db.prepare(`SELECT c.*, u.name owner FROM contacts c LEFT JOIN users u ON u.id = c.owner_id WHERE ${scope.sql} ORDER BY c.id`).all(...scope.params);
  const cols = ['id', ...CONTACT_FIELDS.filter((f) => f !== 'owner_id'), 'owner', 'score', 'facts', 'last_contacted_at', 'last_inbound_at', 'created_at'];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="contacts-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(toCSV(rows, cols));
});

/* -------------------------------- Tasks -------------------------------- */

api.get('/tasks', (req, res) => {
  const where = [req.query.scope === 'all' && canSeeAll(req.user) ? '1=1' : 't.user_id = ?'];
  const params = where[0] === '1=1' ? [] : [req.user.id];
  where.push(req.query.status === 'done' ? 't.done = 1' : 't.done = 0');
  res.json(
    db
      .prepare(
        `SELECT t.*, c.first_name, c.last_name, u.name user_name FROM tasks t LEFT JOIN contacts c ON c.id = t.contact_id LEFT JOIN users u ON u.id = t.user_id
         WHERE ${where.join(' AND ')} ORDER BY t.due_at IS NULL, t.due_at LIMIT 300`,
      )
      .all(...params),
  );
});

api.patch('/tasks/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(req.params.id));
  if (!t || (!canSeeAll(req.user) && t.user_id !== req.user.id)) return res.status(404).json({ error: 'Task not found' });
  if ('done' in req.body) {
    db.prepare(`UPDATE tasks SET done = ?, done_at = CASE WHEN ? THEN datetime('now') ELSE NULL END WHERE id = ?`).run(req.body.done ? 1 : 0, req.body.done ? 1 : 0, t.id);
    if (req.body.done && t.contact_id) logActivity(t.contact_id, { type: 'task', body: `Completed: ${t.title}`, userId: req.user.id });
  }
  if (req.body.due_at !== undefined) db.prepare('UPDATE tasks SET due_at = ? WHERE id = ?').run(req.body.due_at, t.id);
  if (req.body.title) db.prepare('UPDATE tasks SET title = ? WHERE id = ?').run(req.body.title, t.id);
  res.json({ task: db.prepare('SELECT * FROM tasks WHERE id = ?').get(t.id) });
});

api.post('/tasks', (req, res) => {
  if (!req.body.title?.trim()) return res.status(400).json({ error: 'Task title is required' });
  const r = db.prepare('INSERT INTO tasks (user_id, title, due_at) VALUES (?, ?, ?)').run(req.user.id, req.body.title.trim(), req.body.due_at || null);
  res.status(201).json({ task: db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(r.lastInsertRowid)) });
});

api.delete('/tasks/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(req.params.id));
  if (!t || (!canSeeAll(req.user) && t.user_id !== req.user.id)) return res.status(404).json({ error: 'Task not found' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(t.id);
  res.json({ ok: true });
});

/* ------------------------------ Assistant ------------------------------- */

api.get('/ai/drafts', (req, res) => {
  const scope = contactScope(req.user);
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
  res.json(
    db
      .prepare(
        `SELECT d.*, c.first_name, c.last_name, c.score, c.phone, c.email FROM ai_drafts d JOIN contacts c ON c.id = d.contact_id
         WHERE d.status = ? AND ${scope.sql} ORDER BY d.id DESC LIMIT 200`,
      )
      .all(status, ...scope.params),
  );
});

function loadDraft(req, res) {
  const d = db.prepare('SELECT d.*, c.owner_id FROM ai_drafts d JOIN contacts c ON c.id = d.contact_id WHERE d.id = ?').get(Number(req.params.id));
  if (!d || (!canSeeAll(req.user) && d.owner_id !== req.user.id)) {
    res.status(404).json({ error: 'Draft not found' });
    return null;
  }
  return d;
}

api.post('/ai/drafts/:id/approve', (req, res) => {
  const d = loadDraft(req, res);
  if (!d) return;
  try {
    approveDraft(d.id, req.user.id, { subject: req.body.subject, body: req.body.body });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

api.post('/ai/drafts/:id/reject', (req, res) => {
  const d = loadDraft(req, res);
  if (!d) return;
  rejectDraft(d.id, req.user.id);
  res.json({ ok: true });
});

api.post('/ai/scan', requireRole('owner', 'admin'), wrap(async (_req, res) => res.json(await scanForOutreach())));

api.get('/ai/status', (_req, res) => {
  res.json({
    enabled: aiEnabled(),
    queued: db.prepare(`SELECT COUNT(*) n FROM outbox WHERE status = 'queued'`).get().n,
    sent_7d: db.prepare(`SELECT COUNT(*) n FROM outbox WHERE source = 'ai' AND status = 'sent' AND sent_at >= datetime('now','-7 days')`).get().n,
    handoffs_7d: db.prepare(`SELECT COUNT(*) n FROM tasks WHERE kind = 'handoff' AND created_at >= datetime('now','-7 days')`).get().n,
    paused: db.prepare('SELECT COUNT(*) n FROM contacts WHERE ai_paused = 1').get().n,
  });
});

/* ------------------------------ Campaigns ------------------------------- */

const CAMPAIGN_FIELDS = ['name', 'channel', 'subject', 'email_body', 'sms_body', 'audience', 'trigger', 'trigger_config'];
function campaignRow(body) {
  const out = {};
  for (const f of CAMPAIGN_FIELDS) {
    if (body[f] === undefined) continue;
    out[f] = ['audience', 'trigger_config'].includes(f) && typeof body[f] !== 'string' ? JSON.stringify(body[f]) : body[f];
  }
  if (out.channel && !['email', 'sms', 'both'].includes(out.channel)) out.channel = 'email';
  if (out.trigger && !TRIGGERS[out.trigger]) out.trigger = 'manual';
  return out;
}
const serializeCampaign = (c) => ({ ...c, audience: json(c.audience, {}), trigger_config: json(c.trigger_config, {}), stats: campaignStats(c.id) });

api.get('/campaigns', (_req, res) => res.json(db.prepare('SELECT * FROM campaigns ORDER BY id DESC').all().map(serializeCampaign)));

api.post('/campaigns', requireRole('owner', 'admin'), (req, res) => {
  const row = campaignRow(req.body);
  if (!row.name) return res.status(400).json({ error: 'Campaign name is required' });
  const cols = Object.keys(row);
  const r = db.prepare(`INSERT INTO campaigns (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...cols.map((c) => row[c]));
  res.status(201).json(serializeCampaign(db.prepare('SELECT * FROM campaigns WHERE id = ?').get(Number(r.lastInsertRowid))));
});

api.get('/campaigns/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'Campaign not found' });
  const sends = db
    .prepare('SELECT s.*, ct.first_name, ct.last_name FROM campaign_sends s JOIN contacts ct ON ct.id = s.contact_id WHERE s.campaign_id = ? ORDER BY s.id DESC LIMIT 200')
    .all(c.id);
  res.json({ ...serializeCampaign(c), sends });
});

api.patch('/campaigns/:id', requireRole('owner', 'admin'), (req, res) => {
  const row = campaignRow(req.body);
  const cols = Object.keys(row);
  if (cols.length) db.prepare(`UPDATE campaigns SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`).run(...cols.map((c) => row[c]), Number(req.params.id));
  res.json(serializeCampaign(db.prepare('SELECT * FROM campaigns WHERE id = ?').get(Number(req.params.id))));
});

api.delete('/campaigns/:id', requireRole('owner', 'admin'), (req, res) => {
  db.prepare(`UPDATE outbox SET status = 'cancelled' WHERE source = 'campaign' AND status = 'queued' AND ref_id IN (SELECT id FROM campaign_sends WHERE campaign_id = ?)`).run(Number(req.params.id));
  db.prepare('DELETE FROM campaigns WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

api.post('/campaigns/:id/launch', requireRole('owner', 'admin'), (req, res) => {
  const c = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'Campaign not found' });
  if ((c.channel !== 'sms' && !c.email_body) || (c.channel !== 'email' && !c.sms_body)) return res.status(400).json({ error: 'Add message content for every channel first' });
  if (c.trigger === 'manual') return res.json(launchCampaign(c.id));
  db.prepare(`UPDATE campaigns SET status = 'active' WHERE id = ?`).run(c.id);
  res.json({ activated: true });
});

api.post('/campaigns/:id/pause', requireRole('owner', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  db.prepare(`UPDATE campaigns SET status = 'paused' WHERE id = ?`).run(id);
  db.prepare(`UPDATE outbox SET status = 'cancelled' WHERE source = 'campaign' AND status = 'queued' AND ref_id IN (SELECT id FROM campaign_sends WHERE campaign_id = ?)`).run(id);
  db.prepare(`UPDATE campaign_sends SET status = 'cancelled' WHERE campaign_id = ? AND status = 'queued'`).run(id);
  res.json({ ok: true });
});

api.post('/campaigns/preview-audience', (req, res) => res.json(previewAudience(req.body.audience || {}, req.user)));

api.post('/campaigns/generate', wrap(async (req, res) => {
  if (!req.body.goal) return res.status(400).json({ error: 'Describe the goal of the campaign' });
  res.json(await generateCampaignCopy({ goal: req.body.goal, audience: req.body.audience }));
}));

/* ---------------------------- Landing pages ----------------------------- */

const LP_FIELDS = ['slug', 'title', 'headline', 'subheadline', 'body', 'cta', 'lead_type', 'fields', 'tags', 'thank_you', 'active', 'partner_id', 'show_calculator'];
function lpRow(body) {
  const out = {};
  for (const f of LP_FIELDS) if (body[f] !== undefined) out[f] = f === 'fields' && typeof body[f] !== 'string' ? JSON.stringify(body[f]) : body[f];
  if (out.slug !== undefined) out.slug = String(out.slug).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
  if (out.active !== undefined) out.active = out.active ? 1 : 0;
  if (out.show_calculator !== undefined) out.show_calculator = out.show_calculator ? 1 : 0;
  if (out.partner_id !== undefined) out.partner_id = Number(out.partner_id) || null;
  return out;
}
const serializeLP = (p) => ({ ...p, fields: json(p.fields, []), url: `${APP_URL}/p/${p.slug}` });

api.get('/landing-pages', (_req, res) => res.json(db.prepare('SELECT * FROM landing_pages ORDER BY id DESC').all().map(serializeLP)));

api.post('/landing-pages', requireRole('owner', 'admin'), (req, res) => {
  const row = lpRow(req.body);
  if (!row.title || !row.slug) return res.status(400).json({ error: 'Title and URL slug are required' });
  try {
    const cols = Object.keys(row);
    const r = db.prepare(`INSERT INTO landing_pages (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...cols.map((c) => row[c]));
    res.status(201).json(serializeLP(db.prepare('SELECT * FROM landing_pages WHERE id = ?').get(Number(r.lastInsertRowid))));
  } catch (err) {
    if (/UNIQUE/.test(err.message)) return res.status(400).json({ error: 'That URL slug is already in use' });
    throw err;
  }
});

api.patch('/landing-pages/:id', requireRole('owner', 'admin'), (req, res) => {
  const row = lpRow(req.body);
  const cols = Object.keys(row);
  try {
    if (cols.length) db.prepare(`UPDATE landing_pages SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`).run(...cols.map((c) => row[c]), Number(req.params.id));
  } catch (err) {
    if (/UNIQUE/.test(err.message)) return res.status(400).json({ error: 'That URL slug is already in use' });
    throw err;
  }
  res.json(serializeLP(db.prepare('SELECT * FROM landing_pages WHERE id = ?').get(Number(req.params.id))));
});

api.delete('/landing-pages/:id', requireRole('owner', 'admin'), (req, res) => {
  db.prepare('DELETE FROM landing_pages WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

/* ------------------------------- Reports -------------------------------- */

api.get('/reports', (_req, res) => res.json(db.prepare('SELECT period, created_at FROM reports ORDER BY period DESC').all()));

api.get('/reports/:period', (req, res) => {
  const r = db.prepare('SELECT * FROM reports WHERE period = ?').get(req.params.period);
  if (!r) return res.status(404).json({ error: 'No report for that month yet' });
  res.json(json(r.data, {}));
});

api.post('/reports/:period/build', wrap(async (req, res) => {
  const period = /^\d{4}-\d{2}$/.test(req.params.period) ? req.params.period : previousPeriod();
  res.json(await buildMonthlyReport(period));
}));

/* -------------------------------- Team ---------------------------------- */

api.get('/users', (_req, res) => {
  res.json(
    db
      .prepare(
        `SELECT u.id, u.name, u.email, u.phone, u.role, u.routing_weight, u.receives_leads, u.active, u.created_at,
           (SELECT COUNT(*) FROM contacts c WHERE c.owner_id = u.id) contacts
         FROM users u ORDER BY u.active DESC, u.name`,
      )
      .all(),
  );
});

api.post('/users', requireRole('owner', 'admin'), (req, res) => {
  const { name, email, password, role = 'member', phone, routing_weight = 1 } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email, and an 8+ character password are required' });
  if (role !== 'member' && req.user.role !== 'owner') return res.status(403).json({ error: 'Only the owner can add admins or owners' });
  if (!['owner', 'admin', 'member'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  try {
    const r = db.prepare('INSERT INTO users (name, email, password_hash, role, phone, routing_weight) VALUES (?, ?, ?, ?, ?, ?)').run(name, email.trim().toLowerCase(), hashPassword(password), role, phone || null, Number(routing_weight) || 1);
    res.status(201).json({ id: Number(r.lastInsertRowid) });
  } catch (err) {
    if (/UNIQUE/.test(err.message)) return res.status(400).json({ error: 'A user with that email already exists' });
    throw err;
  }
});

api.patch('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ error: 'User not found' });
  const self = id === req.user.id;
  const admin = canSeeAll(req.user);
  if (!self && !admin) return res.status(403).json({ error: 'Not allowed' });
  if (target.role === 'owner' && !self && req.user.role !== 'owner') return res.status(403).json({ error: 'Only the owner can edit the owner' });
  const sets = [];
  const vals = [];
  const allow = admin ? ['name', 'phone', 'routing_weight', 'receives_leads', 'active', 'role'] : ['name', 'phone'];
  for (const f of allow) {
    if (req.body[f] === undefined) continue;
    if (f === 'role') {
      if (req.user.role !== 'owner' || !['owner', 'admin', 'member'].includes(req.body.role)) continue;
      if (self && req.body.role !== 'owner') continue; // owner can't demote themselves into a locked-out workspace
    }
    if (f === 'active' && self) continue;
    sets.push(`${f} = ?`);
    vals.push(['routing_weight', 'receives_leads', 'active'].includes(f) ? Number(req.body[f]) : req.body[f]);
  }
  if (req.body.password) {
    if (String(req.body.password).length < 8) return res.status(400).json({ error: 'Password must be 8+ characters' });
    sets.push('password_hash = ?');
    vals.push(hashPassword(req.body.password));
  }
  if (sets.length) db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals, id);
  if (req.body.active === 0 || req.body.active === false) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  res.json({ ok: true });
});

/* ------------------------------- Settings ------------------------------- */

api.get('/settings', requireRole('owner', 'admin'), (_req, res) => {
  res.json({ settings: publicSettings(), providers: providerStatus() });
});

api.patch('/settings', requireRole('owner', 'admin'), (req, res) => {
  const before = getSettings();
  const changed = {};
  for (const [k, v] of Object.entries(req.body || {})) {
    if (!SETTING_KEYS.includes(k) || k === 'routing_cursor') continue;
    if (k === 'assistant_mode' && !['off', 'approval', 'autonomous'].includes(v)) continue;
    if (k === 'routing_mode' && !['round_robin', 'weighted', 'manual'].includes(v)) continue;
    if (String(before[k]) !== String(v)) {
      setSetting(k, v);
      changed[k] = v;
    }
  }
  if ('market_rate_30yr' in changed) setSetting('last_market_rate_30yr', before.market_rate_30yr);
  if (Object.keys(changed).length) emit('settings.changed', { changed, userId: req.user.id });
  res.json({ settings: publicSettings(), changed: Object.keys(changed) });
});

api.post('/rescore', requireRole('owner', 'admin'), (_req, res) => res.json(rescoreAll()));

/* ----------------------------- Enrichment ------------------------------- */

api.post('/contacts/:id/enrich', wrap(async (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  const r = await enrichContact(c.id, { force: true });
  res.json({ ...r, contact: serializeContact(getContact(c.id)) });
}));

/* ---------------------------- Voicemail drops --------------------------- */

const blocked = (res, err) => {
  if (err instanceof SendBlocked) return res.status(400).json({ error: err.message });
  throw err;
};

api.get('/voicemail-drops', (_req, res) => res.json(listDrops()));

api.post('/voicemail-drops', (req, res) => {
  try {
    res.status(201).json({ id: saveDrop(req.body) });
  } catch (err) { blocked(res, err); }
});

api.patch('/voicemail-drops/:id', (req, res) => {
  try {
    res.json({ id: saveDrop({ ...req.body, id: Number(req.params.id) }) });
  } catch (err) { blocked(res, err); }
});

api.delete('/voicemail-drops/:id', requireRole('owner', 'admin'), (req, res) => {
  deleteDrop(Number(req.params.id));
  res.json({ ok: true });
});

api.post('/contacts/:id/voicemail', wrap(async (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  try {
    res.json(await dropVoicemail(c.id, Number(req.body.drop_id), req.user));
  } catch (err) { blocked(res, err); }
}));

api.post('/voicemail/bulk', wrap(async (req, res) => {
  const ids = (req.body.ids || []).map(Number).filter((id) => {
    const c = getContact(id);
    return c && (canSeeAll(req.user) || c.owner_id === req.user.id);
  });
  res.json(await dropMany(ids, Number(req.body.drop_id), req.user));
}));

/* ----------------------------- Integrations ----------------------------- */

api.get('/integrations', requireRole('owner', 'admin'), (_req, res) => {
  res.json({
    google: googleStatus(),
    followupboss: fubStatus(),
    inbound: { url: `${APP_URL}/hooks/lead`, key: inboundKey() },
    enrichment: enrichmentStatus(),
    runs: lastRuns(),
  });
});

api.post('/integrations/google/connect', requireRole('owner', 'admin'), (req, res) => {
  try {
    res.json({ url: googleAuthUrl(req.user.id) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

api.post('/integrations/google/sync', requireRole('owner', 'admin'), wrap(async (_req, res) => {
  try {
    res.json(await syncGoogle());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}));

api.post('/integrations/google/disconnect', requireRole('owner', 'admin'), (_req, res) => {
  googleDisconnect();
  res.json({ ok: true });
});

api.post('/integrations/followupboss', requireRole('owner', 'admin'), wrap(async (req, res) => {
  const key = String(req.body.api_key || '').trim();
  if (req.body.disconnect) {
    setSetting('fub_api_key', '');
    return res.json({ ok: true });
  }
  try {
    const summary = await syncFollowUpBoss(key || undefined);
    if (key) setSetting('fub_api_key', key);
    res.json(summary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}));

api.post('/integrations/inbound/rotate', requireRole('owner', 'admin'), (_req, res) => res.json({ key: inboundKey({ rotate: true }) }));

/* ------------------------------- Analytics ------------------------------ */

api.get('/analytics', (req, res) => {
  const days = Math.min(730, Math.max(1, Number(req.query.days) || 30));
  const ownerId = canSeeAll(req.user) ? Number(req.query.owner_id) || null : req.user.id;
  res.json(performance({ days, ownerId }));
});

api.get('/lead-spend', (_req, res) => res.json(db.prepare('SELECT * FROM lead_source_spend ORDER BY month DESC, source').all()));

api.post('/lead-spend', requireRole('owner', 'admin'), (req, res) => {
  const { source, month, amount } = req.body || {};
  if (!source || !/^\d{4}-\d{2}$/.test(month || '')) return res.status(400).json({ error: 'Source and month (YYYY-MM) are required' });
  db.prepare('INSERT INTO lead_source_spend (source, month, amount) VALUES (?, ?, ?) ON CONFLICT(source, month) DO UPDATE SET amount = excluded.amount').run(String(source).trim(), month, Number(amount) || 0);
  res.json({ ok: true });
});

api.delete('/lead-spend/:id', requireRole('owner', 'admin'), (req, res) => {
  db.prepare('DELETE FROM lead_source_spend WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

/* ------------------------------- Workflows ------------------------------ */

const serializeWf = (w) => ({ ...w, trigger_config: json(w.trigger_config, {}), steps: json(w.steps, []), exit_stages: json(w.exit_stages, []), stats: workflowStats(w.id) });

api.get('/workflows/meta', (_req, res) => res.json({ triggers: WF_TRIGGERS, steps: STEP_TYPES, conditions: CONDITION_FIELDS, recipes: RECIPES.map(({ key, name, description, trigger }) => ({ key, name, description, trigger })) }));

api.get('/workflows', (_req, res) => res.json(db.prepare('SELECT * FROM workflows ORDER BY id DESC').all().map(serializeWf)));

api.get('/workflows/:id', (req, res) => {
  const w = db.prepare('SELECT * FROM workflows WHERE id = ?').get(Number(req.params.id));
  if (!w) return res.status(404).json({ error: 'Workflow not found' });
  const runs = db.prepare(`SELECT r.id, r.contact_id, r.status, r.next_run_at, r.exit_reason, r.started_at, r.finished_at, r.log, c.first_name, c.last_name FROM workflow_runs r JOIN contacts c ON c.id = r.contact_id WHERE r.workflow_id = ? ORDER BY r.id DESC LIMIT 100`).all(w.id)
    .map((r) => ({ ...r, log: json(r.log, []).slice(-5) }));
  res.json({ ...serializeWf(w), runs });
});

function wfRow(body) {
  const out = {};
  if (body.name !== undefined) out.name = String(body.name).trim();
  if (body.description !== undefined) out.description = body.description;
  if (body.trigger !== undefined) {
    if (!WF_TRIGGERS[body.trigger]) throw new Error('Unknown trigger');
    out.trigger = body.trigger;
  }
  if (body.trigger_config !== undefined) out.trigger_config = JSON.stringify(body.trigger_config || {});
  if (body.steps !== undefined) {
    validateSteps(body.steps);
    out.steps = JSON.stringify(body.steps);
  }
  if (body.exit_on_reply !== undefined) out.exit_on_reply = body.exit_on_reply ? 1 : 0;
  if (body.allow_reentry !== undefined) out.allow_reentry = body.allow_reentry ? 1 : 0;
  if (body.exit_stages !== undefined) out.exit_stages = JSON.stringify((body.exit_stages || []).filter((x) => STAGE_KEYS.includes(x)));
  return out;
}

api.post('/workflows', requireRole('owner', 'admin'), (req, res) => {
  try {
    if (req.body.recipe) return res.status(201).json(serializeWf(db.prepare('SELECT * FROM workflows WHERE id = ?').get(installRecipe(req.body.recipe))));
    const row = wfRow(req.body);
    if (!row.name) return res.status(400).json({ error: 'Workflow name is required' });
    const cols = Object.keys(row);
    const id = db.prepare(`INSERT INTO workflows (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...cols.map((c) => row[c])).lastInsertRowid;
    res.status(201).json(serializeWf(db.prepare('SELECT * FROM workflows WHERE id = ?').get(Number(id))));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

api.patch('/workflows/:id', requireRole('owner', 'admin'), (req, res) => {
  try {
    const row = wfRow(req.body);
    if (req.body.status !== undefined) {
      if (!['draft', 'active', 'paused'].includes(req.body.status)) throw new Error('Invalid status');
      row.status = req.body.status;
    }
    const cols = Object.keys(row);
    if (cols.length) db.prepare(`UPDATE workflows SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...cols.map((c) => row[c]), Number(req.params.id));
    res.json(serializeWf(db.prepare('SELECT * FROM workflows WHERE id = ?').get(Number(req.params.id))));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

api.delete('/workflows/:id', requireRole('owner', 'admin'), (req, res) => {
  db.prepare('DELETE FROM workflows WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

api.post('/workflows/:id/enroll', (req, res) => {
  const ids = (req.body.contact_ids || [req.body.contact_id]).map(Number).filter(Boolean);
  let enrolled = 0;
  for (const id of ids) {
    const c = getContact(id);
    if (!c || (!canSeeAll(req.user) && c.owner_id !== req.user.id)) continue;
    if (enroll(Number(req.params.id), id, { reason: `manual by ${req.user.name}`, force: true })) enrolled++;
  }
  res.json({ enrolled, skipped: ids.length - enrolled });
});

api.post('/workflow-runs/:id/stop', (req, res) => {
  const r = db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Run not found' });
  const c = getContact(r.contact_id);
  if (!canSeeAll(req.user) && c?.owner_id !== req.user.id) return res.status(404).json({ error: 'Run not found' });
  exitRuns(r.contact_id, `stopped by ${req.user.name}`, (x) => x.id === r.id);
  res.json({ ok: true });
});

api.get('/contacts/:id/workflows', (req, res) => {
  const c = loadContact(req, res);
  if (!c) return;
  res.json(db.prepare(`SELECT r.id, r.status, r.started_at, r.next_run_at, r.exit_reason, w.id workflow_id, w.name FROM workflow_runs r JOIN workflows w ON w.id = r.workflow_id WHERE r.contact_id = ? ORDER BY r.id DESC LIMIT 20`).all(c.id));
});

/* ------------------------------- Partners ------------------------------- */

const PARTNER_FIELDS = ['name', 'company', 'type', 'email', 'phone', 'notes', 'send_updates', 'active'];
api.get('/partners', (_req, res) => {
  res.json(db.prepare(`SELECT p.*, COUNT(c.id) referrals, SUM(c.stage IN ('application','processing','underwriting','clear_to_close')) in_process,
      SUM(c.stage = 'funded') funded, COALESCE(SUM(CASE WHEN c.stage = 'funded' THEN c.loan_amount END),0) volume, MAX(c.created_at) last_referral
    FROM partners p LEFT JOIN contacts c ON c.partner_id = p.id GROUP BY p.id ORDER BY p.active DESC, referrals DESC, p.name`).all());
});

api.get('/partners/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM partners WHERE id = ?').get(Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'Partner not found' });
  const scope = contactScope(req.user);
  const clients = db.prepare(`SELECT c.* FROM contacts c WHERE c.partner_id = ? AND ${scope.sql} ORDER BY c.created_at DESC`).all(p.id, ...scope.params).map(serializeContact);
  res.json({ ...p, clients });
});

api.post('/partners', (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ error: 'Partner name is required' });
  const cols = PARTNER_FIELDS.filter((f) => req.body[f] !== undefined);
  const id = db.prepare(`INSERT INTO partners (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...cols.map((c) => (['send_updates', 'active'].includes(c) ? (req.body[c] ? 1 : 0) : req.body[c]))).lastInsertRowid;
  res.status(201).json({ id: Number(id) });
});

api.patch('/partners/:id', (req, res) => {
  const cols = PARTNER_FIELDS.filter((f) => req.body[f] !== undefined);
  if (cols.length) db.prepare(`UPDATE partners SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`).run(...cols.map((c) => (['send_updates', 'active'].includes(c) ? (req.body[c] ? 1 : 0) : req.body[c])), Number(req.params.id));
  res.json({ ok: true });
});

api.delete('/partners/:id', requireRole('owner', 'admin'), (req, res) => {
  db.prepare('UPDATE contacts SET partner_id = NULL WHERE partner_id = ?').run(Number(req.params.id));
  db.prepare('DELETE FROM partners WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

/* ----------------------------- AI agents ------------------------------- */

api.get('/coach', wrap(async (req, res) => {
  res.json({ actions: nextBestActions(req.user), briefing: await coachBriefing(req.user, { refresh: false }).catch(() => null), ai: aiEnabled() });
}));

api.post('/coach/briefing', wrap(async (req, res) => {
  if (!aiEnabled()) return res.status(400).json({ error: 'Set ANTHROPIC_API_KEY to enable AI briefings' });
  res.json({ briefing: await coachBriefing(req.user, { refresh: true }) });
}));

api.get('/opportunities/:kind', (req, res) => {
  try {
    res.json(findOpportunities(req.user, req.params.kind, Math.min(100, Number(req.query.limit) || 25)));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

api.get('/copilot/threads', (req, res) => res.json(listThreads(req.user)));
api.get('/copilot/threads/:id', (req, res) => {
  const t = getThread(req.user, req.params.id);
  if (!t) return res.status(404).json({ error: 'Conversation not found' });
  res.json(t);
});
api.delete('/copilot/threads/:id', (req, res) => {
  db.prepare('DELETE FROM copilot_threads WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user.id);
  res.json({ ok: true });
});
api.post('/copilot', wrap(async (req, res) => {
  try {
    res.json(await copilotTurn(req.user, { threadId: req.body.thread_id, text: req.body.text }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}));

/* --------------------------- Content Studio ---------------------------- */

api.get('/content/meta', (_req, res) => res.json({ kinds: CONTENT_KINDS, ai: aiEnabled() }));
api.get('/content', (_req, res) => res.json(db.prepare('SELECT * FROM content_items ORDER BY COALESCE(scheduled_at, created_at) DESC LIMIT 300').all()));

api.post('/content/generate', wrap(async (req, res) => {
  try {
    res.json(await generateContent(req.body || {}));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}));

const CONTENT_STATUS = ['draft', 'scheduled', 'published'];
api.post('/content', (req, res) => {
  const { kind, platform, title, body, scheduled_at } = req.body || {};
  if (!CONTENT_KINDS[kind] || !body?.trim()) return res.status(400).json({ error: 'Content type and body are required' });
  const status = scheduled_at ? 'scheduled' : 'draft';
  const id = db.prepare('INSERT INTO content_items (kind, platform, title, body, status, scheduled_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)').run(kind, platform || null, title || null, body, status, scheduled_at ? String(scheduled_at).replace('T', ' ').slice(0, 19) : null, req.user.id).lastInsertRowid;
  res.status(201).json(db.prepare('SELECT * FROM content_items WHERE id = ?').get(Number(id)));
});

api.patch('/content/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM content_items WHERE id = ?').get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Content not found' });
  const sets = [];
  const vals = [];
  for (const f of ['title', 'body', 'platform']) if (req.body[f] !== undefined) { sets.push(`${f} = ?`); vals.push(req.body[f]); }
  if (req.body.scheduled_at !== undefined) {
    sets.push('scheduled_at = ?', 'status = ?');
    vals.push(req.body.scheduled_at ? String(req.body.scheduled_at).replace('T', ' ').slice(0, 19) : null, req.body.scheduled_at ? 'scheduled' : 'draft');
  }
  if (sets.length) db.prepare(`UPDATE content_items SET ${sets.join(', ')} WHERE id = ?`).run(...vals, item.id);
  if (req.body.publish) publishContent(item.id);
  res.json(db.prepare('SELECT * FROM content_items WHERE id = ?').get(item.id));
});

api.delete('/content/:id', (req, res) => {
  db.prepare('DELETE FROM content_items WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

api.post('/content/:id/to-campaign', requireRole('owner', 'admin'), (req, res) => {
  const item = db.prepare('SELECT * FROM content_items WHERE id = ?').get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Content not found' });
  let subject = item.title || 'News from {{company}}';
  let body = item.body;
  const m = /^Subject:\s*(.+)\n+/i.exec(body);
  if (m) { subject = m[1].trim(); body = body.slice(m[0].length); }
  const id = db.prepare(`INSERT INTO campaigns (name, channel, subject, email_body, audience, trigger) VALUES (?, 'email', ?, ?, '{}', 'manual')`).run(`Newsletter: ${(item.title || subject).slice(0, 60)}`, subject, body).lastInsertRowid;
  res.status(201).json({ campaign_id: Number(id) });
});

/* --------------------------- Integrations hub --------------------------- */

api.get('/landing-pages/:id/qr.svg', wrap(async (req, res) => {
  const p = db.prepare('SELECT slug FROM landing_pages WHERE id = ?').get(Number(req.params.id));
  if (!p) return res.status(404).send('Not found');
  res.type('image/svg+xml').send(await QRCode.toString(`${APP_URL}/p/${p.slug}?utm_source=qr`, { type: 'svg', margin: 1, width: 512 }));
}));

api.get('/hub', requireRole('owner', 'admin'), (req, res) => {
  const stats = webhookStats();
  res.json({
    events: WEBHOOK_EVENTS,
    webhooks: db.prepare('SELECT id, url, events, active, description, created_at FROM webhooks ORDER BY id DESC').all().map((w) => ({ ...w, events: json(w.events, []), stats: stats.find((x) => x.webhook_id === w.id) || {} })),
    deliveries: db.prepare('SELECT d.id, d.webhook_id, d.event, d.status, d.attempts, d.response_code, d.error, d.created_at FROM webhook_deliveries d ORDER BY d.id DESC LIMIT 25').all(),
    api_keys: listApiKeys(),
    api_base: `${APP_URL}/v1`,
    slack: { connected: Boolean(getSettings().slack_webhook_url), events: String(getSettings().slack_events || '').split(',').filter(Boolean) },
    calendar_url: `${APP_URL}/calendar/${req.user.id}/${signId('cal', req.user.id)}.ics`,
  });
});

api.get('/calendar-url', (req, res) => res.json({ url: `${APP_URL}/calendar/${req.user.id}/${signId('cal', req.user.id)}.ics` }));

api.post('/hub/webhooks', requireRole('owner', 'admin'), (req, res) => {
  try {
    assertPublicUrl(req.body.url);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const events = (req.body.events || []).filter((e) => e === '*' || WEBHOOK_EVENTS[e]);
  if (!events.length) return res.status(400).json({ error: 'Pick at least one event' });
  const secret = token(24);
  const id = db.prepare('INSERT INTO webhooks (url, events, secret, description) VALUES (?, ?, ?, ?)').run(req.body.url, JSON.stringify(events), secret, req.body.description || null).lastInsertRowid;
  res.status(201).json({ id: Number(id), secret });
});

api.patch('/hub/webhooks/:id', requireRole('owner', 'admin'), (req, res) => {
  if (req.body.active !== undefined) db.prepare('UPDATE webhooks SET active = ? WHERE id = ?').run(req.body.active ? 1 : 0, Number(req.params.id));
  if (req.body.events) db.prepare('UPDATE webhooks SET events = ? WHERE id = ?').run(JSON.stringify(req.body.events.filter((e) => e === '*' || WEBHOOK_EVENTS[e])), Number(req.params.id));
  res.json({ ok: true });
});

api.delete('/hub/webhooks/:id', requireRole('owner', 'admin'), (req, res) => {
  db.prepare('DELETE FROM webhooks WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

api.post('/hub/webhooks/:id/test', requireRole('owner', 'admin'), wrap(async (req, res) => {
  const w = db.prepare('SELECT * FROM webhooks WHERE id = ?').get(Number(req.params.id));
  if (!w) return res.status(404).json({ error: 'Webhook not found' });
  const id = db.prepare('INSERT INTO webhook_deliveries (webhook_id, event, payload) VALUES (?, ?, ?)').run(w.id, 'test.ping', JSON.stringify({ event: 'test.ping', created_at: new Date().toISOString(), data: { message: 'Hello from your CRM' } })).lastInsertRowid;
  await processDeliveries();
  res.json(db.prepare('SELECT status, response_code, error FROM webhook_deliveries WHERE id = ?').get(Number(id)));
}));

api.post('/hub/api-keys', requireRole('owner', 'admin'), (req, res) => res.status(201).json(createApiKey(req.user.id, req.body.name)));
api.delete('/hub/api-keys/:id', requireRole('owner', 'admin'), (req, res) => {
  revokeApiKey(Number(req.params.id));
  res.json({ ok: true });
});

api.post('/hub/slack', requireRole('owner', 'admin'), wrap(async (req, res) => {
  const url = String(req.body.url ?? '').trim();
  if (req.body.events) setSetting('slack_events', req.body.events.filter((e) => WEBHOOK_EVENTS[e]).join(','));
  if (req.body.url !== undefined) {
    if (url) {
      try {
        await slackNotify(':white_check_mark: Your CRM is connected to Slack.', url);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }
    setSetting('slack_webhook_url', url);
  }
  res.json({ ok: true });
}));
