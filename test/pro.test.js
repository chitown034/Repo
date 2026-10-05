import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';

process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.ALLOW_PRIVATE_WEBHOOKS = '1';
delete process.env.ANTHROPIC_API_KEY;
delete process.env.TWILIO_ACCOUNT_SID;
delete process.env.SMTP_HOST;

const { default: app } = await import('../src/server.js');
const { db } = await import('../src/db.js');
const { processRuns, RECIPES, validateSteps } = await import('../src/workflows.js');
const { processDeliveries, assertPublicUrl } = await import('../src/hooks.js');

let server;
let base;
const jars = {};
async function call(who, method, path, body, headers = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { ...(jars[who] ? { cookie: jars[who] } : {}), ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const sc = res.headers.get('set-cookie');
  if (sc) jars[who] = sc.split(';')[0];
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
  return { status: res.status, data, headers: res.headers };
}
const tick = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const due = () => db.prepare(`UPDATE workflow_runs SET next_run_at = datetime('now','-1 minute') WHERE status = 'active'`).run();

/* A local receiver for outbound webhooks. */
const received = [];
let receiver;
let receiverUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
  receiver = http.createServer((req, res) => {
    let b = '';
    req.on('data', (d) => (b += d));
    req.on('end', () => { received.push({ headers: req.headers, body: b }); res.end('ok'); });
  }).listen(0);
  await new Promise((r) => receiver.once('listening', r));
  receiverUrl = `http://127.0.0.1:${receiver.address().port}/hook`;
  await call('owner', 'POST', '/api/setup', { name: 'Olivia Owner', email: 'owner@test.com', password: 'password123' });
  db.prepare(`UPDATE settings SET value = '00:00' WHERE key IN ('quiet_start','quiet_end')`).run();
  db.prepare(`UPDATE settings SET value = 'off' WHERE key = 'assistant_mode'`).run();
});
after(() => { server.close(); receiver.close(); });

test('every recipe is a valid workflow', () => {
  for (const r of RECIPES) assert.doesNotThrow(() => validateSteps(r.steps), r.key);
  assert.throws(() => validateSteps([{ type: 'nope', config: {} }]));
});

test('workflow engine: tag trigger, text, wait, if/else branch, task, completion', async () => {
  const wf = await call('owner', 'POST', '/api/workflows', {
    name: 'VIP flow', trigger: 'tag_added', trigger_config: { tag: 'vip' }, exit_on_reply: false,
    steps: [
      { type: 'send_sms', config: { body: 'Hi {{first_name}}, welcome!' } },
      { type: 'wait', config: { amount: 1, unit: 'days' } },
      { type: 'if', config: { match: 'all', conditions: [{ field: 'replied_since_start', op: 'is_false' }] },
        yes: [{ type: 'create_task', config: { title: 'Call {{first_name}} (no reply)', due_hours: 0 } }],
        no: [{ type: 'add_tag', config: { tag: 'engaged' } }] },
      { type: 'add_tag', config: { tag: 'vip-done' } },
    ],
  });
  assert.equal(wf.status, 201);
  // Not active yet: tagging does nothing.
  const c = (await call('owner', 'POST', '/api/contacts', { first_name: 'Wendy', phone: '9515551001' })).data.contact;
  await call('owner', 'PATCH', `/api/contacts/${c.id}`, { tags: 'vip' });
  await tick();
  assert.equal(db.prepare('SELECT COUNT(*) n FROM workflow_runs WHERE contact_id = ?').get(c.id).n, 0);

  await call('owner', 'PATCH', `/api/workflows/${wf.data.id}`, { status: 'active' });
  const c2 = (await call('owner', 'POST', '/api/contacts', { first_name: 'Vince', phone: '9515551002' })).data.contact;
  await call('owner', 'PATCH', `/api/contacts/${c2.id}`, { tags: 'vip' });
  await tick(100);
  await processRuns();
  const run = db.prepare('SELECT * FROM workflow_runs WHERE contact_id = ?').get(c2.id);
  assert.equal(run.status, 'active');
  assert.deepEqual(JSON.parse(run.path), [2], 'waiting before the if-step');
  const sms = db.prepare(`SELECT * FROM outbox WHERE contact_id = ? AND source = 'workflow'`).get(c2.id);
  assert.equal(sms.body, 'Hi Vince, welcome!');

  due();
  await processRuns();
  const done = db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(run.id);
  assert.equal(done.status, 'completed');
  assert.ok(db.prepare(`SELECT 1 FROM tasks WHERE contact_id = ? AND title = 'Call Vince (no reply)'`).get(c2.id), 'yes-branch task');
  const tags = db.prepare('SELECT tags FROM contacts WHERE id = ?').get(c2.id).tags;
  assert.match(tags, /vip-done/);
  assert.doesNotMatch(tags, /engaged/, 'no-branch skipped');

  // No re-entry by default.
  await call('owner', 'PATCH', `/api/contacts/${c2.id}`, { tags: 'vip-done' });
  await call('owner', 'PATCH', `/api/contacts/${c2.id}`, { tags: 'vip-done,vip' });
  await tick();
  assert.equal(db.prepare('SELECT COUNT(*) n FROM workflow_runs WHERE contact_id = ?').get(c2.id).n, 1);
});

