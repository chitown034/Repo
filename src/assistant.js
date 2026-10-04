import { db, getSettings, json } from './db.js';
import { getContact, logActivity, addFacts, changeStage, updateContact } from './contacts.js';
import { draftOutreach, analyzeReply } from './ai.js';
import { enqueue, isOptOut, isOptIn, sendMessage } from './messaging.js';
import { rescoreContact } from './scoring.js';
import { emit } from './events.js';
import { daysSince, fullName } from './util.js';

function recentActivities(contactId, limit = 15) {
  return db.prepare('SELECT * FROM activities WHERE contact_id = ? ORDER BY created_at DESC, id DESC LIMIT ?').all(contactId, limit);
}

function preferredChannel(contact) {
  if (contact.phone_norm && !contact.opted_out_sms) return 'sms';
  if (contact.email_norm && !contact.opted_out_email) return 'email';
  return null;
}

export function assistantEligible(contact) {
  return !contact.dnc && !contact.ai_paused && preferredChannel(contact) && !['application', 'processing', 'underwriting', 'clear_to_close'].includes(contact.stage);
}

/**
 * Draft a message for a contact. In approval mode it waits in the queue;
 * in autonomous mode it's queued for delivery (respecting quiet hours).
 */
export async function proposeOutreach(contactId, reason, { channel = null, force = false } = {}) {
  const settings = getSettings();
  const contact = getContact(contactId);
  if (!contact) return null;
  if (!force && (settings.assistant_mode === 'off' || !assistantEligible(contact))) return null;
  const ch = channel || preferredChannel(contact);
  if (!ch) return null;
  const pending = db.prepare(`SELECT id FROM ai_drafts WHERE contact_id = ? AND status = 'pending'`).get(contactId);
  if (pending && !force) return null;

  const draft = await draftOutreach(contact, { reason, channel: ch, activities: recentActivities(contactId) });
  return saveDraft(contact, { channel: ch, subject: draft.subject, body: draft.body, reason, generator: draft.generator }, settings);
}

function saveDraft(contact, { channel, subject, body, reason, generator }, settings = getSettings()) {
  const r = db.prepare('INSERT INTO ai_drafts (contact_id, channel, subject, body, reason) VALUES (?, ?, ?, ?, ?)').run(contact.id, channel, subject, body, reason);
  const draftId = Number(r.lastInsertRowid);
  db.prepare(`UPDATE contacts SET last_ai_at = datetime('now'), ai_scan_score = score WHERE id = ?`).run(contact.id);
  if (settings.assistant_mode === 'autonomous') {
    approveDraft(draftId, null);
  } else {
    logActivity(contact.id, { type: 'ai', body: `${settings.assistant_name} drafted a ${channel} for approval: ${reason}`, meta: { draftId, generator } });
  }
  return draftId;
}

export function approveDraft(draftId, userId, edits = {}) {
  const d = db.prepare('SELECT * FROM ai_drafts WHERE id = ?').get(draftId);
  if (!d || d.status !== 'pending') throw new Error('Draft is not pending');
  const subject = edits.subject ?? d.subject;
  const body = edits.body ?? d.body;
  db.prepare(`UPDATE ai_drafts SET status = 'approved', subject = ?, body = ?, decided_at = datetime('now'), decided_by = ? WHERE id = ?`).run(subject, body, userId, draftId);
  enqueue(d.contact_id, { channel: d.channel, subject, body, source: 'ai', refId: draftId, userId });
  return true;
}

export function rejectDraft(draftId, userId) {
  db.prepare(`UPDATE ai_drafts SET status = 'rejected', decided_at = datetime('now'), decided_by = ? WHERE id = ? AND status = 'pending'`).run(userId, draftId);
}

/**
 * The background scan: find who's worth reaching out to right now -
 * brand-new leads nobody has touched, rising scores, and long silences.
 */
