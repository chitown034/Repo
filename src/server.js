import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, getSettings, json } from './db.js';
import { authenticate } from './auth.js';
import { api } from './api.js';
import { upsertContact, logActivity, getContact } from './contacts.js';
import { handleInbound } from './assistant.js';
import { signId, verifyTwilioSignature } from './messaging.js';
import { registerAutomation, startScheduler } from './automation.js';
import { rescoreContact } from './scoring.js';
import { emit } from './events.js';
import { voicemailTwiml, voicemailStatus } from './voicemail.js';
import { googleCallback, receiveLead, inboundKey } from './integrations.js';
import { escapeHtml, normalizePhone, normalizeEmail } from './util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});
app.use(authenticate);

app.use('/api', api);

/* --------------------------- Public landing pages --------------------------- */

const FIELD_LABELS = {
  first_name: ['First name', 'text', true],
  last_name: ['Last name', 'text', false],
  email: ['Email', 'email', true],
  phone: ['Mobile phone', 'tel', true],
  zip: ['ZIP code', 'text', false],
  property_value: ['Estimated home value', 'text', false],
  loan_amount: ['Current loan balance', 'text', false],
  current_rate: ['Current interest rate (%)', 'text', false],
  purchase_timeline: ['When are you planning to buy?', 'select:ASAP|1-3 months|3-6 months|6-12 months|Just exploring', false],
  credit_band: ['Estimated credit', 'select:Excellent (740+)|Good (700-739)|Fair (640-699)|Building (<640)', false],
  loan_type: ['Loan type', 'select:Conventional|FHA|VA|USDA|Jumbo|Not sure', false],
  is_veteran: ['I am a veteran or active-duty service member', 'checkbox', false],
  first_time_buyer: ["I'm a first-time home buyer", 'checkbox', false],
  message: ['Anything we should know?', 'textarea', false],
};

function landingHtml(page, settings, { submitted = false, error = null } = {}) {
  const color = /^#[0-9a-f]{3,8}$/i.test(settings.brand_color) ? settings.brand_color : '#0e7490';
  const fields = json(page.fields, []).filter((f) => FIELD_LABELS[f]);
  const input = (f) => {
    const [label, type, required] = FIELD_LABELS[f];
    const req = required ? ' required' : '';
    if (type === 'checkbox') return `<label class="check"><input type="checkbox" name="${f}" value="1"> ${escapeHtml(label)}</label>`;
    if (type === 'textarea') return `<label>${escapeHtml(label)}<textarea name="${f}" rows="3"></textarea></label>`;
    if (type.startsWith('select:'))
      return `<label>${escapeHtml(label)}<select name="${f}"${req}><option value="">Select…</option>${type.slice(7).split('|').map((o) => `<option>${escapeHtml(o)}</option>`).join('')}</select></label>`;
    return `<label>${escapeHtml(label)}${required ? ' *' : ''}<input type="${type}" name="${f}"${req} autocomplete="${f === 'first_name' ? 'given-name' : f === 'last_name' ? 'family-name' : f === 'phone' ? 'tel' : f === 'email' ? 'email' : 'off'}"></label>`;
  };
  const nmls = [settings.loan_officer_nmls && `NMLS #${settings.loan_officer_nmls}`, settings.company_nmls && `Company NMLS #${settings.company_nmls}`].filter(Boolean).join(' · ');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(page.title)} | ${escapeHtml(settings.company_name)}</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#1f2937;background:#f3f4f6;line-height:1.5}
