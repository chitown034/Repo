import { db, getSetting, setSetting, STAGE_KEYS, json } from './db.js';
import { normalizeEmail, normalizePhone, titleCase, toNumber, toDateISO } from './util.js';
import { rescoreContact } from './scoring.js';
import { emit } from './events.js';

export const CONTACT_FIELDS = [
  'first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'source', 'stage', 'owner_id',
  'lead_type', 'loan_type', 'loan_purpose', 'credit_band', 'property_value', 'loan_amount', 'current_rate',
  'loan_close_date', 'purchase_timeline', 'preapproved', 'is_veteran', 'first_time_buyer', 'annual_income', 'tags',
  'opted_out_sms', 'opted_out_email', 'dnc', 'ai_paused',
];
const NUMERIC = new Set(['property_value', 'loan_amount', 'current_rate', 'annual_income', 'owner_id']);
const BOOLEAN = new Set(['preapproved', 'is_veteran', 'first_time_buyer', 'opted_out_sms', 'opted_out_email', 'dnc', 'ai_paused']);

/** Clean + enrich a raw record: normalize phone/email, fix casing, coerce numbers, derive fields. */
export function cleanContact(raw) {
  const out = {};
  for (const f of CONTACT_FIELDS) {
    if (raw[f] === undefined) continue;
    let v = raw[f];
    if (Array.isArray(v)) v = v.join(',');
    if (typeof v === 'string') v = v.trim();
    if (NUMERIC.has(f)) v = toNumber(v);
    else if (BOOLEAN.has(f)) v = v === true || /^(1|true|yes|y|x)$/i.test(String(v)) ? 1 : 0;
    else if (f === 'loan_close_date') v = toDateISO(v);
    else if (f === 'first_name' || f === 'last_name' || f === 'city') v = titleCase(v) || null;
    else if (f === 'state') v = v ? String(v).toUpperCase().slice(0, 2) : null;
    else if (f === 'stage') v = STAGE_KEYS.includes(v) ? v : 'new';
    else if (v === '') v = null;
    out[f] = v;
  }
  // A rate entered as 0.0675 instead of 6.75
  if (out.current_rate != null && out.current_rate > 0 && out.current_rate < 1) out.current_rate = +(out.current_rate * 100).toFixed(3);
  if (out.email !== undefined) out.email_norm = normalizeEmail(out.email);
  if (out.phone !== undefined) out.phone_norm = normalizePhone(out.phone);
  if (!out.first_name && raw.name) {
    const [first, ...rest] = String(raw.name).trim().split(/\s+/);
    out.first_name = titleCase(first);
    out.last_name = titleCase(rest.join(' ')) || null;
  }
  return out;
}

export function findDuplicate({ email_norm, phone_norm }) {
  if (email_norm) {
    const c = db.prepare('SELECT * FROM contacts WHERE email_norm = ?').get(email_norm);
    if (c) return c;
  }
  if (phone_norm) {
    const c = db.prepare('SELECT * FROM contacts WHERE phone_norm = ?').get(phone_norm);
    if (c) return c;
  }
  return null;
}

/** Pick the next loan officer for a new lead using round-robin or weighted routing. */
export function routeLead() {
  const mode = getSetting('routing_mode');
  const users = db.prepare('SELECT id, routing_weight FROM users WHERE active = 1 AND receives_leads = 1 ORDER BY id').all();
  if (!users.length || mode === 'manual') {
    return db.prepare(`SELECT id FROM users WHERE role = 'owner' ORDER BY id LIMIT 1`).get()?.id ?? null;
  }
  const slots = mode === 'weighted' ? users.flatMap((u) => Array(Math.max(1, u.routing_weight)).fill(u.id)) : users.map((u) => u.id);
  const cursor = Number(getSetting('routing_cursor')) || 0;
  setSetting('routing_cursor', (cursor + 1) % slots.length);
  return slots[cursor % slots.length];
}

