import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
delete process.env.ANTHROPIC_API_KEY;
delete process.env.TWILIO_ACCOUNT_SID;
delete process.env.SMTP_HOST;

const { default: app } = await import('../src/server.js');
const { db } = await import('../src/db.js');
const { processOutbox } = await import('../src/messaging.js');
const { computeScore } = await import('../src/scoring.js');

let server;
let base;
const jars = {};

async function call(who, method, path, body, { raw = false, form = false } = {}) {
  const headers = {};
  if (jars[who]) headers.cookie = jars[who];
  let payload;
  if (form) {
    headers['content-type'] = 'application/x-www-form-urlencoded';
    payload = new URLSearchParams(body).toString();
  } else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(base + path, { method, headers, body: payload, redirect: 'manual' });
  const cookie = res.headers.get('set-cookie');
  if (cookie) jars[who] = cookie.split(';')[0];
  if (raw) return res;
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
  return { status: res.status, data };
}

const tick = () => new Promise((r) => setTimeout(r, 30));

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('first-run setup creates the owner and blocks a second setup', async () => {
  let r = await call('owner', 'POST', '/api/setup', { name: 'Olivia Owner', email: 'owner@test.com', password: 'password123', company_name: 'Test Lending' });
  assert.equal(r.status, 200);
  r = await call('anon', 'POST', '/api/setup', { name: 'X', email: 'x@test.com', password: 'password123' });
  assert.equal(r.status, 400);
  r = await call('anon', 'GET', '/api/contacts');
  assert.equal(r.status, 401);
});

test('contacts are normalized, scored, and deduplicated by email/phone', async () => {
  await call('owner', 'PATCH', '/api/settings', { market_rate_30yr: '6.0' });
  let r = await call('owner', 'POST', '/api/contacts', {
    first_name: 'JANE', last_name: 'doe', email: ' Jane@Example.com ', phone: '951.555.0101',
    lead_type: 'past_client', current_rate: '7.5', property_value: '800,000', loan_amount: '$400,000', loan_type: 'Conventional',
  });
  assert.equal(r.status, 201);
  const c = r.data.contact;
  assert.equal(c.first_name, 'Jane');
  assert.equal(c.last_name, 'Doe');
  assert.equal(c.email_norm, 'jane@example.com');
  assert.equal(c.phone_norm, '+19515550101');
  assert.ok(c.score >= 40, `expected strong refi score, got ${c.score}`);
  assert.ok(c.score_reasons.some((x) => /above market/.test(x.why)));

  r = await call('owner', 'POST', '/api/contacts', { first_name: 'Janey', phone: '(951) 555-0101', city: 'Temecula' });
  assert.equal(r.status, 200);
  assert.equal(r.data.created, false);
  assert.equal(r.data.contact.id, c.id);
  assert.equal(r.data.contact.first_name, 'Jane', 'merge must not overwrite existing data');
  assert.equal(r.data.contact.city, 'Temecula', 'merge fills blanks');
});

test('CSV import maps Google-style headers and merges duplicates', async () => {
  const csv = 'Given Name,Family Name,E-mail 1 - Value,Phone 1 - Value,Interest Rate,Closing Date\n'
    + 'Bob,Smith,bob@example.com,9515550202,6.99%,2023-05-01\n'
    + '"Jane","Doe",jane@example.com,,,\n'
    + ',,,,,\n'
    + 'NoContact,,,,,\n';
  const p = await call('owner', 'POST', '/api/import/preview', { csv });
  assert.equal(p.data.mapping['Given Name'], 'first_name');
  assert.equal(p.data.mapping['E-mail 1 - Value'], 'email');
  assert.equal(p.data.mapping['Interest Rate'], 'current_rate');
  const r = await call('owner', 'POST', '/api/import', { csv, mapping: p.data.mapping, defaults: { source: 'Google', lead_type: 'past_client', tags: 'imported' } });
  assert.equal(r.data.created, 2); // Bob + NoContact (name only)
  assert.equal(r.data.merged, 1); // Jane
  const bob = db.prepare(`SELECT * FROM contacts WHERE email_norm = 'bob@example.com'`).get();
  assert.equal(bob.current_rate, 6.99);
  assert.equal(bob.loan_close_date, '2023-05-01');
  assert.match(bob.tags, /imported/);
});

test('STOP reply opts the contact out immediately and blocks texting', async () => {
  const bob = db.prepare(`SELECT id FROM contacts WHERE email_norm = 'bob@example.com'`).get();
  const r = await call('owner', 'POST', `/api/contacts/${bob.id}/inbound`, { channel: 'sms', body: 'STOP' });
  assert.equal(r.data.analysis.intent, 'opt_out');
  const c = db.prepare('SELECT opted_out_sms FROM contacts WHERE id = ?').get(bob.id);
  assert.equal(c.opted_out_sms, 1);
  const send = await call('owner', 'POST', `/api/contacts/${bob.id}/messages`, { channel: 'sms', body: 'Hi Bob' });
  assert.equal(send.status, 400);
  assert.match(send.data.error, /opted out/i);
});