test('workflow exits on reply and on reaching a goal stage', async () => {
  const wf = (await call('owner', 'POST', '/api/workflows', { name: 'Exit test', trigger: 'manual', exit_on_reply: true, exit_stages: ['application'], steps: [{ type: 'wait', config: { amount: 5, unit: 'days' } }, { type: 'send_sms', config: { body: 'late' } }] })).data;
  const a = (await call('owner', 'POST', '/api/contacts', { first_name: 'Rae', phone: '9515551003' })).data.contact;
  const b = (await call('owner', 'POST', '/api/contacts', { first_name: 'Gus', phone: '9515551004' })).data.contact;
  const en = await call('owner', 'POST', `/api/workflows/${wf.id}/enroll`, { contact_ids: [a.id, b.id] });
  assert.equal(en.data.enrolled, 2, 'manual enrollment works on draft workflows');
  await tick();
  await processRuns();
  await call('owner', 'POST', `/api/contacts/${a.id}/inbound`, { channel: 'sms', body: 'thanks!' });
  await call('owner', 'POST', `/api/contacts/${b.id}/stage`, { stage: 'application' });
  await tick();
  const ra = db.prepare('SELECT * FROM workflow_runs WHERE contact_id = ? AND workflow_id = ?').get(a.id, wf.id);
  const rb = db.prepare('SELECT * FROM workflow_runs WHERE contact_id = ? AND workflow_id = ?').get(b.id, wf.id);
  assert.equal(ra.status, 'exited');
  assert.equal(ra.exit_reason, 'contact replied');
  assert.equal(rb.status, 'exited');
  assert.match(rb.exit_reason, /goal stage/);
});

test('partners: co-branded landing page credits the partner; partner update workflow emails them', async () => {
  const p = (await call('owner', 'POST', '/api/partners', { name: 'Dana Agent', email: 'dana@example.com', send_updates: true })).data;
  const wf = (await call('owner', 'POST', '/api/workflows', { recipe: 'partner_updates' })).data;
  await call('owner', 'PATCH', `/api/workflows/${wf.id}`, { status: 'active' });
  const lp = (await call('owner', 'POST', '/api/landing-pages', { title: 'Dana buyers', slug: 'dana', fields: ['first_name', 'email', 'phone'], partner_id: p.id, show_calculator: true })).data;
  const page = await call('anon', 'GET', '/p/dana');
  assert.match(page.data, /Estimate your monthly payment/);
  await fetch(`${base}/p/dana`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'first_name=Lou&email=lou%40example.com&phone=9515551005', redirect: 'manual' });
  await tick();
  const lou = db.prepare(`SELECT * FROM contacts WHERE email_norm = 'lou@example.com'`).get();
  assert.equal(lou.partner_id, p.id);
  await call('owner', 'POST', `/api/contacts/${lou.id}/stage`, { stage: 'prequalified' });
  await tick(100);
  await processRuns();
  assert.ok(db.prepare(`SELECT 1 FROM activities WHERE contact_id = ? AND body LIKE 'Sent status update to referral partner Dana Agent%'`).get(lou.id));
  const detail = await call('owner', 'GET', `/api/partners/${p.id}`);
  assert.equal(detail.data.clients.length, 1);
  const qr = await call('owner', 'GET', `/api/landing-pages/${lp.id}/qr.svg`);
  assert.match(qr.data, /^<svg/);
});

