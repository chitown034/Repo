import { db, getSetting, setSetting, json } from './db.js';
import { upsertContact, getContact, logActivity, cleanContact } from './contacts.js';
import { autoMap } from './csv.js';
import { signId, APP_URL } from './messaging.js';
import { emit } from './events.js';
import { token } from './util.js';

/* ------------------------------- Shared bits ------------------------------- */

function startRun(source) {
  return Number(db.prepare('INSERT INTO sync_runs (source) VALUES (?)').run(source).lastInsertRowid);
}
function finishRun(id, summary, error = null) {
  db.prepare(`UPDATE sync_runs SET status = ?, created = ?, merged = ?, skipped = ?, error = ?, finished_at = datetime('now') WHERE id = ?`).run(
    error ? 'failed' : 'ok', summary.created, summary.merged, summary.skipped, error, id,
  );
}

export function lastRuns() {
  return db.prepare(`SELECT * FROM sync_runs WHERE id IN (SELECT MAX(id) FROM sync_runs GROUP BY source)`).all();
}

/**
 * Upsert a record from an outside system. Matches by the system's own id first,
 * then by email/phone, so re-syncing never creates duplicates.
 */
function upsertExternal(source, externalId, raw, { ownerId = null, summary }) {
  const linked = db.prepare('SELECT * FROM contacts WHERE external_source = ? AND external_id = ?').get(source, String(externalId));
  try {
    if (linked) {
      const data = cleanContact(raw);
      const fills = Object.entries(data).filter(([k, v]) => v != null && v !== '' && (linked[k] == null || linked[k] === '') && k !== 'stage');
      if (fills.length) db.prepare(`UPDATE contacts SET ${fills.map(([k]) => `${k} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...fills.map(([, v]) => v), linked.id);
      summary.merged++;
      return linked.id;
    }
    const r = upsertContact({ ...raw, ...(ownerId ? { owner_id: ownerId } : {}) }, { source: raw.source, emitEvents: false });
    const c = r.contact;
    if (!c.external_source) db.prepare('UPDATE contacts SET external_source = ?, external_id = ? WHERE id = ?').run(source, String(externalId), c.id);
    r.created ? summary.created++ : summary.merged++;
    return c.id;
  } catch (err) {
    summary.skipped++;
    if (summary.errors.length < 10) summary.errors.push(err.message);
    return null;
  }
}

/* ----------------------------- Google Contacts ------------------------------ */

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/userinfo.email';

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function googleRedirect() {
  return `${APP_URL}/integrations/google/callback`;
}

export function googleAuthUrl(userId) {
  if (!googleConfigured()) throw new Error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the server first');
  const nonce = token(9);
  const state = `${userId}.${nonce}.${signId('google', `${userId}.${nonce}`)}`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirect(),
    response_type: 'code',
    scope: GOOGLE_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function googleToken(params) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, ...params }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Google token error: ${body.error_description || body.error || res.status}`);
  return body;
}

/** OAuth callback: verify state, exchange the code, remember who connected. */
export async function googleCallback(code, state) {
  const [userId, nonce, sig] = String(state || '').split('.');
  if (!userId || signId('google', `${userId}.${nonce}`) !== sig) throw new Error('Invalid sign-in state - please try connecting again');
  const t = await googleToken({ code, redirect_uri: googleRedirect(), grant_type: 'authorization_code' });
  let email = null;
  try {
    const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${t.access_token}` } }).then((r) => r.json());
    email = info.email || null;
  } catch {}
  const prev = json(getSetting('google_tokens'), {});
  setSetting('google_tokens', JSON.stringify({
    access_token: t.access_token,
    refresh_token: t.refresh_token || prev.refresh_token,
    expires_at: Date.now() + (t.expires_in || 3600) * 1000 - 60_000,
  }));
  setSetting('google_user_id', userId);
  setSetting('google_account', email || '');
  setSetting('google_sync_token', '');
  return { email };
}