test('a warm reply hands off to the loan officer and pauses the assistant', async () => {
  const jane = db.prepare(`SELECT id FROM contacts WHERE email_norm = 'jane@example.com'`).get();
  db.prepare(`UPDATE contacts SET stage = 'nurture' WHERE id = ?`).run(jane.id);
  const r = await call('owner', 'POST', `/api/contacts/${jane.id}/inbound`, { channel: 'sms', body: 'Yes please call me, my wife Sarah and I want to look at refinancing' });
  assert.equal(r.data.analysis.intent, 'warm');
  const c = db.prepare('SELECT * FROM contacts WHERE id = ?').get(jane.id);
  assert.equal(c.ai_paused, 1);
  assert.equal(c.stage, 'contacted', 'reply should auto-advance nurture -> contacted');
  assert.match(c.facts, /Sarah/);
  const task = db.prepare(`SELECT * FROM tasks WHERE contact_id = ? AND kind = 'handoff'`).get(jane.id);
  assert.ok(task, 'handoff task created');
});

test('assistant drafts need approval, then deliver through the outbox', async () => {
  const r0 = await call('owner', 'POST', '/api/contacts', { first_name: 'Nina', phone: '9515550303', lead_type: 'purchase', purchase_timeline: 'ASAP' });
  const id = r0.data.contact.id;
  const d = await call('owner', 'POST', `/api/contacts/${id}/ai-draft`, {});
  assert.equal(d.status, 200);
  assert.equal(d.data.draft.status, 'pending');
  assert.equal(db.prepare(`SELECT COUNT(*) n FROM activities WHERE contact_id = ? AND type = 'sms'`).get(id).n, 0, 'nothing sent before approval');
  await call('owner', 'POST', `/api/ai/drafts/${d.data.draft.id}/approve`, { body: 'Hi Nina, edited by me!' });
  db.prepare(`UPDATE outbox SET send_after = datetime('now','-1 minute')`).run();
  db.prepare(`UPDATE settings SET value = '00:00' WHERE key IN ('quiet_start','quiet_end')`).run();
  await processOutbox();
  const sms = db.prepare(`SELECT * FROM activities WHERE contact_id = ? AND type = 'sms' AND direction = 'out'`).get(id);
  assert.ok(sms);
  assert.match(sms.body, /edited by me/);
  assert.match(sms.body, /Reply STOP/, 'first text includes opt-out language');
});

test('landing page submission creates a lead, logs consent, and drafts a first touch', async () => {
  const lp = await call('owner', 'POST', '/api/landing-pages', { title: 'Buy a Home', slug: 'Buy A Home!', fields: ['first_name', 'email', 'phone', 'purchase_timeline'], lead_type: 'purchase', tags: 'buyer' });
  assert.equal(lp.data.slug, 'buy-a-home');
  const page = await call('anon', 'GET', '/p/buy-a-home');
  assert.match(page.data, /Reply STOP/);
  const res = await call('anon', 'POST', '/p/buy-a-home', { first_name: 'lena', email: 'lena@example.com', phone: '951-555-0404', purchase_timeline: '1-3 months' }, { raw: true, form: true });
  assert.equal(res.status, 303);
  await tick();
  const c = db.prepare(`SELECT * FROM contacts WHERE email_norm = 'lena@example.com'`).get();
  assert.ok(c);
  assert.equal(c.source, 'landing:buy-a-home');
  assert.match(c.tags, /buyer/);
  assert.ok(db.prepare(`SELECT id FROM activities WHERE contact_id = ? AND type = 'form'`).get(c.id));
  assert.ok(db.prepare(`SELECT id FROM ai_drafts WHERE contact_id = ?`).get(c.id), 'speed-to-lead draft created');
  // Honeypot drops bots silently
  const before = db.prepare('SELECT COUNT(*) n FROM contacts').get().n;
  await call('anon', 'POST', '/p/buy-a-home', { first_name: 'bot', email: 'bot@example.com', website: 'spam.com' }, { raw: true, form: true });
  assert.equal(db.prepare('SELECT COUNT(*) n FROM contacts').get().n, before);
});