test('outbound webhooks are signed, retried, and SSRF-guarded', async () => {
  const wh = await call('owner', 'POST', '/api/hub/webhooks', { url: receiverUrl, events: ['contact.created', 'stage.changed'] });
  assert.equal(wh.status, 201);
  received.length = 0;
  await call('owner', 'POST', '/api/contacts', { first_name: 'Hook', email: 'hook@example.com' });
  await tick(100);
  await processDeliveries();
  const got = received.find((r) => r.headers['x-crm-event'] === 'contact.created');
  assert.ok(got, 'delivered');
  const expected = `sha256=${crypto.createHmac('sha256', wh.data.secret).update(got.body).digest('hex')}`;
  assert.equal(got.headers['x-crm-signature'], expected);
  assert.equal(JSON.parse(got.body).data.contact.email, 'hook@example.com');

  const bad = (await call('owner', 'POST', '/api/hub/webhooks', { url: 'http://127.0.0.1:1/nothing', events: ['contact.created'] })).data;
  const t = await call('owner', 'POST', `/api/hub/webhooks/${bad.id}/test`);
  assert.equal(t.data.status, 'pending', 'failed delivery is queued for retry');

  delete process.env.ALLOW_PRIVATE_WEBHOOKS;
  assert.throws(() => assertPublicUrl('http://169.254.169.254/latest'), /Private/);
  assert.throws(() => assertPublicUrl('http://localhost:3000'), /Private/);
  assert.throws(() => assertPublicUrl('ftp://example.com'));
  assert.doesNotThrow(() => assertPublicUrl('https://hooks.zapier.com/hooks/catch/1/abc'));
  process.env.ALLOW_PRIVATE_WEBHOOKS = '1';
  await call('owner', 'DELETE', `/api/hub/webhooks/${bad.id}`);
});

test('public REST API: keys, scoping, CRUD, REST hooks, revocation', async () => {
  const k = (await call('owner', 'POST', '/api/hub/api-keys', { name: 'Zapier' })).data;
  assert.match(k.key, /^crm_/);
  const auth = { authorization: `Bearer ${k.key}` };
  assert.equal((await call('anon', 'GET', '/v1/contacts')).status, 401);
  const created = await call('anon', 'POST', '/v1/contacts', { first_name: 'Api', email: 'api@example.com', source: 'Zapier' }, auth);
  assert.equal(created.status, 201);
  const id = created.data.data.id;
  assert.equal((await call('anon', 'GET', `/v1/contacts?email=api@example.com`, undefined, auth)).data.data[0].id, id);
  assert.equal((await call('anon', 'PATCH', `/v1/contacts/${id}`, { city: 'Murrieta' }, auth)).data.data.city, 'Murrieta');
  assert.equal((await call('anon', 'POST', `/v1/contacts/${id}/stage`, { stage: 'bogus' }, auth)).status, 400);
  assert.equal((await call('anon', 'POST', `/v1/contacts/${id}/notes`, { body: 'from zap' }, auth)).status, 201);
  const m = await call('anon', 'GET', '/v1/metrics?days=7', undefined, auth);
  assert.ok(m.data.data.funnel);
  const sub = await call('anon', 'POST', '/v1/hooks', { url: receiverUrl, events: ['loan.funded'] }, auth);
  assert.equal(sub.status, 201);
  assert.equal((await call('anon', 'DELETE', `/v1/hooks/${sub.data.data.id}`, undefined, auth)).status, 200);

  // Member keys only see the member's own contacts.
  await call('owner', 'POST', '/api/users', { name: 'Mia Member', email: 'mia@test.com', password: 'password123' });
  await call('member', 'POST', '/api/login', { email: 'mia@test.com', password: 'password123' });
  assert.equal((await call('member', 'POST', '/api/hub/api-keys', { name: 'x' })).status, 403);
  const mk = (await call('owner', 'POST', '/api/hub/api-keys', { name: 'tmp' })).data;
  db.prepare(`UPDATE api_keys SET user_id = (SELECT id FROM users WHERE email = 'mia@test.com') WHERE id = ?`).run(mk.id);
  const mAuth = { authorization: `Bearer ${mk.key}` };
  assert.equal((await call('anon', 'GET', `/v1/contacts/${id}`, undefined, mAuth)).status, 404);
  assert.equal((await call('anon', 'POST', '/v1/hooks', { url: receiverUrl, events: ['loan.funded'] }, mAuth)).status, 403);

  await call('owner', 'DELETE', `/api/hub/api-keys/${k.id}`);
  assert.equal((await call('anon', 'GET', '/v1/contacts', undefined, auth)).status, 401);
});