async function googleAccessToken() {
  const t = json(getSetting('google_tokens'), null);
  if (!t?.refresh_token && !t?.access_token) throw new Error('Google Contacts is not connected');
  if (t.access_token && t.expires_at > Date.now()) return t.access_token;
  if (!t.refresh_token) throw new Error('Google sign-in expired - reconnect Google Contacts');
  const r = await googleToken({ refresh_token: t.refresh_token, grant_type: 'refresh_token' });
  setSetting('google_tokens', JSON.stringify({ ...t, access_token: r.access_token, expires_at: Date.now() + (r.expires_in || 3600) * 1000 - 60_000 }));
  return r.access_token;
}

export function googleDisconnect() {
  for (const k of ['google_tokens', 'google_sync_token', 'google_account', 'google_user_id']) setSetting(k, '');
}

export function googleStatus() {
  const t = json(getSetting('google_tokens'), null);
  return { configured: googleConfigured(), connected: Boolean(t?.refresh_token || t?.access_token), account: getSetting('google_account') || null };
}

function mapGooglePerson(p) {
  const n = p.names?.[0] || {};
  const a = p.addresses?.[0] || {};
  const primary = (list) => (list || []).find((x) => x.metadata?.primary)?.value || list?.[0]?.value || null;
  const mobile = (p.phoneNumbers || []).find((x) => /mobile|cell/i.test(x.type || ''))?.value;
  return {
    first_name: n.givenName || (!n.familyName ? n.displayName : null) || null,
    last_name: n.familyName || null,
    email: primary(p.emailAddresses),
    phone: mobile || primary(p.phoneNumbers),
    address: a.streetAddress || null,
    city: a.city || null,
    state: a.region || null,
    zip: a.postalCode || null,
    lead_type: 'sphere',
    source: 'Google Contacts',
    tags: 'google',
  };
}