header{background:${color};color:#fff;padding:18px 20px;font-weight:700;letter-spacing:.02em}
.wrap{max-width:980px;margin:0 auto;padding:32px 16px;display:grid;grid-template-columns:1.1fr 1fr;gap:32px;align-items:start}
@media(max-width:780px){.wrap{grid-template-columns:1fr}}
h1{font-size:clamp(28px,4vw,40px);line-height:1.15;margin:0 0 12px}.sub{font-size:18px;color:#4b5563;margin:0 0 16px}.body{color:#374151;white-space:pre-line}
form{background:#fff;border-radius:14px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.08)}
label{display:block;font-size:14px;font-weight:600;margin-bottom:14px}input,select,textarea{display:block;width:100%;margin-top:6px;padding:11px 12px;border:1px solid #d1d5db;border-radius:8px;font:inherit}
label.check{display:flex;gap:8px;align-items:center;font-weight:500}label.check input{width:auto;margin:0}
button{width:100%;padding:14px;border:0;border-radius:10px;background:${color};color:#fff;font-size:16px;font-weight:700;cursor:pointer}
.consent{font-size:11.5px;color:#6b7280;margin-top:12px}.hp{position:absolute;left:-9999px}.ok{background:#ecfdf5;border:1px solid #a7f3d0;padding:20px;border-radius:12px}.err{color:#b91c1c;margin-bottom:10px}
footer{text-align:center;font-size:12px;color:#6b7280;padding:24px 16px}
</style></head><body>
<header>${escapeHtml(settings.company_name)}</header>
<div class="wrap"><div><h1>${escapeHtml(page.headline || page.title)}</h1>${page.subheadline ? `<p class="sub">${escapeHtml(page.subheadline)}</p>` : ''}${page.body ? `<div class="body">${escapeHtml(page.body)}</div>` : ''}</div>
${submitted
    ? `<div class="ok"><h2 style="margin-top:0">Thank you!</h2><p>${escapeHtml(page.thank_you || `We received your info and ${settings.loan_officer_name || 'our team'} will reach out shortly.`)}</p></div>`
    : `<form method="post">${error ? `<div class="err">${escapeHtml(error)}</div>` : ''}${fields.map(input).join('')}
<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<button type="submit">${escapeHtml(page.cta || 'Get Started')}</button>
<p class="consent">By submitting, you agree that ${escapeHtml(settings.company_name)} may contact you by call, text, or email at the number and address provided, including with automated technology. Consent is not a condition of any purchase. Msg &amp; data rates may apply. Reply STOP to opt out.</p></form>`}
</div><footer>${escapeHtml(settings.company_name)}${nmls ? ` · ${escapeHtml(nmls)}` : ''} · Equal Housing Opportunity</footer></body></html>`;
}

app.get('/p/:slug', (req, res) => {
  const page = db.prepare('SELECT * FROM landing_pages WHERE slug = ? AND active = 1').get(req.params.slug);
  if (!page) return res.status(404).send('Page not found');
  db.prepare('UPDATE landing_pages SET views = views + 1 WHERE id = ?').run(page.id);
  res.send(landingHtml(page, getSettings(), { submitted: req.query.thanks === '1' }));
});

const submitLog = new Map();
app.post('/p/:slug', (req, res) => {
  const page = db.prepare('SELECT * FROM landing_pages WHERE slug = ? AND active = 1').get(req.params.slug);
  if (!page) return res.status(404).send('Page not found');
  const settings = getSettings();
  if (req.body.website) return res.redirect(303, `/p/${page.slug}?thanks=1`); // honeypot: silently drop bots
  const recent = (submitLog.get(req.ip) || []).filter((t) => Date.now() - t < 10 * 60_000);
  if (recent.length >= 5) return res.status(429).send(landingHtml(page, settings, { error: 'Too many submissions. Please try again later.' }));
  submitLog.set(req.ip, [...recent, Date.now()]);

  const allowed = json(page.fields, []);
  const raw = {};
  for (const f of allowed) if (req.body[f] !== undefined && f !== 'message') raw[f] = String(req.body[f]).slice(0, 500);
  if (!normalizeEmail(raw.email) && !normalizePhone(raw.phone)) {
    return res.status(400).send(landingHtml(page, settings, { error: 'Please enter a valid email or phone number.' }));
  }
  raw.lead_type = page.lead_type || 'purchase';
  raw.tags = [page.tags, `lp:${page.slug}`].filter(Boolean).join(',');
  const { contact, created } = upsertContact(raw, { source: `landing:${page.slug}`, emitEvents: true });
  // A returning contact who re-submits gets their consent refreshed.
  db.prepare('UPDATE contacts SET landing_page_id = COALESCE(landing_page_id, ?), opted_out_sms = 0, opted_out_email = 0 WHERE id = ?').run(page.id, contact.id);
  logActivity(contact.id, {
    type: 'form',
    direction: 'in',
    subject: `Submitted "${page.title}"`,
    body: req.body.message ? String(req.body.message).slice(0, 2000) : null,
    meta: { landing_page_id: page.id, created, consent: true, ip: req.ip, ua: req.headers['user-agent'] },
  });
  db.prepare('UPDATE landing_pages SET submissions = submissions + 1 WHERE id = ?').run(page.id);
  rescoreContact(contact.id);
  emit('form.submitted', { contact: getContact(contact.id), landingPageId: page.id });
  res.redirect(303, `/p/${page.slug}?thanks=1`);
});

/* ------------------------- Tracking & unsubscribe -------------------------- */

const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
app.get('/t/o/:token.gif', (req, res) => {
  db.prepare(`UPDATE campaign_sends SET opened_at = COALESCE(opened_at, datetime('now')) WHERE token = ?`).run(req.params.token);
  res.setHeader('Cache-Control', 'no-store');
  res.type('gif').send(PIXEL);
});

app.get('/t/c/:token', (req, res) => {
  const send = db.prepare('SELECT s.*, c.email_body, c.sms_body FROM campaign_sends s JOIN campaigns c ON c.id = s.campaign_id WHERE s.token = ?').get(req.params.token);
  const url = String(req.query.u || '');
  // Only redirect to links that are actually in the campaign (no open redirect).
  if (!send || !/^https?:\/\//i.test(url) || !(`${send.email_body} ${send.sms_body}`.includes(url))) return res.status(404).send('Link not found');
  db.prepare(`UPDATE campaign_sends SET clicked_at = COALESCE(clicked_at, datetime('now')), opened_at = COALESCE(opened_at, datetime('now')) WHERE id = ?`).run(send.id);
  rescoreContact(send.contact_id);
  res.redirect(302, url);
});

app.get('/u/:id/:sig', (req, res) => {
  const id = Number(req.params.id);
  const settings = getSettings();
  if (signId('unsub', id) !== req.params.sig) return res.status(400).send('Invalid link');
  const c = getContact(id);
  if (c && !c.opted_out_email) {
    db.prepare('UPDATE contacts SET opted_out_email = 1 WHERE id = ?').run(id);
    logActivity(id, { type: 'system', body: 'Unsubscribed from email via link' });
    db.prepare(`UPDATE outbox SET status = 'blocked', error = 'unsubscribed' WHERE contact_id = ? AND channel = 'email' AND status = 'queued'`).run(id);
  }
  res.send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;max-width:520px;margin:60px auto;padding:0 16px"><h2>You're unsubscribed</h2><p>You won't receive marketing emails from ${escapeHtml(settings.company_name)} anymore.</p></body>`);
});

/* ------------------------------ Twilio webhooks ------------------------------ */

app.post('/webhooks/twilio/sms', async (req, res) => {
  if (!verifyTwilioSignature(req)) return res.status(403).send('Bad signature');
  res.type('text/xml').send('<Response></Response>');
  try {
    const from = normalizePhone(req.body.From);
    const body = String(req.body.Body || '').trim();
    if (!from || !body) return;
    let contact = db.prepare('SELECT * FROM contacts WHERE phone_norm = ?').get(from);
    if (!contact) contact = upsertContact({ phone: from, lead_type: 'purchase' }, { source: 'inbound sms' }).contact;
    await handleInbound(contact.id, { channel: 'sms', body, meta: { sid: req.body.MessageSid } });
  } catch (err) {
    console.error('[twilio] inbound failed', err);
  }
});

app.post('/webhooks/twilio/status', (req, res) => {
  if (!verifyTwilioSignature(req)) return res.status(403).send('Bad signature');
  if (['failed', 'undelivered'].includes(req.body.MessageStatus)) {
    const act = db.prepare(`SELECT id, contact_id FROM activities WHERE json_extract(meta,'$.providerId') = ?`).get(req.body.MessageSid);
    if (act) logActivity(act.contact_id, { type: 'system', body: `Text was not delivered (${req.body.ErrorCode || req.body.MessageStatus})` });
  }
  res.sendStatus(204);
});

app.post('/webhooks/twilio/vm/:id/:sig', (req, res) => {
  const id = Number(req.params.id);
  if (signId('vm', id) !== req.params.sig || !verifyTwilioSignature(req)) return res.status(403).send('Bad signature');
  res.type('text/xml').send(voicemailTwiml(id, req.body.AnsweredBy));
});

app.post('/webhooks/twilio/vm-status/:id/:sig', (req, res) => {
  const id = Number(req.params.id);
  if (signId('vm', id) !== req.params.sig || !verifyTwilioSignature(req)) return res.status(403).send('Bad signature');
  voicemailStatus(id, req.body);
  res.sendStatus(204);
});

/* ---------------------------- Integrations ---------------------------- */

app.get('/integrations/google/callback', async (req, res) => {
  try {
    if (req.query.error) throw new Error(String(req.query.error));
    await googleCallback(String(req.query.code || ''), String(req.query.state || ''));
    res.redirect(302, '/#/settings?google=connected');
  } catch (err) {
    res.redirect(302, `/#/settings?google_error=${encodeURIComponent(err.message)}`);
  }
});

/** Inbound lead webhook for Zapier, Make, websites, and other CRMs. Auth: X-API-Key header or ?key= */
const hookLog = new Map();
app.post('/hooks/lead', (req, res) => {
  const key = req.headers['x-api-key'] || req.query.key;
  const expected = inboundKey();
  if (!key || String(key).length !== expected.length || !crypto.timingSafeEqual(Buffer.from(String(key)), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  const recent = (hookLog.get(req.ip) || []).filter((t) => Date.now() - t < 60_000);
  if (recent.length >= 120) return res.status(429).json({ error: 'Slow down' });
  hookLog.set(req.ip, [...recent, Date.now()]);
  try {
    res.status(201).json(receiveLead(req.body || {}, req.query.source ? String(req.query.source) : null));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* --------------------------------- SPA ---------------------------------- */

app.use(express.static(path.join(here, '..', 'public'), { index: 'index.html' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : 'Something went wrong' });
});

registerAutomation();

const PORT = Number(process.env.PORT) || 3000;
if (process.env.NODE_ENV !== 'test') {
  startScheduler();
  app.listen(PORT, () => console.log(`Mortgage CRM running at http://localhost:${PORT}`));
}

export default app;