test('calendar feed is signed and lists open tasks', async () => {
  const c = (await call('owner', 'POST', '/api/contacts', { first_name: 'Cal', phone: '9515551006' })).data.contact;
  await call('owner', 'POST', `/api/contacts/${c.id}/tasks`, { title: 'Consult call', due_at: '2030-01-15T10:00', user_id: 1 });
  const { url } = (await call('owner', 'GET', '/api/calendar-url')).data;
  const path = new URL(url).pathname;
  const ics = await call('anon', 'GET', path);
  assert.match(ics.data, /BEGIN:VCALENDAR/);
  assert.match(ics.data, /SUMMARY:✅ Consult call - Cal/);
  assert.equal((await call('anon', 'GET', path.replace(/\/[^/]+\.ics$/, '/forged.ics'))).status, 404);
});

test('analytics: funnel, ROI with spend, leaderboard; members are scoped to themselves', async () => {
  await call('owner', 'POST', '/api/lead-spend', { source: 'Zapier', month: new Date().toISOString().slice(0, 7), amount: 300 });
  const a = (await call('owner', 'GET', '/api/analytics?days=30')).data;
  assert.equal(a.funnel[0].step, 'Leads');
  assert.ok(a.funnel[0].n > 0);
  for (let i = 1; i < a.funnel.length; i++) assert.ok(a.funnel[i].n <= a.funnel[i - 1].n, 'funnel is nested');
  const zap = a.sources.find((s) => s.source === 'Zapier');
  assert.equal(zap.spend, 300);
  assert.equal(zap.cost_per_lead, 300);
  assert.ok(a.leaderboard.length >= 2);
  const mine = (await call('member', 'GET', '/api/analytics?days=30&owner_id=1')).data;
  assert.equal(mine.range.owner_id, db.prepare(`SELECT id FROM users WHERE email = 'mia@test.com'`).get().id, 'members cannot view others');
});