/** Pull contacts from Google. Incremental after the first run (sync tokens). */
export async function syncGoogle() {
  const runId = startRun('google');
  const summary = { created: 0, merged: 0, skipped: 0, errors: [] };
  try {
    const accessToken = await googleAccessToken();
    const ownerId = Number(getSetting('google_user_id')) || null;
    let syncToken = getSetting('google_sync_token') || '';
    let pageToken = '';
    let nextSync = null;
    let pages = 0;
    do {
      const params = new URLSearchParams({ personFields: 'names,emailAddresses,phoneNumbers,addresses,metadata', pageSize: '1000', requestSyncToken: 'true' });
      if (pageToken) params.set('pageToken', pageToken);
      if (syncToken) params.set('syncToken', syncToken);
      const res = await fetch(`https://people.googleapis.com/v1/people/me/connections?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (res.status === 410 || (res.status === 400 && syncToken)) {
        // Sync token expired: start over with a full sync.
        syncToken = '';
        pageToken = '';
        setSetting('google_sync_token', '');
        continue;
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error?.message || `Google People API ${res.status}`);
      db.exec('BEGIN');
      try {
        for (const p of body.connections || []) {
          if (p.metadata?.deleted) continue; // we never delete CRM records because Google did
          const raw = mapGooglePerson(p);
          const known = db.prepare(`SELECT 1 FROM contacts WHERE external_source = 'google' AND external_id = ?`).get(p.resourceName);
          if (!raw.email && !raw.phone && !known) { summary.skipped++; continue; }
          upsertExternal('google', p.resourceName, raw, { ownerId, summary });
        }
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
      pageToken = body.nextPageToken || '';
      nextSync = body.nextSyncToken || nextSync;
      pages++;
    } while (pageToken && pages < 50);
    if (nextSync) setSetting('google_sync_token', nextSync);
    setSetting('google_last_sync', new Date().toISOString());
    finishRun(runId, summary);
    return summary;
  } catch (err) {
    finishRun(runId, summary, err.message);
    throw err;
  }
}

/* ------------------------------ Follow Up Boss ------------------------------ */

const FUB_STAGES = { lead: 'new', prospect: 'contacted', 'hot prospect': 'prequalified', nurture: 'nurture', 'active client': 'application', pending: 'processing', closed: 'funded', 'past client': 'funded', sphere: 'nurture', trash: 'lost', unresponsive: 'nurture' };

export function fubStatus() {
  return { connected: Boolean(getSetting('fub_api_key')), last_sync: getSetting('fub_last_sync') || null };
}

function mapFub(p) {
  const a = p.addresses?.[0] || {};
  const stage = FUB_STAGES[String(p.stage || '').toLowerCase()];
  return {
    first_name: p.firstName || null,
    last_name: p.lastName || null,
    email: p.emails?.find((e) => e.isPrimary)?.value || p.emails?.[0]?.value || null,
    phone: p.phones?.find((e) => /mobile|cell/i.test(e.type || ''))?.value || p.phones?.[0]?.value || null,
    address: a.street || null,
    city: a.city || null,
    state: a.state || null,
    zip: a.code || null,
    source: p.source ? `FUB: ${p.source}` : 'Follow Up Boss',
    stage: stage || 'new',
    lead_type: stage === 'funded' ? 'past_client' : 'purchase',
    property_value: p.price || null,
    tags: ['fub', ...(p.tags || [])].join(','),
  };
}

export async function syncFollowUpBoss(apiKey = getSetting('fub_api_key')) {
  if (!apiKey) throw new Error('Add your Follow Up Boss API key first');
  const runId = startRun('followupboss');
  const summary = { created: 0, merged: 0, skipped: 0, errors: [] };
  const auth = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
  try {
    let url = 'https://api.followupboss.com/v1/people?limit=100&sort=created&fields=allFields';
    let pages = 0;
    while (url && pages < 100) {
      const res = await fetch(url, { headers: { Authorization: auth, Accept: 'application/json', 'X-System': 'MortgageLeadCRM' } });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Follow Up Boss rejected the API key');
      if (!res.ok) throw new Error(body.errorMessage || `Follow Up Boss ${res.status}`);
      db.exec('BEGIN');
      try {
        for (const p of body.people || []) upsertExternal('followupboss', p.id, mapFub(p), { summary });
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
      url = body._metadata?.nextLink || null;
      pages++;
    }
    setSetting('fub_last_sync', new Date().toISOString());
    finishRun(runId, summary);
    return summary;
  } catch (err) {
    finishRun(runId, summary, err.message);
    throw err;
  }
}

/* --------------------------- Inbound lead webhook --------------------------- */

export function inboundKey({ rotate = false } = {}) {
  let k = getSetting('inbound_api_key');
  if (!k || rotate) {
    k = `lk_${token(24)}`;
    setSetting('inbound_api_key', k);
  }
  return k;
}

/**
 * Accept a lead from anywhere: Zapier, Make, Zillow/Realtor.com lead emails parsed by Zapier,
 * your website, or another CRM's webhook. Field names are mapped the same way CSV headers are.
 */
export function receiveLead(body, sourceHint) {
  const flat = {};
  const walk = (obj, prefix = '') => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, `${prefix}${k} `);
      else {
        const val = Array.isArray(v) ? v.join(',') : v;
        flat[`${prefix}${k}`.trim()] = val;
        if (prefix) leaves.push([k, val]); // nested payloads ({ lead: { email } }) also match on leaf names
      }
    }
  };
  const leaves = [];
  walk(body);
  for (const [k, v] of leaves) if (flat[k] === undefined) flat[k] = v;
  const mapping = autoMap(Object.keys(flat));
  const raw = {};
  for (const [col, field] of Object.entries(mapping)) if (flat[col] !== undefined && flat[col] !== '') raw[field] = String(flat[col]).slice(0, 500);
  for (const k of ['lead_type', 'source', 'tags', 'stage']) if (body[k] && !raw[k]) raw[k] = String(body[k]);
  const source = raw.source || sourceHint || 'Inbound webhook';
  const { contact, created } = upsertContact(raw, { source, emitEvents: true });
  const message = flat.message || flat.comments || flat.notes || flat.note || null;
  logActivity(contact.id, { type: 'form', direction: 'in', subject: `Lead received from ${source}`, body: message ? String(message).slice(0, 2000) : null, meta: { created, webhook: true } });
  emit('form.submitted', { contact: getContact(contact.id), landingPageId: null });
  return { id: contact.id, created };
}

