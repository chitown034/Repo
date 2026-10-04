import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { db, getSettings, getSetting, setSetting } from './db.js';
import { logActivity, getContact } from './contacts.js';
import { escapeHtml, fullName, token, inQuietHours, msUntilQuietEnds, sqlNow } from './util.js';

export const APP_URL = (process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');

export function appSecret() {
  if (process.env.APP_SECRET) return process.env.APP_SECRET;
  let s = getSetting('app_secret');
  if (!s) {
    s = token(32);
    setSetting('app_secret', s);
  }
  return s;
}

export function signId(kind, id) {
  return crypto.createHmac('sha256', appSecret()).update(`${kind}:${id}`).digest('base64url').slice(0, 22);
}

export function unsubscribeUrl(contactId) {
  return `${APP_URL}/u/${contactId}/${signId('unsub', contactId)}`;
}

export function providerStatus() {
  return {
    sms: process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER ? 'twilio' : 'simulated',
    voice: process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER ? 'twilio' : 'simulated',
    email: process.env.SMTP_HOST ? 'smtp' : 'simulated',
    ai: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN ? 'claude' : 'templates',
    from_number: process.env.TWILIO_FROM_NUMBER || null,
    from_email: process.env.SMTP_FROM || null,
  };
}

async function twilio(pathname, params) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/${pathname}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${body.message || 'request failed'}`);
  return body;
}

/** Verify an inbound Twilio webhook so nobody can forge replies or opt-outs. */
export function verifyTwilioSignature(req) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true; // simulated mode
  const url = `${APP_URL}${req.originalUrl}`;
  const data = Object.keys(req.body || {})
    .sort()
    .reduce((acc, k) => acc + k + req.body[k], url);
  const expected = crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64');
  const got = req.headers['x-twilio-signature'] || '';
  return got.length === expected.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

let transport;
function mailer() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transport;
}

function smsFooter(settings, isFirstText) {
  return isFirstText ? `\n- ${settings.loan_officer_name || settings.company_name}. Reply STOP to opt out.` : '';
}

function emailHtml(body, contact, settings, trackingToken) {
  let html = escapeHtml(body).replace(/\n/g, '<br>');
  if (trackingToken) {
    // Rewrite links through the click tracker for attribution.
    html = html.replace(/(https?:\/\/[^\s<]+)/g, (url) => `<a href="${APP_URL}/t/c/${trackingToken}?u=${encodeURIComponent(url)}">${url}</a>`);
  }
  const nmls = [settings.loan_officer_nmls && `NMLS #${settings.loan_officer_nmls}`, settings.company_nmls && `Company NMLS #${settings.company_nmls}`]
    .filter(Boolean)
    .join(' · ');
  return `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1f2937;max-width:600px">
${html}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 12px">
<div style="font-size:12px;color:#6b7280">${escapeHtml(settings.loan_officer_name || '')}${settings.loan_officer_name ? ' · ' : ''}${escapeHtml(settings.company_name)}${nmls ? `<br>${escapeHtml(nmls)}` : ''}${settings.business_address ? `<br>${escapeHtml(settings.business_address)}` : ''}<br>Equal Housing Opportunity.
<br><a href="${unsubscribeUrl(contact.id)}" style="color:#6b7280">Unsubscribe</a></div>
${trackingToken ? `<img src="${APP_URL}/t/o/${trackingToken}.gif" width="1" height="1" alt="" style="display:none">` : ''}
</div>`;
}

export class SendBlocked extends Error {}

/**
 * Send one SMS or email to a contact right now. Enforces opt-outs and DNC,
 * adds required compliance footers, and logs the message on the contact timeline.
 */
