import crypto from 'node:crypto';
import net from 'node:net';
import { db, getSetting, json } from './db.js';
import { bus } from './events.js';
import { fullName } from './util.js';
import { APP_URL } from './messaging.js';

/** Events other systems (Zapier, Make, your own code) can subscribe to. */
export const WEBHOOK_EVENTS = {
  'contact.created': 'A contact is created (any source)',
  'form.submitted': 'A landing page or inbound-webhook lead arrives',
  'stage.changed': 'A contact moves to a new pipeline stage',
  'loan.funded': 'A loan is marked Funded',
  'contact.replied': 'A contact replies by text or email',
  'contact.handoff': 'The assistant hands off a warm lead',
  'tag.added': 'A tag is added to a contact',
  'workflow.completed': 'A contact finishes a workflow',
  'content.published': 'Marketing content is published from the Content Studio',
};

export function contactPayload(c) {
  if (!c) return null;
  return {
    id: c.id, first_name: c.first_name, last_name: c.last_name, name: fullName(c), email: c.email, phone: c.phone_norm || c.phone,
    stage: c.stage, lead_type: c.lead_type, source: c.source, score: c.score, owner_id: c.owner_id, partner_id: c.partner_id,
    tags: (c.tags || '').split(',').filter(Boolean), loan_type: c.loan_type, loan_amount: c.loan_amount, property_value: c.property_value,
    current_rate: c.current_rate, city: c.city, state: c.state, zip: c.zip, url: `${APP_URL}/#/contacts/${c.id}`,
  };
}

/** Block requests to loopback/private networks unless explicitly allowed (SSRF protection). */
export function assertPublicUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new Error('Enter a valid URL');
  }
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('URL must start with http:// or https://');
  if (process.env.ALLOW_PRIVATE_WEBHOOKS === '1') return u;
  const host = u.hostname.replace(/^\[|\]$/g, '');
  const privateV4 = /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/;
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal') || (net.isIPv4(host) && privateV4.test(host)) || (net.isIPv6(host) && /^(::1?$|f[cd]|fe80)/i.test(host))) {
    throw new Error('Private and local network addresses are not allowed');
  }
  return u;
}

export function sign(secret, body) {
  return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
}

/** Queue an event for every subscribed webhook (+ Slack if enabled for it). */
export function dispatch(event, data) {
  const hooks = db.prepare('SELECT * FROM webhooks WHERE active = 1').all().filter((h) => {
    const ev = json(h.events, []);
    return ev.includes('*') || ev.includes(event);
  });
  const payload = JSON.stringify({ event, created_at: new Date().toISOString(), data });
  for (const h of hooks) db.prepare('INSERT INTO webhook_deliveries (webhook_id, event, payload) VALUES (?, ?, ?)').run(h.id, event, payload);
  if (hooks.length) setTimeout(() => processDeliveries().catch(() => {}), 10);
  const slackEvents = String(getSetting('slack_events') || '').split(',');
  if (getSetting('slack_webhook_url') && slackEvents.includes(event)) slackNotify(slackText(event, data)).catch((e) => console.error('[slack]', e.message));
}

const BACKOFF_MIN = [1, 10, 60, 360];