test('Coach surfaces handoffs and unanswered replies; Content Studio drafts, schedules, publishes', async () => {
  const c = (await call('owner', 'POST', '/api/contacts', { first_name: 'Hana', phone: '9515551007' })).data.contact;
  await call('owner', 'POST', `/api/contacts/${c.id}/inbound`, { channel: 'sms', body: 'Can you call me? We found a house' });
  await tick();
  const coach = (await call('owner', 'GET', '/api/coach')).data;
  assert.ok(coach.actions.some((x) => /Call Hana/.test(x.title)), 'handoff is top priority');
  assert.equal(coach.actions[0].priority, 100);

  const wh = (await call('owner', 'POST', '/api/hub/webhooks', { url: receiverUrl, events: ['content.published'] })).data;
  const g = (await call('owner', 'POST', '/api/content/generate', { kind: 'social_post', platform: 'facebook', topic: 'Spring pre-approvals' })).data;
  assert.match(g.body, /Spring pre-approvals/);
  const item = (await call('owner', 'POST', '/api/content', { kind: 'social_post', platform: 'facebook', title: g.title, body: g.body })).data;
  assert.equal(item.status, 'draft');
  received.length = 0;
  const pub = (await call('owner', 'PATCH', `/api/content/${item.id}`, { publish: true })).data;
  assert.equal(pub.status, 'published');
  await tick(100);
  await processDeliveries();
  assert.ok(received.some((r) => r.headers['x-crm-event'] === 'content.published'));
  const nl = (await call('owner', 'POST', '/api/content', { kind: 'newsletter', title: 'N', body: 'Subject: Big news\n\nHi {{first_name}}' })).data;
  const camp = (await call('owner', 'POST', `/api/content/${nl.id}/to-campaign`)).data;
  assert.equal(db.prepare('SELECT subject FROM campaigns WHERE id = ?').get(camp.campaign_id).subject, 'Big news');
  await call('owner', 'DELETE', `/api/hub/webhooks/${wh.id}`);
});

test('Copilot: offline answers, then a full Claude tool-use loop against a stub', async () => {
  const off = (await call('owner', 'POST', '/api/copilot', { text: 'What should I focus on today?' })).data;
  assert.match(off.messages.at(-1).text, /next best actions/i);

  // Stub Anthropic API: first asks to search, then creates a task, then answers.
  let turn = 0;
  const stub = http.createServer((req, res) => {
    let b = '';
    req.on('data', (d) => (b += d));
    req.on('end', () => {
      const body = JSON.parse(b);
      assert.equal(req.headers['anthropic-beta'], 'server-side-fallback-2026-07-01');
      assert.equal(body.fallbacks, 'default');
      turn++;
      let content;
      let stop = 'tool_use';
      if (turn === 1) content = [{ type: 'tool_use', id: 't1', name: 'search_contacts', input: { query: 'Hana' } }];
      else if (turn === 2) {
        const result = JSON.parse(body.messages.at(-1).content[0].content);
        content = [{ type: 'tool_use', id: 't2', name: 'create_task', input: { title: 'Call Hana about her house', contact_id: result[0].id } }];
      } else { content = [{ type: 'text', text: 'Done - I created a task to call Hana [#' + body.messages.at(-1).content[0].tool_use_id + '].' }]; stop = 'end_turn'; }
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ id: `msg_${turn}`, type: 'message', role: 'assistant', model: body.model, stop_reason: stop, content, usage: { input_tokens: 1, output_tokens: 1 } }));
    });
  }).listen(0);
  await new Promise((r) => stub.once('listening', r));
  process.env.ANTHROPIC_API_KEY = 'test';
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${stub.address().port}`;
  try {
    const r = (await call('owner', 'POST', '/api/copilot', { text: 'Make a task to call Hana' })).data;
    assert.equal(turn, 3);
    assert.deepEqual(r.actions.map((a) => a.tool), ['search_contacts', 'create_task']);
    assert.ok(db.prepare(`SELECT 1 FROM tasks WHERE title = 'Call Hana about her house'`).get());
    assert.match(r.messages.at(-1).text, /created a task/);
    assert.deepEqual(r.messages.filter((m) => m.role === 'assistant').flatMap((m) => m.tools), ['search_contacts', 'create_task']);
    const stored = JSON.parse(db.prepare('SELECT messages FROM copilot_threads WHERE id = ?').get(r.thread_id).messages);
    assert.equal(stored.filter((m) => m.role === 'user' && Array.isArray(m.content) && m.content[0].type === 'tool_result').length, 2, 'tool results kept in history');
  } finally {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_BASE_URL;
    stub.close();
  }
});