test('campaigns target an audience, track opens/clicks, and honor unsubscribes', async () => {
  const camp = await call('owner', 'POST', '/api/campaigns', {
    name: 'Refi check', channel: 'email', subject: 'Hi {{first_name}}', email_body: 'Hi {{first_name}}, see https://example.com/refi',
    audience: { lead_types: ['past_client'], min_rate_gap: 0.75 }, trigger: 'manual',
  });
  const prev = await call('owner', 'POST', '/api/campaigns/preview-audience', { audience: { lead_types: ['past_client'], min_rate_gap: 0.75 } });
  assert.ok(prev.data.count >= 1);
  const launch = await call('owner', 'POST', `/api/campaigns/${camp.data.id}/launch`);
  assert.ok(launch.data.queued >= 1);
  db.prepare(`UPDATE outbox SET send_after = datetime('now','-1 minute')`).run();
  await processOutbox();
  const send = db.prepare('SELECT * FROM campaign_sends WHERE campaign_id = ?').get(camp.data.id);
  assert.equal(send.status, 'sent');
  const email = db.prepare(`SELECT * FROM activities WHERE contact_id = ? AND type = 'email'`).get(send.contact_id);
  assert.match(email.subject, /^Hi Jane/);

  await call('anon', 'GET', `/t/o/${send.token}.gif`, undefined, { raw: true });
  const click = await call('anon', 'GET', `/t/c/${send.token}?u=${encodeURIComponent('https://example.com/refi')}`, undefined, { raw: true });
  assert.equal(click.status, 302);
  const evil = await call('anon', 'GET', `/t/c/${send.token}?u=${encodeURIComponent('https://evil.com')}`, undefined, { raw: true });
  assert.equal(evil.status, 404, 'no open redirect');
  const stats = (await call('owner', 'GET', `/api/campaigns/${camp.data.id}`)).data.stats;
  assert.equal(stats.opened, 1);
  assert.equal(stats.clicked, 1);

  const { signId } = await import('../src/messaging.js');
  const bad = await call('anon', 'GET', `/u/${send.contact_id}/wrong`);
  assert.equal(bad.status, 400);
  await call('anon', 'GET', `/u/${send.contact_id}/${signId('unsub', send.contact_id)}`);
  assert.equal(db.prepare('SELECT opted_out_email FROM contacts WHERE id = ?').get(send.contact_id).opted_out_email, 1);
});

test('members only see their own contacts; round-robin routing assigns leads', async () => {
  const u = await call('owner', 'POST', '/api/users', { name: 'Mo Member', email: 'mo@test.com', password: 'password123', role: 'member' });
  assert.equal(u.status, 201);
  const promote = await call('owner', 'POST', '/api/users', { name: 'X', email: 'x2@test.com', password: 'password123', role: 'owner' });
  assert.equal(promote.status, 201, 'owner may add owners');
  await call('member', 'POST', '/api/login', { email: 'mo@test.com', password: 'password123' });
  const mine = await call('member', 'POST', '/api/contacts', { first_name: 'Member Lead', phone: '9515550505' });
  assert.equal(mine.data.contact.owner_id, u.data.id);
  const list = await call('member', 'GET', '/api/contacts');
  assert.ok(list.data.contacts.every((c) => c.owner_id === u.data.id));
  const jane = db.prepare(`SELECT id, owner_id FROM contacts WHERE email_norm = 'jane@example.com'`).get();
  assert.notEqual(jane.owner_id, u.data.id);
  assert.equal((await call('member', 'GET', `/api/contacts/${jane.id}`)).status, 404);
  assert.equal((await call('member', 'PATCH', '/api/settings', { company_name: 'hax' })).status, 403);
  assert.equal((await call('member', 'POST', '/api/users', { name: 'y', email: 'y@test.com', password: 'password123', role: 'admin' })).status, 403);

  db.prepare(`UPDATE users SET receives_leads = 0 WHERE email = 'x2@test.com'`).run();
  await call('owner', 'PATCH', '/api/settings', { routing_mode: 'round_robin' });
  const owners = [];
  for (let i = 0; i < 4; i++) owners.push((await call('owner', 'POST', '/api/contacts', { first_name: `RR${i}`, phone: `95155506${10 + i}` })).data.contact.owner_id);
  assert.equal(new Set(owners).size, 2, 'leads alternate between the two lead-receiving users');
});

test('funding a loan converts the lead to a past client', async () => {
  const c = (await call('owner', 'POST', '/api/contacts', { first_name: 'Frank', phone: '9515550707', lead_type: 'purchase' })).data.contact;
  const r = await call('owner', 'POST', `/api/contacts/${c.id}/stage`, { stage: 'funded' });
  assert.equal(r.data.contact.lead_type, 'past_client');
  assert.equal(r.data.contact.loan_close_date, new Date().toISOString().slice(0, 10));
});

test('monthly report builds and export produces CSV', async () => {
  const period = new Date().toISOString().slice(0, 7);
  const r = await call('owner', 'POST', `/api/reports/${period}/build`);
  assert.equal(r.data.period, period);
  assert.ok(r.data.totals.contacts > 0);
  assert.ok(Array.isArray(r.data.focus_next));
  const csv = await call('owner', 'GET', '/api/export.csv');
  assert.match(csv.data, /^id,first_name,last_name/);
});

test('scoring: opted-out contacts score zero; purchase readiness counts', () => {
  const s = { market_rate_30yr: '6', dormant_days: '90' };
  assert.equal(computeScore({ dnc: 1 }, s).score, 0);
  const hot = computeScore({ lead_type: 'purchase', purchase_timeline: 'ASAP', preapproved: 1, credit_band: 'Excellent (740+)', stage: 'prequalified', created_at: '2020-01-01' }, s);
  const cold = computeScore({ lead_type: 'purchase', purchase_timeline: 'Just exploring', stage: 'nurture', created_at: '2020-01-01' }, s);
  assert.ok(hot.score > cold.score + 30);
});
