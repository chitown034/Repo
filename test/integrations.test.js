import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.ATTOM_API_KEY = 'test-attom';
process.env.GOOGLE_CLIENT_ID = 'gid';
process.env.GOOGLE_CLIENT_SECRET = 'gsecret';
delete process.env.ANTHROPIC_API_KEY;
delete process.env.TWILIO_ACCOUNT_SID;
delete process.env.SMTP_HOST;

/* Outside services are mocked; requests to the local test server pass through. */
const realFetch = globalThis.fetch;
const outbound = [];
const routes = [];
const mock = (match, handler) => routes.push([match, handler]);
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('http://127.0.0.1')) return realFetch(url, opts);
  outbound.push({ url: u, opts });
  for (const [match, handler] of routes) if (u.includes(match)) return handler(u, opts);
  throw new Error(`unmocked request: ${u}`);
};

const { default: app } = await import('../src/server.js');
const { db } = await import('../src/db.js');
const { voicemailTwiml, voicemailStatus } = await import('../src/voicemail.js');

let server;
let base;
let cookie = '';
async function call(method, path, body, headers = {}) {
  const res = await realFetch(base + path, {
    method,
    headers: { ...(cookie ? { cookie } : {}), ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const sc = res.headers.get('set-cookie');
  if (sc) cookie = sc.split(';')[0];
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
  return { status: res.status, data, headers: res.headers };
}
const tick = (ms = 50) => new Promise((r) => setTimeout(r, ms));

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
  await call('POST', '/api/setup', { name: 'Olivia Owner', email: 'owner@test.com', password: 'password123' });
  db.prepare(`UPDATE settings SET value = '00:00' WHERE key IN ('quiet_start','quiet_end')`).run();
});
after(() => server.close());

test('secrets never reach the browser', async () => {
  db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('fub_api_key','secret-fub'), ('google_tokens','{"refresh_token":"rt"}')`).run();
  const meta = await call('GET', '/api/meta');
  const blob = JSON.stringify(meta.data);
  assert.ok(!blob.includes('secret-fub') && !blob.includes('"rt"') && !blob.includes('app_secret'));
  const settings = await call('GET', '/api/settings');
  assert.ok(!JSON.stringify(settings.data).includes('secret-fub'));
  db.prepare(`UPDATE settings SET value = '' WHERE key IN ('fub_api_key','google_tokens')`).run();
});

test('property enrichment: Census standardizes the address, ATTOM adds value and recorded loan, score uses AVM', async () => {
  mock('geocoding.geo.census.gov', () => reply({ result: { addressMatches: [{
    matchedAddress: '41000 MAIN ST, TEMECULA, CA, 92590',
    coordinates: { x: -117.15, y: 33.49 },
    addressComponents: { city: 'TEMECULA', state: 'CA', zip: '92590' },
    geographies: { Counties: [{ NAME: 'Riverside County' }] },
  }] } }));
  mock('attomavm/detail', (u, o) => {
    assert.equal(o.headers.apikey, 'test-attom');
    return reply({ property: [{ avm: { amount: { value: 900000, low: 850000, high: 950000 }, eventDate: '2026-09-01' }, summary: { yearbuilt: 2004 }, building: { size: { livingsize: 2100 }, rooms: { beds: 4, bathstotal: 3 } }, sale: { saleTransDate: '2019-06-15', amount: { saleamt: 610000 } } }] });
  });
  mock('property/detailmortgage', () => reply({ property: [{ mortgage: { FirstConcurrent: { amount: 488000, date: '2021-03-02', lenderLastName: 'ACME BANK' } } }] }));

  await call('PATCH', '/api/settings', { market_rate_30yr: '6.0' });
  const c = (await call('POST', '/api/contacts', { first_name: 'Ed', phone: '9515550900', address: '41000 main street', city: 'temecula', state: 'ca', lead_type: 'past_client', current_rate: '7.25', property_value: '600000' })).data.contact;
  const r = await call('POST', `/api/contacts/${c.id}/enrich`);
  assert.equal(r.status, 200);
  const e = r.data.contact;
  assert.equal(e.address, '41000 Main St');
  assert.equal(e.zip, '92590');
  assert.equal(e.county, 'Riverside County');
  assert.equal(e.address_verified, 1);
  assert.equal(e.avm_value, 900000);
  assert.equal(e.property_value, 600000, 'entered value is never overwritten');
  assert.equal(e.loan_amount, 488000, 'blank loan amount filled from recorded mortgage');
  assert.equal(e.loan_close_date, '2021-03-02');
  assert.equal(e.lender_name, 'ACME BANK');
  assert.equal(e.year_built, 2004);
  assert.ok(e.score_reasons.some((x) => /equity/.test(x.why) && /\$412k/.test(x.why)), 'equity computed from AVM (900k - 488k)');

  // Changing the address queues it for re-enrichment.
  await call('PATCH', `/api/contacts/${c.id}`, { address: '1 Other Rd' });
  assert.equal(db.prepare('SELECT enriched_at FROM contacts WHERE id = ?').get(c.id).enriched_at, null);
});

test('enrichment handles "no match" without breaking', async () => {
  routes.unshift(['NOWHERE', () => reply({ result: { addressMatches: [] } })]);
  routes.unshift(['NOWHERE', () => reply({ status: { msg: 'SuccessWithoutResult' } }, 400)]);
  const c = (await call('POST', '/api/contacts', { first_name: 'Nope', phone: '9515550901', address: 'NOWHERE', zip: '00000' })).data.contact;
  const r = await call('POST', `/api/contacts/${c.id}/enrich`);
  assert.equal(r.status, 200);
  assert.ok(r.data.error);
  routes.splice(0, 2);
});

test('voicemail drops: library, simulated drop, blocks opted-out contacts, TwiML + status logging', async () => {
  const bad = await call('POST', '/api/voicemail-drops', { name: 'x', audio_url: 'http://insecure.mp3' });
  assert.equal(bad.status, 400);
  const d = await call('POST', '/api/voicemail-drops', { name: 'Rate review', script: 'Hi {{first_name}}, it is {{company}} calling.' });
  assert.equal(d.status, 201);
  const c = (await call('POST', '/api/contacts', { first_name: 'Vera', phone: '9515550910' })).data.contact;
  const r = await call('POST', `/api/contacts/${c.id}/voicemail`, { drop_id: d.data.id });
  assert.equal(r.data.simulated, true);
  const act = db.prepare(`SELECT * FROM activities WHERE contact_id = ? AND type = 'voicemail'`).get(c.id);
  assert.match(act.body, /Hi Vera/);
  assert.ok(db.prepare('SELECT last_contacted_at FROM contacts WHERE id = ?').get(c.id).last_contacted_at);

  db.prepare('UPDATE contacts SET opted_out_sms = 1 WHERE id = ?').run(c.id);
  const blocked = await call('POST', `/api/contacts/${c.id}/voicemail`, { drop_id: d.data.id });
  assert.equal(blocked.status, 400);
  const bulk = await call('POST', '/api/voicemail/bulk', { ids: [c.id], drop_id: d.data.id });
  assert.equal(bulk.data.queued, 0);
  assert.equal(bulk.data.skipped.length, 1);

  // Twilio side: voicemail answers -> script is read; a person answers -> connect to LO.
  db.prepare('UPDATE contacts SET opted_out_sms = 0 WHERE id = ?').run(c.id);
  db.prepare(`UPDATE users SET phone = '+19515559999'`).run();
  const callId = Number(db.prepare('INSERT INTO voicemail_calls (contact_id, drop_id, user_id) VALUES (?, ?, 1)').run(c.id, d.data.id).lastInsertRowid);
  assert.match(voicemailTwiml(callId, 'machine_end_beep'), /<Say[^>]*>Hi Vera, it is My Mortgage Co\. calling\.<\/Say><Hangup\/>/);
  assert.match(voicemailTwiml(callId, 'human'), /<Dial[^>]*>\+19515559999<\/Dial>/);
  voicemailStatus(callId, { CallStatus: 'completed', AnsweredBy: 'machine_end_beep' });
  assert.ok(db.prepare(`SELECT id FROM activities WHERE contact_id = ? AND body LIKE 'Voicemail left%'`).get(c.id));

  const { signId } = await import('../src/messaging.js');
  const forged = await call('POST', `/webhooks/twilio/vm/${callId}/bad`, {});
  assert.equal(forged.status, 403);
  assert.ok(signId('vm', callId));
});

test('inbound lead webhook: requires the key, maps fields, triggers speed-to-lead', async () => {
  const i = await call('GET', '/api/integrations');
  const key = i.data.inbound.key;
  assert.match(key, /^lk_/);
  const denied = await call('POST', '/hooks/lead', { email: 'x@example.com' }, { 'x-api-key': 'wrong' });
  assert.equal(denied.status, 401);
  const ok = await call('POST', '/hooks/lead?source=Zillow', { 'First Name': 'Zed', lead: { email: 'zed@example.com', phone: '951 555 0920' }, timeline: '1-3 months', message: 'Looking in Murrieta' }, { 'x-api-key': key });
  assert.equal(ok.status, 201);
  await tick();
  const c = db.prepare('SELECT * FROM contacts WHERE id = ?').get(ok.data.id);
  assert.equal(c.first_name, 'Zed');
  assert.equal(c.email_norm, 'zed@example.com');
  assert.equal(c.purchase_timeline, '1-3 months');
  assert.equal(c.source, 'Zillow');
  assert.ok(db.prepare(`SELECT id FROM activities WHERE contact_id = ? AND type = 'form' AND body = 'Looking in Murrieta'`).get(c.id));
  assert.ok(db.prepare('SELECT id FROM ai_drafts WHERE contact_id = ?').get(c.id), 'speed-to-lead draft');
  const again = await call('POST', '/hooks/lead', { email: 'ZED@example.com' }, { 'x-api-key': key });
  assert.equal(again.data.created, false, 'deduped');
  const rot = await call('POST', '/api/integrations/inbound/rotate');
  assert.notEqual(rot.data.key, key);
});

test('Google Contacts: OAuth state is signed, sync imports and dedupes, sync token reused', async () => {
  const u = await call('POST', '/api/integrations/google/connect');
  const url = new URL(u.data.url);
  assert.equal(url.hostname, 'accounts.google.com');
  assert.equal(url.searchParams.get('access_type'), 'offline');
  const state = url.searchParams.get('state');

  const forged = await call('GET', '/integrations/google/callback?code=abc&state=1.x.y');
  assert.match(forged.headers.get('location'), /google_error/);

  mock('oauth2.googleapis.com/token', (_u, o) => {
    const p = new URLSearchParams(o.body);
    assert.equal(p.get('client_secret'), 'gsecret');
    return reply({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 });
  });
  mock('openidconnect.googleapis.com', () => reply({ email: 'lo@gmail.com' }));
  mock('www.googleapis.com/oauth2/v3/userinfo', () => reply({ email: 'lo@gmail.com' }));
  let calls = 0;
  mock('people.googleapis.com', (u2, o) => {
    assert.equal(o.headers.Authorization, 'Bearer at');
    calls++;
    if (calls === 1) {
      return reply({ connections: [
        { resourceName: 'people/1', names: [{ givenName: 'Gina', familyName: 'Gomez' }], emailAddresses: [{ value: 'gina@example.com' }], phoneNumbers: [{ value: '(951) 555-0930', type: 'mobile' }] },
        { resourceName: 'people/2', names: [{ givenName: 'Ed' }], phoneNumbers: [{ value: '9515550900' }] },
        { resourceName: 'people/3', names: [{ givenName: 'No Contact Info' }] },
      ], nextSyncToken: 'sync-1' });
    }
    assert.match(u2, /syncToken=sync-1/);
    return reply({ connections: [{ resourceName: 'people/1', names: [{ givenName: 'Gina' }], addresses: [{ city: 'Temecula' }] }], nextSyncToken: 'sync-2' });
  });

  const cb = await call('GET', `/integrations/google/callback?code=abc&state=${encodeURIComponent(state)}`);
  assert.equal(cb.headers.get('location'), '/#/settings?google=connected');
  const s1 = await call('POST', '/api/integrations/google/sync');
  assert.equal(s1.data.created, 1);
  assert.equal(s1.data.merged, 1, 'Ed already existed (matched by phone)');
  assert.equal(s1.data.skipped, 1);
  const gina = db.prepare(`SELECT * FROM contacts WHERE email_norm = 'gina@example.com'`).get();
  assert.equal(gina.external_source, 'google');
  assert.equal(gina.lead_type, 'sphere');
  const s2 = await call('POST', '/api/integrations/google/sync');
  assert.equal(s2.data.merged, 1);
  assert.equal(db.prepare('SELECT city FROM contacts WHERE id = ?').get(gina.id).city, 'Temecula');
  const st = (await call('GET', '/api/integrations')).data.google;
  assert.equal(st.connected, true);
  assert.equal(st.account, 'lo@gmail.com');
});

test('Follow Up Boss: bad key is rejected; import maps stages and paginates', async () => {
  mock('api.followupboss.com', (u, o) => {
    const key = Buffer.from(o.headers.Authorization.replace('Basic ', ''), 'base64').toString();
    if (key !== 'fub-good:') return reply({ errorMessage: 'Unauthorized' }, 401);
    if (!u.includes('offset=100')) {
      return reply({ _metadata: { nextLink: 'https://api.followupboss.com/v1/people?limit=100&offset=100' }, people: [
        { id: 11, firstName: 'Fay', lastName: 'Fields', emails: [{ value: 'fay@example.com' }], phones: [{ value: '9515550940' }], stage: 'Hot Prospect', source: 'Zillow', tags: ['buyer'] },
      ] });
    }
    return reply({ _metadata: {}, people: [{ id: 12, firstName: 'Pete', emails: [{ value: 'pete@example.com' }], stage: 'Closed' }] });
  });
  const bad = await call('POST', '/api/integrations/followupboss', { api_key: 'nope' });
  assert.equal(bad.status, 400);
  assert.equal((await call('GET', '/api/integrations')).data.followupboss.connected, false, 'bad key not saved');
  const ok = await call('POST', '/api/integrations/followupboss', { api_key: 'fub-good' });
  assert.equal(ok.data.created, 2);
  const fay = db.prepare(`SELECT * FROM contacts WHERE email_norm = 'fay@example.com'`).get();
  assert.equal(fay.stage, 'prequalified');
  assert.equal(fay.source, 'FUB: Zillow');
  assert.match(fay.tags, /buyer/);
  const pete = db.prepare(`SELECT * FROM contacts WHERE email_norm = 'pete@example.com'`).get();
  assert.equal(pete.stage, 'funded');
  assert.equal(pete.lead_type, 'past_client');
  const again = await call('POST', '/api/integrations/followupboss', {});
  assert.equal(again.data.created, 0);
  assert.equal(again.data.merged, 2);
});