export async function sendMessage(contactId, { channel, subject, body, userId = null, source = 'manual', trackingToken = null, meta = {} }) {
  const contact = getContact(contactId);
  if (!contact) throw new SendBlocked('Contact not found');
  const settings = getSettings();
  if (contact.dnc) throw new SendBlocked('Contact is marked Do Not Contact');
  if (!body || !String(body).trim()) throw new SendBlocked('Message is empty');

  let providerId = null;
  let simulated = false;
  if (channel === 'sms') {
    if (contact.opted_out_sms) throw new SendBlocked('Contact opted out of texts');
    if (!contact.phone_norm) throw new SendBlocked('Contact has no valid phone number');
    const priorTexts = db.prepare(`SELECT COUNT(*) n FROM activities WHERE contact_id = ? AND type = 'sms' AND direction = 'out'`).get(contactId).n;
    const text = `${body.trim()}${smsFooter(settings, priorTexts === 0)}`;
    if (providerStatus().sms === 'twilio') {
      const r = await twilio('Messages.json', {
        To: contact.phone_norm,
        From: process.env.TWILIO_FROM_NUMBER,
        Body: text,
        ...(process.env.APP_URL ? { StatusCallback: `${APP_URL}/webhooks/twilio/status` } : {}),
      });
      providerId = r.sid;
    } else simulated = true;
    logActivity(contactId, { type: 'sms', direction: 'out', body: text, userId, meta: { ...meta, source, providerId, simulated } });
  } else if (channel === 'email') {
    if (contact.opted_out_email) throw new SendBlocked('Contact unsubscribed from email');
    if (!contact.email_norm) throw new SendBlocked('Contact has no valid email address');
    const subj = subject || `A quick note from ${settings.loan_officer_name || settings.company_name}`;
    if (providerStatus().email === 'smtp') {
      const r = await mailer().sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: `"${fullName(contact).replace(/"/g, '')}" <${contact.email_norm}>`,
        subject: subj,
        text: `${body}\n\n--\n${settings.company_name}\nUnsubscribe: ${unsubscribeUrl(contact.id)}`,
        html: emailHtml(body, contact, settings, trackingToken),
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl(contact.id)}>` },
      });
      providerId = r.messageId;
    } else simulated = true;
    logActivity(contactId, { type: 'email', direction: 'out', subject: subj, body, userId, meta: { ...meta, source, providerId, simulated } });
  } else {
    throw new SendBlocked(`Unsupported channel: ${channel}`);
  }
  return { ok: true, simulated, providerId };
}

/**
 * Click-to-call: Twilio rings the loan officer's phone first, then bridges to the contact
 * from the workspace number so caller ID is always your business line.
 */
export async function startCall(contactId, user) {
  const contact = getContact(contactId);
  if (!contact?.phone_norm) throw new SendBlocked('Contact has no valid phone number');
  if (contact.dnc) throw new SendBlocked('Contact is marked Do Not Contact');
  if (providerStatus().voice !== 'twilio') return { simulated: true, dial: contact.phone_norm };
  if (!user.phone) throw new SendBlocked('Add your own phone number in Team settings to use click-to-call');
  const twiml = `<Response><Say>Connecting you to ${escapeHtml(fullName(contact))}.</Say><Dial callerId="${process.env.TWILIO_FROM_NUMBER}" record="record-from-answer-dual">${contact.phone_norm}</Dial></Response>`;
  const r = await twilio('Calls.json', { To: user.phone, From: process.env.TWILIO_FROM_NUMBER, Twiml: twiml });
  return { simulated: false, sid: r.sid };
}

/** Queue an automated message. The scheduler delivers it outside quiet hours. */
export function enqueue(contactId, { channel, subject = null, body, source, refId = null, userId = null }) {
  const s = getSettings();
  const delay = channel === 'sms' ? msUntilQuietEnds(s.timezone, s.quiet_start, s.quiet_end) : 0;
  db.prepare('INSERT INTO outbox (contact_id, user_id, channel, subject, body, source, ref_id, send_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    contactId,
    userId,
    channel,
    subject,
    body,
    source,
    refId,
    sqlNow(delay),
  );
}

export async function processOutbox(limit = 50) {
  const s = getSettings();
  const quiet = inQuietHours(s.timezone, s.quiet_start, s.quiet_end);
  const rows = db
    .prepare(`SELECT * FROM outbox WHERE status = 'queued' AND send_after <= datetime('now') ${quiet ? "AND channel <> 'sms'" : ''} ORDER BY id LIMIT ?`)
    .all(limit);
  let sent = 0;
  for (const row of rows) {
    db.prepare(`UPDATE outbox SET status = 'sending' WHERE id = ?`).run(row.id);
    try {
      let trackingToken = null;
      if (row.source === 'campaign') {
        trackingToken = db.prepare('SELECT token FROM campaign_sends WHERE id = ?').get(row.ref_id)?.token ?? null;
      }
      await sendMessage(row.contact_id, {
        channel: row.channel,
        subject: row.subject,
        body: row.body,
        userId: row.user_id,
        source: row.source,
        trackingToken,
        meta: { outbox: row.id, ref: row.ref_id },
      });
      db.prepare(`UPDATE outbox SET status = 'sent', sent_at = datetime('now') WHERE id = ?`).run(row.id);
      if (row.source === 'campaign') db.prepare(`UPDATE campaign_sends SET status = 'sent', sent_at = datetime('now') WHERE id = ?`).run(row.ref_id);
      if (row.source === 'ai') db.prepare(`UPDATE contacts SET last_ai_at = datetime('now') WHERE id = ?`).run(row.contact_id);
      sent++;
    } catch (err) {
      const status = err instanceof SendBlocked ? 'blocked' : 'failed';
      db.prepare('UPDATE outbox SET status = ?, error = ? WHERE id = ?').run(status, err.message, row.id);
      if (row.source === 'campaign') db.prepare('UPDATE campaign_sends SET status = ? WHERE id = ?').run(status, row.ref_id);
    }
  }
  return { sent, attempted: rows.length };
}

const STOP_WORDS = /^\s*(stop|stopall|unsubscribe|cancel|end|quit|opt[- ]?out|remove me)\s*[.!]*\s*$/i;
const START_WORDS = /^\s*(start|unstop|yes)\s*$/i;

export function isOptOut(text) {
  return STOP_WORDS.test(text || '');
}
export function isOptIn(text) {
  return START_WORDS.test(text || '');
}