export async function processDeliveries(limit = 25) {
  const due = db
    .prepare(`SELECT d.*, w.url, w.secret FROM webhook_deliveries d JOIN webhooks w ON w.id = d.webhook_id WHERE d.status = 'pending' AND d.next_attempt_at <= datetime('now') ORDER BY d.id LIMIT ?`)
    .all(limit);
  for (const d of due) {
    db.prepare(`UPDATE webhook_deliveries SET status = 'sending' WHERE id = ? AND status = 'pending'`).run(d.id);
    let code = null;
    let error = null;
    try {
      assertPublicUrl(d.url);
      const res = await fetch(d.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'MortgageLeadCRM-Webhooks/1.0', 'X-CRM-Event': d.event, 'X-CRM-Delivery': String(d.id), 'X-CRM-Signature': sign(d.secret, d.payload) },
        body: d.payload,
        signal: AbortSignal.timeout(10_000),
      });
      code = res.status;
      if (!res.ok) error = `HTTP ${res.status}`;
    } catch (err) {
      error = err.message;
    }
    const attempts = d.attempts + 1;
    if (!error) {
      db.prepare(`UPDATE webhook_deliveries SET status = 'delivered', attempts = ?, response_code = ?, error = NULL WHERE id = ?`).run(attempts, code, d.id);
    } else if (attempts > BACKOFF_MIN.length) {
      db.prepare(`UPDATE webhook_deliveries SET status = 'failed', attempts = ?, response_code = ?, error = ? WHERE id = ?`).run(attempts, code, error, d.id);
    } else {
      db.prepare(`UPDATE webhook_deliveries SET status = 'pending', attempts = ?, response_code = ?, error = ?, next_attempt_at = datetime('now', ?) WHERE id = ?`).run(
        attempts, code, error, `+${BACKOFF_MIN[attempts - 1]} minutes`, d.id,
      );
    }
  }
  return due.length;
}

/** One-off POST used by workflow "Send webhook" steps. */
export async function postJson(url, body) {
  assertPublicUrl(url);
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'MortgageLeadCRM-Workflows/1.0' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.status;
}

export async function slackNotify(text, url = getSetting('slack_webhook_url')) {
  if (!url) return { skipped: true };
  if (!/^https:\/\/hooks\.slack\.com\//.test(url) && process.env.ALLOW_PRIVATE_WEBHOOKS !== '1') throw new Error('Slack URL must be a https://hooks.slack.com/ incoming webhook');
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Slack HTTP ${res.status}`);
  return { ok: true };
}

function slackText(event, data) {
  const c = data.contact;
  const link = c ? ` <${c.url}|${c.name}>` : '';
  switch (event) {
    case 'contact.handoff': return `:fire: Warm handoff:${link} - ${data.summary || ''}`;
    case 'contact.created': return `:wave: New lead:${link} (${c?.source || 'unknown source'}, score ${c?.score ?? 0})`;
    case 'loan.funded': return `:tada: Funded!${link}${c?.loan_amount ? ` - $${Math.round(c.loan_amount).toLocaleString()}` : ''}`;
    case 'stage.changed': return `:arrow_right:${link} moved ${data.from} → ${data.to}`;
    case 'contact.replied': return `:speech_balloon:${link} replied by ${data.channel}`;
    case 'form.submitted': return `:magnet: Form submitted:${link}`;
    default: return `${event}:${link}`;
  }
}

/** Bridge internal events to webhooks/Slack. */
export function registerHooks() {
  bus.on('contact.created', ({ contact }) => dispatch('contact.created', { contact: contactPayload(contact) }));
  bus.on('form.submitted', ({ contact, landingPageId }) => dispatch('form.submitted', { contact: contactPayload(contact), landing_page_id: landingPageId }));
  bus.on('stage.changed', ({ contact, from, to }) => {
    dispatch('stage.changed', { contact: contactPayload(contact), from, to });
    if (to === 'funded') dispatch('loan.funded', { contact: contactPayload(contact) });
  });
  bus.on('contact.replied', ({ contact, channel }) => dispatch('contact.replied', { contact: contactPayload(contact), channel }));
  bus.on('contact.handoff', ({ contact, summary }) => dispatch('contact.handoff', { contact: contactPayload(contact), summary }));
  bus.on('tag.added', ({ contact, tags }) => dispatch('tag.added', { contact: contactPayload(contact), tags }));
  bus.on('workflow.completed', ({ contact, workflow }) => dispatch('workflow.completed', { contact: contactPayload(contact), workflow: { id: workflow.id, name: workflow.name } }));
  bus.on('content.published', ({ item }) => dispatch('content.published', { content: item }));
}

export function webhookStats() {
  return db.prepare(`SELECT webhook_id, SUM(status = 'delivered') delivered, SUM(status = 'failed') failed, SUM(status IN ('pending','sending')) pending, MAX(created_at) last FROM webhook_deliveries GROUP BY webhook_id`).all();
}