export async function scanForOutreach({ limit = 25 } = {}) {
  const s = getSettings();
  if (s.assistant_mode === 'off') return { proposed: 0 };
  const dormant = Number(s.dormant_days) || 90;
  const speed = Number(s.speed_to_lead_minutes) || 5;
  const base = `dnc = 0 AND ai_paused = 0 AND stage NOT IN ('application','processing','underwriting','clear_to_close','lost')
    AND ((phone_norm IS NOT NULL AND opted_out_sms = 0) OR (email_norm IS NOT NULL AND opted_out_email = 0))
    AND id NOT IN (SELECT contact_id FROM ai_drafts WHERE status = 'pending')`;

  const candidates = [];
  // 1. Speed to lead: new leads with no outbound touch after N minutes.
  for (const c of db
    .prepare(`SELECT * FROM contacts WHERE ${base} AND stage = 'new' AND last_contacted_at IS NULL AND last_ai_at IS NULL
              AND created_at <= datetime('now', ?) AND created_at >= datetime('now','-3 days') ORDER BY created_at LIMIT ?`)
    .all(`-${speed} minutes`, limit)) {
    candidates.push([c, 'New lead - nobody has responded yet']);
  }
  // 2. Rising scores since the assistant last looked.
  for (const c of db
    .prepare(`SELECT * FROM contacts WHERE ${base} AND score >= 40 AND score - COALESCE(ai_scan_score, score_prev) >= 10
              AND (last_ai_at IS NULL OR last_ai_at <= datetime('now','-7 days'))
              AND (last_contacted_at IS NULL OR last_contacted_at <= datetime('now','-3 days'))
              ORDER BY score DESC LIMIT ?`)
    .all(limit)) {
    const top = json(c.score_reasons, []).find((r) => r.pts > 0)?.why || 'score rising';
    candidates.push([c, `Ready Score rose to ${c.score}: ${top}`]);
  }
  // 3. Long silence.
  for (const c of db
    .prepare(`SELECT * FROM contacts WHERE ${base} AND stage <> 'new'
              AND COALESCE(last_contacted_at, created_at) <= datetime('now', ?)
              AND (last_ai_at IS NULL OR last_ai_at <= datetime('now','-30 days'))
              ORDER BY score DESC LIMIT ?`)
    .all(`-${dormant} days`, limit)) {
    const top = json(c.score_reasons, []).find((r) => r.pts > 0)?.why;
    candidates.push([c, `No contact in ${Math.round(daysSince(c.last_contacted_at || c.created_at))} days${top ? `; ${top}` : ''}`]);
  }

  const seen = new Set();
  let proposed = 0;
  for (const [c, reason] of candidates) {
    if (seen.has(c.id) || proposed >= limit) continue;
    seen.add(c.id);
    if (await proposeOutreach(c.id, reason)) proposed++;
  }
  return { proposed };
}

/**
 * Every inbound text/email lands here: opt-outs are honored immediately with no override,
 * facts are learned, warm contacts are handed to the loan officer, and the rest get a reply drafted.
 */