export function logActivity(contactId, { type, direction = null, subject = null, body = null, meta = {}, userId = null }) {
  const r = db
    .prepare('INSERT INTO activities (contact_id, user_id, type, direction, subject, body, meta) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(contactId, userId, type, direction, subject, body, JSON.stringify(meta));
  if (['call', 'sms', 'email', 'voicemail'].includes(type) && direction === 'out') {
    db.prepare(`UPDATE contacts SET last_contacted_at = datetime('now') WHERE id = ?`).run(contactId);
  }
  if (direction === 'in') {
    db.prepare(`UPDATE contacts SET last_inbound_at = datetime('now'), last_contacted_at = COALESCE(last_contacted_at, datetime('now')) WHERE id = ?`).run(contactId);
  }
  return Number(r.lastInsertRowid);
}

export function getContact(id) {
  return db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
}

/**
 * Insert a new contact, or merge into an existing one matched by email/phone.
 * Merging only fills blanks - it never overwrites data you already have.
 */
export function upsertContact(raw, { source = null, userId = null, route = true, emitEvents = true } = {}) {
  const data = cleanContact(raw);
  if (source && !data.source) data.source = source;
  const dup = findDuplicate(data);
  if (dup) {
    const fills = {};
    for (const [k, v] of Object.entries(data)) {
      if (v == null || v === '') continue;
      if (k === 'tags') {
        const merged = [...new Set([...(dup.tags || '').split(','), ...String(v).split(',')].map((t) => t.trim()).filter(Boolean))].join(',');
        if (merged !== dup.tags) fills.tags = merged;
      } else if (dup[k] == null || dup[k] === '') fills[k] = v;
    }
    if (Object.keys(fills).length) updateContact(dup.id, fills, { userId, silent: true });
    return { contact: getContact(dup.id), created: false, merged: Object.keys(fills) };
  }

  if (!data.first_name && !data.last_name && !data.email_norm && !data.phone_norm) {
    throw new Error('A contact needs at least a name, email, or phone number');
  }
  if (data.owner_id == null && route) data.owner_id = routeLead();
  if (!data.stage) data.stage = 'new';
  const cols = Object.keys(data);
  const r = db
    .prepare(`INSERT INTO contacts (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
    .run(...cols.map((c) => data[c]));
  const id = Number(r.lastInsertRowid);
  logActivity(id, { type: 'system', body: `Contact created${data.source ? ` from ${data.source}` : ''}`, userId });
  rescoreContact(id, { log: false });
  const contact = getContact(id);
  if (emitEvents) emit('contact.created', { contact, userId });
  return { contact, created: true, merged: [] };
}

export function updateContact(id, patch, { userId = null, silent = false } = {}) {
  const before = getContact(id);
  if (!before) return null;
  const data = cleanContact(patch);
  delete data.stage; // stage changes go through changeStage so automation fires
  const cols = Object.keys(data);
  if (cols.length) {
    db.prepare(`UPDATE contacts SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(
      ...cols.map((c) => data[c]),
      id,
    );
  }
  if (patch.stage && patch.stage !== before.stage) changeStage(id, patch.stage, { userId, reason: silent ? 'import' : 'manual' });
  if (data.owner_id && data.owner_id !== before.owner_id) {
    const owner = db.prepare('SELECT name FROM users WHERE id = ?').get(data.owner_id);
    logActivity(id, { type: 'system', body: `Assigned to ${owner?.name || 'user #' + data.owner_id}`, userId });
  }
  rescoreContact(id);
  return getContact(id);
}

export function changeStage(id, stage, { userId = null, reason = 'manual' } = {}) {
  if (!STAGE_KEYS.includes(stage)) throw new Error(`Unknown stage: ${stage}`);
  const before = getContact(id);
  if (!before || before.stage === stage) return before;
  const extra = {};
  if (stage === 'funded') {
    // A funded loan becomes a past client with a loan we can watch for refi opportunities.
    extra.lead_type = 'past_client';
    extra.loan_close_date = before.loan_close_date && before.stage === 'funded' ? before.loan_close_date : new Date().toISOString().slice(0, 10);
  }
  const sets = ['stage = ?', `stage_changed_at = datetime('now')`, `updated_at = datetime('now')`];
  const vals = [stage];
  for (const [k, v] of Object.entries(extra)) {
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  db.prepare(`UPDATE contacts SET ${sets.join(', ')} WHERE id = ?`).run(...vals, id);
  logActivity(id, { type: 'stage_change', body: `Stage: ${before.stage} → ${stage}`, meta: { from: before.stage, to: stage, reason }, userId });
  rescoreContact(id);
  const contact = getContact(id);
  emit('stage.changed', { contact, from: before.stage, to: stage, reason, userId });
  return contact;
}

export function addFacts(id, facts) {
  if (!facts?.length) return;
  const c = getContact(id);
  const existing = json(c.facts, []);
  const known = new Set(existing.map((f) => f.toLowerCase()));
  const fresh = facts.map((f) => String(f).trim()).filter((f) => f && !known.has(f.toLowerCase()));
  if (!fresh.length) return;
  db.prepare('UPDATE contacts SET facts = ? WHERE id = ?').run(JSON.stringify([...existing, ...fresh].slice(-40)), id);
  logActivity(id, { type: 'ai', body: `Learned: ${fresh.join('; ')}`, meta: { facts: fresh } });
}

export function serializeContact(c) {
  if (!c) return null;
  return { ...c, facts: json(c.facts, []), score_reasons: json(c.score_reasons, []), tags: (c.tags || '').split(',').filter(Boolean) };
}