export async function handleInbound(contactId, { channel, body, subject = null, meta = {} }) {
  const settings = getSettings();
  logActivity(contactId, { type: channel, direction: 'in', subject, body, meta });
  let contact = getContact(contactId);

  if (channel === 'sms' && isOptOut(body)) {
    db.prepare(`UPDATE contacts SET opted_out_sms = 1 WHERE id = ?`).run(contactId);
    db.prepare(`UPDATE ai_drafts SET status = 'rejected', decided_at = datetime('now') WHERE contact_id = ? AND status = 'pending' AND channel = 'sms'`).run(contactId);
    db.prepare(`UPDATE outbox SET status = 'blocked', error = 'opted out' WHERE contact_id = ? AND status = 'queued' AND channel = 'sms'`).run(contactId);
    logActivity(contactId, { type: 'system', body: 'Opted out of texts (STOP). All automated texting stopped.' });
    rescoreContact(contactId);
    return { intent: 'opt_out' };
  }
  if (channel === 'sms' && contact.opted_out_sms && isOptIn(body)) {
    db.prepare(`UPDATE contacts SET opted_out_sms = 0 WHERE id = ?`).run(contactId);
    logActivity(contactId, { type: 'system', body: 'Re-subscribed to texts (START).' });
    return { intent: 'opt_in' };
  }

  emit('contact.replied', { contact, channel });
  rescoreContact(contactId);
  contact = getContact(contactId);

  // Automated stage move: a reply from a new or nurture lead means a live conversation.
  if (settings.auto_stage_rules === '1' && ['new', 'nurture', 'lost'].includes(contact.stage)) {
    changeStage(contactId, 'contacted', { reason: 'replied' });
  }

  const analysis = await analyzeReply(contact, body, recentActivities(contactId));
  addFacts(contactId, analysis.facts);
  if (analysis.timeline && !contact.purchase_timeline && contact.lead_type === 'purchase') {
    updateContact(contactId, { purchase_timeline: analysis.timeline });
  }

  if (analysis.intent === 'opt_out') {
    const field = channel === 'sms' ? 'opted_out_sms' : 'opted_out_email';
    db.prepare(`UPDATE contacts SET ${field} = 1 WHERE id = ?`).run(contactId);
    logActivity(contactId, { type: 'system', body: `Asked to stop ${channel === 'sms' ? 'texts' : 'emails'} - opted out.` });
    return analysis;
  }
  if (analysis.intent === 'wrong_person') {
    db.prepare(`UPDATE contacts SET ai_paused = 1 WHERE id = ?`).run(contactId);
    logActivity(contactId, { type: 'ai', body: `Possible wrong contact info - ${settings.assistant_name} paused. ${analysis.summary}` });
    return analysis;
  }
  if (analysis.intent === 'not_interested') {
    if (settings.auto_stage_rules === '1') changeStage(contactId, 'nurture', { reason: 'not interested' });
  }
  if (analysis.intent === 'warm') {
    handoff(contactId, analysis.summary);
    return analysis;
  }
  if (analysis.suggested_reply && !contact.ai_paused && settings.assistant_mode !== 'off') {
    saveDraft(getContact(contactId), { channel, subject: subject ? `Re: ${subject.replace(/^re:\s*/i, '')}` : null, body: analysis.suggested_reply, reason: `Reply to: "${body.slice(0, 80)}"`, generator: 'reply' }, settings);
  }
  return analysis;
}

/** Warm handoff: pause the assistant, create an urgent task for the owner, and notify them. */
export function handoff(contactId, summary) {
  const settings = getSettings();
  const contact = getContact(contactId);
  db.prepare(`UPDATE contacts SET ai_paused = 1 WHERE id = ?`).run(contactId);
  db.prepare(`UPDATE ai_drafts SET status = 'rejected', decided_at = datetime('now') WHERE contact_id = ? AND status = 'pending'`).run(contactId);
  db.prepare(`INSERT INTO tasks (contact_id, user_id, title, kind, due_at) VALUES (?, ?, ?, 'handoff', datetime('now'))`).run(
    contactId,
    contact.owner_id,
    `🔥 Warm handoff: call ${fullName(contact)} - ${summary}`.slice(0, 240),
  );
  logActivity(contactId, { type: 'ai', body: `Warm handoff to loan officer. ${settings.assistant_name} stepped aside. ${summary}`, meta: { handoff: true } });
  emit('contact.handoff', { contact, summary });
  notifyOwner(contact, summary).catch((e) => console.error('[assistant] owner notify failed', e.message));
}

async function notifyOwner(contact, summary) {
  const owner = contact.owner_id && db.prepare('SELECT * FROM users WHERE id = ?').get(contact.owner_id);
  if (!owner?.email || !process.env.SMTP_HOST) return;
  const { default: nodemailer } = await import('nodemailer');
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  const url = `${(process.env.APP_URL || '').replace(/\/$/, '')}/#/contacts/${contact.id}`;
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: owner.email,
    subject: `Warm lead: ${fullName(contact)} is ready to talk`,
    text: `${summary}\n\nPhone: ${contact.phone || 'n/a'}\nEmail: ${contact.email || 'n/a'}\n\n${url}`,
  });
}

/** Human takeover: a manual message pauses the assistant for that contact. */
export async function sendManual(contactId, { channel, subject, body, userId }) {
  const result = await sendMessage(contactId, { channel, subject, body, userId, source: 'manual' });
  db.prepare('UPDATE contacts SET ai_paused = 1 WHERE id = ? AND ai_paused = 0').run(contactId);
  db.prepare(`UPDATE ai_drafts SET status = 'rejected', decided_at = datetime('now') WHERE contact_id = ? AND status = 'pending'`).run(contactId);
  return result;
}
