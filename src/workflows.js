import { db, getSettings, json, STAGES, STAGE_KEYS } from './db.js';
import { bus, emit } from './events.js';
import { getContact, logActivity, updateContact, changeStage, routeLead, CONTACT_FIELDS } from './contacts.js';
import { enqueue, sendInternalEmail, SendBlocked } from './messaging.js';
import { mergeVars, enrollContact } from './campaigns.js';
import { proposeOutreach } from './assistant.js';
import { dropVoicemail } from './voicemail.js';
import { postJson, slackNotify, contactPayload } from './hooks.js';
import { render, daysSince, msUntilQuietEnds, fullName } from './util.js';

/* --------------------------------- Catalog --------------------------------- */

export const WF_TRIGGERS = {
  manual: { label: 'Manual enrollment only', fields: [] },
  new_lead: { label: 'New lead is created', fields: [{ key: 'source', label: 'Only from source (optional)', type: 'text' }] },
  form_submitted: { label: 'Landing page / webhook lead arrives', fields: [{ key: 'landing_page_id', label: 'Landing page', type: 'landing_page' }] },
  stage_entered: { label: 'Contact enters a stage', fields: [{ key: 'stage', label: 'Stage (blank = any stage)', type: 'stage' }] },
  score_crossed: { label: 'Ready Score crosses a threshold', fields: [{ key: 'threshold', label: 'Threshold', type: 'number', default: 60 }] },
  replied: { label: 'Contact replies', fields: [] },
  tag_added: { label: 'Tag is added', fields: [{ key: 'tag', label: 'Tag', type: 'text' }] },
  handoff: { label: 'Assistant hands off a warm lead', fields: [] },
  birthday: { label: 'Contact’s birthday', fields: [] },
  loan_anniversary: { label: 'Anniversary of a funded loan', fields: [] },
  dormant: { label: 'Contact goes quiet', fields: [{ key: 'days', label: 'Days without contact', type: 'number', default: 90 }] },
  rate_drop: { label: 'Market rate drops below contact’s rate', fields: [{ key: 'gap', label: 'Rate gap (%)', type: 'number', default: 0.75 }] },
};

export const STEP_TYPES = {
  send_sms: { label: 'Send text', group: 'Communicate', fields: [{ key: 'body', label: 'Message', type: 'textarea' }] },
  send_email: { label: 'Send email', group: 'Communicate', fields: [{ key: 'subject', label: 'Subject', type: 'text' }, { key: 'body', label: 'Body', type: 'textarea' }] },
  ai_draft: { label: 'AI writes a personalized message', group: 'Communicate', fields: [{ key: 'goal', label: 'Goal of the message', type: 'text' }, { key: 'channel', label: 'Channel', type: 'select', options: [['', 'Best available'], ['sms', 'Text'], ['email', 'Email']] }] },
  voicemail_drop: { label: 'Drop voicemail', group: 'Communicate', fields: [{ key: 'drop_id', label: 'Voicemail', type: 'voicemail' }] },
  enroll_campaign: { label: 'Enroll in campaign', group: 'Communicate', fields: [{ key: 'campaign_id', label: 'Campaign', type: 'campaign' }] },
  wait: { label: 'Wait', group: 'Flow', fields: [{ key: 'amount', label: 'Amount', type: 'number', default: 1 }, { key: 'unit', label: 'Unit', type: 'select', options: [['minutes', 'Minutes'], ['hours', 'Hours'], ['days', 'Days']] }] },
  if: { label: 'If / else', group: 'Flow', fields: [] },
  end: { label: 'End workflow', group: 'Flow', fields: [] },
  create_task: { label: 'Create task', group: 'Organize', fields: [{ key: 'title', label: 'Task', type: 'text' }, { key: 'due_hours', label: 'Due in (hours)', type: 'number', default: 0 }] },
  set_stage: { label: 'Move to stage', group: 'Organize', fields: [{ key: 'stage', label: 'Stage', type: 'stage' }] },
  add_tag: { label: 'Add tag', group: 'Organize', fields: [{ key: 'tag', label: 'Tag', type: 'text' }] },
  remove_tag: { label: 'Remove tag', group: 'Organize', fields: [{ key: 'tag', label: 'Tag', type: 'text' }] },
  assign: { label: 'Assign owner', group: 'Organize', fields: [{ key: 'user_id', label: 'Assign to', type: 'user_or_rr' }] },
  update_field: { label: 'Update field', group: 'Organize', fields: [{ key: 'field', label: 'Field', type: 'select', options: [['lead_type', 'Lead type'], ['source', 'Source'], ['loan_type', 'Loan type'], ['purchase_timeline', 'Timeline'], ['credit_band', 'Credit'], ['dnc', 'Do not contact (1/0)']] }, { key: 'value', label: 'Value', type: 'text' }] },
  pause_ai: { label: 'Pause AI assistant', group: 'Organize', fields: [] },
  resume_ai: { label: 'Resume AI assistant', group: 'Organize', fields: [] },
  notify_owner: { label: 'Notify loan officer', group: 'Notify', fields: [{ key: 'message', label: 'Message', type: 'textarea' }, { key: 'via', label: 'Via', type: 'select', options: [['both', 'Email + Slack'], ['email', 'Email'], ['slack', 'Slack']] }] },
  notify_partner: { label: 'Update referral partner', group: 'Notify', fields: [{ key: 'subject', label: 'Subject', type: 'text' }, { key: 'message', label: 'Message', type: 'textarea' }] },
  webhook: { label: 'Send webhook (Zapier, Make…)', group: 'Notify', fields: [{ key: 'url', label: 'URL', type: 'text' }] },
};

export const CONDITION_FIELDS = {
  score: { label: 'Ready Score', type: 'number' },
  stage: { label: 'Stage', type: 'stage' },
  lead_type: { label: 'Lead type', type: 'text' },
  loan_type: { label: 'Loan type', type: 'text' },
  source: { label: 'Source', type: 'text' },
  tag: { label: 'Has tag', type: 'text' },
  replied_since_start: { label: 'Replied since workflow started', type: 'bool' },
  contacted_since_start: { label: 'Loan officer reached out since start', type: 'bool' },
  has_phone: { label: 'Has textable phone', type: 'bool' },
  has_email: { label: 'Has emailable address', type: 'bool' },
  has_partner: { label: 'Has referral partner', type: 'bool' },
  days_since_contact: { label: 'Days since last contact', type: 'number' },
  rate_gap: { label: 'Rate above market (%)', type: 'number' },
};

/* --------------------------------- Recipes --------------------------------- */

const step = (type, config = {}, extra = {}) => ({ type, config, ...extra });
const waitD = (n) => step('wait', { amount: n, unit: 'days' });
const notReplied = [{ field: 'replied_since_start', op: 'is_false' }];

export const RECIPES = [
  {
    key: 'speed_to_lead', name: 'Speed-to-lead blitz', description: 'Text within seconds, call task at 5 minutes, then a 10-day multi-channel sequence until they reply.',
    trigger: 'new_lead', exit_on_reply: 1, exit_stages: ['prequalified', 'application'],
    steps: [
      step('send_sms', { body: "Hi {{first_name}}, it's {{lo_name}} with {{company}} - thanks for reaching out! Are you shopping for a home now, or still getting your numbers together?" }),
      step('wait', { amount: 5, unit: 'minutes' }),
      step('if', { match: 'all', conditions: notReplied }, { yes: [step('create_task', { title: 'Call new lead now (speed to lead)', due_hours: 0 })], no: [] }),
      waitD(1),
      step('send_email', { subject: 'Your home loan options, {{first_name}}', body: "Hi {{first_name}},\n\nThanks again for reaching out. The fastest way to know your buying power is a quick 10-minute call - no credit pull needed to start.\n\nWhat's a good time today or tomorrow?\n\n{{lo_name}}\n{{company}}" }),
      waitD(2),
      step('send_sms', { body: 'Hi {{first_name}}, just making sure my message got through. Happy to answer any questions - even quick ones by text.' }),
      waitD(4),
      step('ai_draft', { goal: 'Friendly last check-in for a new lead who has not replied yet; ask one easy question', channel: '' }),
      waitD(3),
      step('add_tag', { tag: 'nurture' }),
      step('set_stage', { stage: 'nurture' }),
    ],
  },
  {
    key: 'long_nurture', name: '12-month nurture', description: 'Monthly value touches for leads who aren’t ready yet. Starts when the "nurture" tag is added.',
    trigger: 'tag_added', trigger_config: { tag: 'nurture' }, exit_on_reply: 1, exit_stages: ['prequalified', 'application'],
    steps: [
      waitD(30), step('send_email', { subject: 'What actually affects your mortgage rate', body: "Hi {{first_name}},\n\nQuick one: the three biggest things that move the rate you're offered are credit, down payment, and loan type. Small changes to any of them can add up.\n\nIf you'd like, I can show you where you stand - just reply.\n\n{{lo_name}}" }),
      waitD(30), step('send_sms', { body: 'Hi {{first_name}}, {{lo_name}} here. Any changes in your home plans? Happy to rerun numbers anytime.' }),
      waitD(30), step('ai_draft', { goal: 'Helpful market check-in with one question about their timeline', channel: 'email' }),
      waitD(60), step('send_email', { subject: 'Down payment help you might not know about', body: "Hi {{first_name}},\n\nThere are more down payment assistance and low-down-payment programs than most buyers realize. Want me to check which ones might fit you?\n\n{{lo_name}}" }),
      waitD(60), step('ai_draft', { goal: 'Warm six-month check-in referencing anything we know about them', channel: '' }),
      waitD(90), step('send_email', { subject: 'Still thinking about buying, {{first_name}}?', body: "Hi {{first_name}},\n\nIt's been a while! If buying is still on your radar, I'd be glad to put together an updated pre-approval so you're ready when the right home comes along.\n\n{{lo_name}}" }),
    ],
  },
  {
    key: 'rate_drop', name: 'Rate-drop refinance alert', description: 'When the market rate falls 0.75%+ below a past client’s rate: text, email, and a call task for the loan officer.',
    trigger: 'rate_drop', trigger_config: { gap: 0.75 }, exit_on_reply: 1, allow_reentry: 0, exit_stages: ['application'],
    steps: [
      step('send_sms', { body: 'Hi {{first_name}}, {{lo_name}} here. Rates have moved since your loan closed - want me to run a quick, no-pressure comparison?' }),
      step('create_task', { title: 'Refi opportunity: call ({{rate_gap}}% above market)', due_hours: 4 }),
      step('notify_owner', { message: 'Refi alert: {{full_name}} is {{rate_gap}}% above market. {{url}}', via: 'slack' }),
      waitD(2),
      step('send_email', { subject: 'A quick refinance check, {{first_name}}', body: "Hi {{first_name}},\n\nRates have shifted since you closed, and for some of my clients that's opened up a real chance to lower their payment or shorten their term.\n\nWant me to run the numbers for you? It takes about 10 minutes and there's no obligation.\n\n{{lo_name}}\n{{company}}" }),
    ],
  },
  {
    key: 'annual_review', name: 'Past-client annual review', description: 'On each loan anniversary: a personal email plus a review task so no past client goes a year untouched.',
    trigger: 'loan_anniversary', exit_on_reply: 0,
    steps: [
      step('send_email', { subject: 'Happy home-iversary, {{first_name}}!', body: "Hi {{first_name}},\n\nIt's been another year since we closed on your home - congratulations! I do a quick annual mortgage check-up for my clients to make sure the loan still fits your goals (and to see how much equity you've built).\n\nWant me to put yours together?\n\n{{lo_name}}" }),
      step('create_task', { title: 'Annual review: check rate, equity, and goals', due_hours: 48 }),
    ],
  },
  {
    key: 'doc_chase', name: 'Application document chase', description: 'When a loan hits Application: checklist text, reminders every 2 days, and an escalation task if it stalls.',
    trigger: 'stage_entered', trigger_config: { stage: 'application' }, exit_stages: ['processing', 'underwriting', 'clear_to_close', 'funded', 'lost'],
    steps: [
      step('send_sms', { body: "Hi {{first_name}}, congrats on starting your application! I'll email your document checklist - the faster we get those, the faster we close." }),
      step('send_email', { subject: 'Your document checklist', body: "Hi {{first_name}},\n\nHere's what we typically need to keep things moving:\n\n- Last 2 pay stubs\n- Last 2 years W-2s (or tax returns if self-employed)\n- Last 2 months bank statements (all pages)\n- Photo ID\n\nReply with any questions - I'm here to help.\n\n{{lo_name}}" }),
      waitD(2),
      step('if', { match: 'all', conditions: [{ field: 'stage', op: 'eq', value: 'application' }] }, {
        yes: [step('send_sms', { body: 'Hi {{first_name}}, friendly reminder on those documents - send them over whenever you can. Questions? Just reply.' }), waitD(2), step('create_task', { title: 'Docs still outstanding - call borrower', due_hours: 0 })],
        no: [],
      }),
    ],
  },
  {
    key: 'partner_updates', name: 'Referral partner loan updates', description: 'Every time a referred client’s loan moves stages, the referring agent gets an automatic status email.',
    trigger: 'stage_entered', trigger_config: { stage: '' },
    allow_reentry: 1,
    steps: [
      step('if', { match: 'all', conditions: [{ field: 'has_partner', op: 'is_true' }] }, {
        yes: [step('notify_partner', { subject: 'Update on {{full_name}}: {{stage_label}}', message: "Hi {{partner_first_name}},\n\nQuick update on {{full_name}}: their loan just moved to {{stage_label}}.\n\nI'll keep you posted on every milestone. Thanks for the referral!\n\n{{lo_name}}\n{{company}}" })],
        no: [],
      }),
    ],
  },
  {
    key: 'post_close', name: 'Post-close review & referral ask', description: 'After funding: thank-you, review request, referral ask at 30 days, and a check-in at 6 months.',
    trigger: 'stage_entered', trigger_config: { stage: 'funded' },
    steps: [
      waitD(3),
      step('send_email', { subject: 'Thank you, {{first_name}}!', body: "Hi {{first_name}},\n\nCongratulations again on your new home - it was a pleasure working with you.\n\nIf you have a minute, a quick review would mean a lot: {{review_link}}\n\n{{lo_name}}" }),
      waitD(30),
      step('send_sms', { body: "Hi {{first_name}}, hope you're settling in! If you know anyone thinking about buying or refinancing, I'd be honored to help them too." }),
      waitD(150),
      step('ai_draft', { goal: 'Six-month check-in after closing: how is the home, any projects, offer help', channel: '' }),
    ],
  },
  {
    key: 'birthday', name: 'Birthday wishes', description: 'A personal birthday text on the contact’s birthday.',
    trigger: 'birthday',
    steps: [step('send_sms', { body: 'Happy birthday, {{first_name}}! Hope you have a great day. - {{lo_name}}' })],
  },
  {
    key: 'handoff_escalation', name: 'Warm handoff escalation', description: 'When the assistant hands off a hot lead: alert the loan officer, and escalate if nobody reaches out within an hour.',
    trigger: 'handoff',
    steps: [
      step('notify_owner', { message: 'Hot lead ready to talk: {{full_name}} {{phone}} {{url}}', via: 'both' }),
      step('wait', { amount: 1, unit: 'hours' }),
      step('if', { match: 'all', conditions: [{ field: 'contacted_since_start', op: 'is_false' }] }, {
        yes: [step('notify_owner', { message: 'Still waiting: {{full_name}} has not been contacted an hour after a warm handoff. {{url}}', via: 'both' }), step('create_task', { title: 'URGENT: call warm lead (1hr+ waiting)', due_hours: 0 })],
        no: [],
      }),
    ],
  },
];

/* ------------------------------ Path helpers ------------------------------ */
// A path walks the step tree: [i] at the top level, [i, 'yes', j] inside a branch, and so on.

export function stepAt(steps, path) {
  let list = steps;
  let s = null;
  for (let i = 0; i < path.length; i++) {
    if (i % 2 === 0) {
      s = list?.[path[i]];
      if (!s) return null;
    } else {
      list = s[path[i]] || [];
    }
  }
  return s;
}

function normalize(steps, p) {
  let path = [...p];
  while (!stepAt(steps, path)) {
    if (path.length === 1) return null;
    path = path.slice(0, -2);
    path[path.length - 1]++;
  }
  return path;
}

export function advance(steps, path) {
  const p = [...path];
  p[p.length - 1]++;
  return normalize(steps, p);
}

/* -------------------------------- Conditions -------------------------------- */

function conditionValue(field, contact, run) {
  const s = getSettings();
  switch (field) {
    case 'tag': return (contact.tags || '').split(',').map((t) => t.trim().toLowerCase());
    case 'replied_since_start': return Boolean(contact.last_inbound_at && contact.last_inbound_at >= run.started_at);
    case 'contacted_since_start':
      return Boolean(db.prepare(`SELECT 1 FROM activities WHERE contact_id = ? AND direction = 'out' AND user_id IS NOT NULL AND type IN ('call','sms','email','voicemail') AND created_at >= ?`).get(contact.id, run.started_at));
    case 'has_phone': return Boolean(contact.phone_norm && !contact.opted_out_sms && !contact.dnc);
    case 'has_email': return Boolean(contact.email_norm && !contact.opted_out_email && !contact.dnc);
    case 'has_partner': return Boolean(contact.partner_id);
    case 'days_since_contact': return Math.floor(daysSince(contact.last_contacted_at || contact.created_at));
    case 'rate_gap': return contact.current_rate ? contact.current_rate - Number(s.market_rate_30yr) : null;
    default: return contact[field];
  }
}

export function evaluate(cond, contact, run) {
  const actual = conditionValue(cond.field, contact, run);
  const v = cond.value;
  switch (cond.op) {
    case 'is_true': return Boolean(actual);
    case 'is_false': return !actual;
    case 'contains':
      return Array.isArray(actual) ? actual.includes(String(v).trim().toLowerCase()) : String(actual ?? '').toLowerCase().includes(String(v).toLowerCase());
    case 'not_contains':
      return !(Array.isArray(actual) ? actual.includes(String(v).trim().toLowerCase()) : String(actual ?? '').toLowerCase().includes(String(v).toLowerCase()));
    case 'eq': return Array.isArray(actual) ? actual.includes(String(v).toLowerCase()) : String(actual ?? '').toLowerCase() === String(v ?? '').toLowerCase();
    case 'neq': return String(actual ?? '').toLowerCase() !== String(v ?? '').toLowerCase();
    case 'gt': return actual != null && Number(actual) > Number(v);
    case 'gte': return actual != null && Number(actual) >= Number(v);
    case 'lt': return actual != null && Number(actual) < Number(v);
    case 'lte': return actual != null && Number(actual) <= Number(v);
    default: return false;
  }
}

function conditionsPass(config, contact, run) {
  const conds = config?.conditions || [];
  if (!conds.length) return true;
  return config.match === 'any' ? conds.some((c) => evaluate(c, contact, run)) : conds.every((c) => evaluate(c, contact, run));
}

/* --------------------------------- Engine --------------------------------- */

function vars(contact, run) {
  const s = getSettings();
  const partner = contact.partner_id ? db.prepare('SELECT * FROM partners WHERE id = ?').get(contact.partner_id) : null;
  const gap = contact.current_rate ? (contact.current_rate - Number(s.market_rate_30yr)).toFixed(2) : '';
  return {
    ...mergeVars(contact, s),
    stage: contact.stage,
    stage_label: STAGES.find((x) => x.key === contact.stage)?.label || contact.stage,
    partner_name: partner?.name || '',
    partner_first_name: (partner?.name || '').split(' ')[0] || 'there',
    rate_gap: gap,
    url: `${(process.env.APP_URL || '').replace(/\/$/, '')}/#/contacts/${contact.id}`,
    phone: contact.phone_norm || contact.phone || '',
    review_link: s.review_url || '',
    workflow_run: run.id,
  };
}

function log(run, entry) {
  const entries = json(run.log, []);
  entries.push({ at: new Date().toISOString(), ...entry });
  run.log = JSON.stringify(entries.slice(-100));
  db.prepare('UPDATE workflow_runs SET log = ? WHERE id = ?').run(run.log, run.id);
}

function finish(run, status, reason, workflow, contact) {
  db.prepare(`UPDATE workflow_runs SET status = ?, exit_reason = ?, finished_at = datetime('now') WHERE id = ?`).run(status, reason, run.id);
  if (status === 'completed' && contact) emit('workflow.completed', { contact, workflow });
}

export function enroll(workflowId, contactId, { reason = 'trigger', force = false } = {}) {
  const wf = db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowId);
  const contact = getContact(contactId);
  if (!wf || !contact) return null;
  if (!force && wf.status !== 'active') return null;
  if (contact.dnc) return null;
  const active = db.prepare(`SELECT id FROM workflow_runs WHERE workflow_id = ? AND contact_id = ? AND status = 'active'`).get(wf.id, contactId);
  if (active) return null;
  if (!wf.allow_reentry && !force) {
    const yearly = ['birthday', 'loan_anniversary'].includes(wf.trigger);
    const prior = db.prepare(`SELECT id FROM workflow_runs WHERE workflow_id = ? AND contact_id = ? ${yearly ? "AND started_at >= datetime('now','-300 days')" : ''}`).get(wf.id, contactId);
    if (prior) return null;
  }
  const steps = json(wf.steps, []);
  const start = normalize(steps, [0]);
  const runId = Number(db.prepare('INSERT INTO workflow_runs (workflow_id, contact_id, path) VALUES (?, ?, ?)').run(wf.id, contactId, JSON.stringify(start || [0])).lastInsertRowid);
  logActivity(contactId, { type: 'workflow', body: `Enrolled in workflow "${wf.name}"`, meta: { workflow_id: wf.id, run_id: runId, reason } });
  if (!start) finish({ id: runId }, 'completed', 'no steps', wf, contact);
  else setTimeout(() => processRuns().catch((e) => console.error('[workflows]', e)), 5);
  return runId;
}

async function execute(stepDef, contact, run, wf) {
  const c = stepDef.config || {};
  const v = vars(contact, run);
  const owner = contact.owner_id ? db.prepare('SELECT * FROM users WHERE id = ?').get(contact.owner_id) : null;
  switch (stepDef.type) {
    case 'send_sms':
    case 'send_email': {
      const channel = stepDef.type === 'send_sms' ? 'sms' : 'email';
      const blocked = channel === 'sms' ? !contact.phone_norm || contact.opted_out_sms : !contact.email_norm || contact.opted_out_email;
      if (blocked || contact.dnc) return { note: `skipped ${channel} (not reachable or opted out)` };
      enqueue(contact.id, { channel, subject: channel === 'email' ? render(c.subject, v) : null, body: render(c.body, v), source: 'workflow', refId: run.id, userId: null });
      return { note: `queued ${channel}` };
    }
    case 'ai_draft': {
      if (contact.ai_paused) return { note: 'skipped AI message (human has taken over)' };
      const id = await proposeOutreach(contact.id, `${wf.name}: ${c.goal || 'follow up'}`, { channel: c.channel || null, force: true });
      return { note: id ? 'AI message drafted' : 'AI message skipped (no reachable channel)' };
    }
    case 'voicemail_drop': {
      try {
        await dropVoicemail(contact.id, Number(c.drop_id), owner);
        return { note: 'voicemail dropped' };
      } catch (err) {
        if (/Quiet hours/.test(err.message)) {
          const s = getSettings();
          return { retryIn: Math.max(60_000, msUntilQuietEnds(s.timezone, s.quiet_start, s.quiet_end)), note: 'waiting for quiet hours to end' };
        }
        if (err instanceof SendBlocked) return { note: `voicemail skipped: ${err.message}` };
        throw err;
      }
    }
    case 'enroll_campaign': {
      const camp = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(Number(c.campaign_id));
      if (!camp) return { note: 'campaign not found' };
      return { note: `campaign "${camp.name}": ${enrollContact(camp, contact)} message(s) queued` };
    }
    case 'wait': {
      const unit = { minutes: 60_000, hours: 3_600_000, days: 86_400_000 }[c.unit] || 86_400_000;
      return { waitMs: Math.max(0, Number(c.amount) || 0) * unit };
    }
    case 'if': {
      const pass = conditionsPass(c, contact, run);
      return { branch: pass ? 'yes' : 'no', note: `condition ${pass ? 'met → yes' : 'not met → no'}` };
    }
    case 'end': return { end: true };
    case 'create_task': {
      const due = new Date(Date.now() + (Number(c.due_hours) || 0) * 3_600_000).toISOString().replace('T', ' ').slice(0, 19);
      db.prepare(`INSERT INTO tasks (contact_id, user_id, title, kind, due_at) VALUES (?, ?, ?, 'workflow', ?)`).run(contact.id, contact.owner_id, render(c.title || 'Follow up', v).slice(0, 240), due);
      return { note: 'task created' };
    }
    case 'set_stage':
      if (STAGE_KEYS.includes(c.stage) && c.stage !== contact.stage) changeStage(contact.id, c.stage, { reason: `workflow: ${wf.name}` });
      return { note: `stage → ${c.stage}` };
    case 'add_tag':
    case 'remove_tag': {
      const tag = String(c.tag || '').trim();
      if (!tag) return { note: 'no tag set' };
      const tags = new Set((contact.tags || '').split(',').map((t) => t.trim()).filter(Boolean));
      stepDef.type === 'add_tag' ? tags.add(tag) : tags.delete(tag);
      updateContact(contact.id, { tags: [...tags].join(',') });
      return { note: `${stepDef.type === 'add_tag' ? 'added' : 'removed'} tag ${tag}` };
    }
    case 'assign': {
      const uid = c.user_id === 'round_robin' ? routeLead() : Number(c.user_id);
      if (uid) updateContact(contact.id, { owner_id: uid });
      return { note: `assigned to user ${uid}` };
    }
    case 'update_field': {
      const allowed = ['lead_type', 'source', 'loan_type', 'purchase_timeline', 'credit_band', 'dnc'];
      if (!allowed.includes(c.field) || !CONTACT_FIELDS.includes(c.field)) return { note: 'field not allowed' };
      updateContact(contact.id, { [c.field]: render(c.value, v) });
      return { note: `${c.field} updated` };
    }
    case 'pause_ai':
    case 'resume_ai':
      db.prepare('UPDATE contacts SET ai_paused = ? WHERE id = ?').run(stepDef.type === 'pause_ai' ? 1 : 0, contact.id);
      return { note: stepDef.type === 'pause_ai' ? 'AI paused' : 'AI resumed' };
    case 'notify_owner': {
      const msg = render(c.message || `Workflow "${wf.name}" update for {{full_name}}`, v);
      const via = c.via || 'both';
      const notes = [];
      if (via !== 'slack' && owner?.email) { await sendInternalEmail(owner.email, `[CRM] ${fullName(contact)}`, msg); notes.push('email'); }
      if (via !== 'email') { try { const r = await slackNotify(msg); if (!r.skipped) notes.push('slack'); } catch (e) { notes.push(`slack failed: ${e.message}`); } }
      return { note: `notified LO (${notes.join(', ') || 'no channel configured'})` };
    }
    case 'notify_partner': {
      const partner = contact.partner_id ? db.prepare('SELECT * FROM partners WHERE id = ?').get(contact.partner_id) : null;
      if (!partner?.email || !partner.send_updates || !partner.active) return { note: 'no partner to update' };
      await sendInternalEmail(partner.email, render(c.subject || 'Loan update: {{full_name}}', v), render(c.message, v));
      logActivity(contact.id, { type: 'system', body: `Sent status update to referral partner ${partner.name}`, meta: { partner_id: partner.id } });
      return { note: `updated partner ${partner.name}` };
    }
    case 'webhook': {
      const code = await postJson(c.url, { event: 'workflow.step', workflow: { id: wf.id, name: wf.name }, contact: contactPayload(contact) });
      return { note: `webhook ${code}` };
    }
    default:
      return { note: `unknown step ${stepDef.type}` };
  }
}

let processing = false;
/** Advance every due run. Runs execute steps back-to-back until they hit a wait or the end. */
export async function processRuns(limit = 100) {
  if (processing) return 0;
  processing = true;
  let count = 0;
  try {
    const due = db.prepare(`SELECT * FROM workflow_runs WHERE status = 'active' AND next_run_at <= datetime('now') ORDER BY next_run_at LIMIT ?`).all(limit);
    for (const run of due) {
      const wf = db.prepare('SELECT * FROM workflows WHERE id = ?').get(run.workflow_id);
      if (!wf || wf.status === 'paused') continue;
      const steps = json(wf.steps, []);
      let path = json(run.path, [0]);
      let guard = 0;
      while (path && guard++ < 50) {
        const contact = getContact(run.contact_id);
        if (!contact) { finish(run, 'exited', 'contact deleted', wf); path = null; break; }
        if (contact.dnc) { finish(run, 'exited', 'do not contact', wf, contact); path = null; break; }
        const s = stepAt(steps, path);
        if (!s) break;
        let r;
        try {
          r = await execute(s, contact, run, wf);
        } catch (err) {
          log(run, { path, type: s.type, error: err.message });
          r = { note: `error: ${err.message}` };
        }
        if (r.note) log(run, { path, type: s.type, note: r.note });
        if (r.end) { path = null; break; }
        if (r.retryIn) {
          db.prepare(`UPDATE workflow_runs SET next_run_at = datetime('now', ?) WHERE id = ?`).run(`+${Math.ceil(r.retryIn / 1000)} seconds`, run.id);
          break;
        }
        // Entering an empty branch normalizes straight past the if-step.
        path = r.branch ? normalize(steps, [...path, r.branch, 0]) : advance(steps, path);
        db.prepare('UPDATE workflow_runs SET path = ? WHERE id = ?').run(JSON.stringify(path || []), run.id);
        if (r.waitMs) {
          db.prepare(`UPDATE workflow_runs SET next_run_at = datetime('now', ?) WHERE id = ?`).run(`+${Math.ceil(r.waitMs / 1000)} seconds`, run.id);
          break;
        }
      }
      const fresh = db.prepare('SELECT status FROM workflow_runs WHERE id = ?').get(run.id);
      if (!path && fresh?.status === 'active') finish(run, 'completed', 'finished', wf, getContact(run.contact_id));
      count++;
    }
  } finally {
    processing = false;
  }
  return count;
}

export function exitRuns(contactId, reason, filter = () => true) {
  const runs = db.prepare(`SELECT r.*, w.exit_on_reply, w.exit_stages, w.name FROM workflow_runs r JOIN workflows w ON w.id = r.workflow_id WHERE r.contact_id = ? AND r.status = 'active'`).all(contactId);
  for (const r of runs.filter(filter)) {
    db.prepare(`UPDATE workflow_runs SET status = 'exited', exit_reason = ?, finished_at = datetime('now') WHERE id = ?`).run(reason, r.id);
    logActivity(contactId, { type: 'workflow', body: `Left workflow "${r.name}": ${reason}`, meta: { workflow_id: r.workflow_id, run_id: r.id } });
  }
}

/* -------------------------------- Triggers -------------------------------- */

function activeFor(trigger) {
  return db.prepare(`SELECT * FROM workflows WHERE status = 'active' AND trigger = ?`).all(trigger);
}

export function registerWorkflows() {
  bus.on('contact.created', ({ contact }) => {
    for (const wf of activeFor('new_lead')) {
      const cfg = json(wf.trigger_config, {});
      if (cfg.source && !String(contact.source || '').toLowerCase().includes(String(cfg.source).toLowerCase())) continue;
      enroll(wf.id, contact.id);
    }
    if (contact.tags) for (const wf of activeFor('tag_added')) if ((contact.tags || '').split(',').map((t) => t.trim()).includes(json(wf.trigger_config, {}).tag)) enroll(wf.id, contact.id);
  });
  bus.on('form.submitted', ({ contact, landingPageId }) => {
    for (const wf of activeFor('form_submitted')) {
      const cfg = json(wf.trigger_config, {});
      if (cfg.landing_page_id && Number(cfg.landing_page_id) !== Number(landingPageId)) continue;
      enroll(wf.id, contact.id);
    }
  });
  bus.on('stage.changed', ({ contact, to }) => {
    exitRuns(contact.id, `reached goal stage (${to})`, (r) => json(r.exit_stages, []).includes(to));
    for (const wf of activeFor('stage_entered')) {
      const cfg = json(wf.trigger_config, {});
      if (cfg.stage && cfg.stage !== to) continue;
      enroll(wf.id, contact.id);
    }
  });
  bus.on('contact.replied', ({ contact }) => {
    exitRuns(contact.id, 'contact replied', (r) => r.exit_on_reply);
    for (const wf of activeFor('replied')) enroll(wf.id, contact.id);
  });
  bus.on('score.changed', ({ contact, before, after }) => {
    for (const wf of activeFor('score_crossed')) {
      const t = Number(json(wf.trigger_config, {}).threshold ?? 60);
      if (before < t && after >= t) enroll(wf.id, contact.id);
    }
  });
  bus.on('tag.added', ({ contact, tags }) => {
    for (const wf of activeFor('tag_added')) if (tags.includes(json(wf.trigger_config, {}).tag)) enroll(wf.id, contact.id);
  });
  bus.on('contact.handoff', ({ contact }) => {
    for (const wf of activeFor('handoff')) enroll(wf.id, contact.id);
  });
}

/** Date-based triggers, checked by the scheduler. */
export function runTimeTriggers() {
  const s = getSettings();
  let enrolled = 0;
  for (const wf of db.prepare(`SELECT * FROM workflows WHERE status = 'active' AND trigger IN ('birthday','loan_anniversary','dormant','rate_drop')`).all()) {
    const cfg = json(wf.trigger_config, {});
    let rows = [];
    if (wf.trigger === 'birthday') rows = db.prepare(`SELECT id FROM contacts WHERE dnc = 0 AND birthday IS NOT NULL AND strftime('%m-%d', birthday) = strftime('%m-%d','now','localtime')`).all();
    else if (wf.trigger === 'loan_anniversary') rows = db.prepare(`SELECT id FROM contacts WHERE dnc = 0 AND loan_close_date IS NOT NULL AND loan_close_date <= date('now','-300 days') AND strftime('%m-%d', loan_close_date) = strftime('%m-%d','now','localtime')`).all();
    else if (wf.trigger === 'dormant') rows = db.prepare(`SELECT id FROM contacts WHERE dnc = 0 AND stage NOT IN ('application','processing','underwriting','clear_to_close') AND COALESCE(last_contacted_at, created_at) <= datetime('now', ?)`).all(`-${Number(cfg.days) || 90} days`);
    else if (wf.trigger === 'rate_drop') rows = db.prepare(`SELECT id FROM contacts WHERE dnc = 0 AND current_rate IS NOT NULL AND current_rate - ? >= ?`).all(Number(s.market_rate_30yr), Number(cfg.gap ?? 0.75));
    for (const { id } of rows) if (enroll(wf.id, id)) enrolled++;
  }
  return enrolled;
}

/* ------------------------------- Persistence ------------------------------- */

export function installRecipe(key) {
  const r = RECIPES.find((x) => x.key === key);
  if (!r) throw new Error('Unknown recipe');
  const id = db
    .prepare('INSERT INTO workflows (name, description, trigger, trigger_config, steps, exit_on_reply, exit_stages, allow_reentry, recipe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(r.name, r.description, r.trigger, JSON.stringify(r.trigger_config || {}), JSON.stringify(r.steps), r.exit_on_reply ? 1 : 0, JSON.stringify(r.exit_stages || []), r.allow_reentry ? 1 : 0, r.key).lastInsertRowid;
  return Number(id);
}

export function workflowStats(id) {
  return db
    .prepare(`SELECT COUNT(*) enrolled, SUM(status = 'active') active, SUM(status = 'completed') completed, SUM(status = 'exited') exited,
      SUM(exit_reason = 'contact replied') replied, SUM(exit_reason LIKE 'reached goal%') goals FROM workflow_runs WHERE workflow_id = ?`)
    .get(id);
}

/** Validate a step tree from the builder. */
export function validateSteps(steps, depth = 0) {
  if (!Array.isArray(steps)) throw new Error('Steps must be a list');
  if (depth > 6) throw new Error('Branches are nested too deeply');
  for (const s of steps) {
    if (!STEP_TYPES[s.type]) throw new Error(`Unknown step type: ${s.type}`);
    if (s.type === 'if') {
      validateSteps(s.yes || [], depth + 1);
      validateSteps(s.no || [], depth + 1);
    }
    if (s.type === 'webhook' && !/^https?:\/\//.test(s.config?.url || '')) throw new Error('Webhook steps need a URL');
  }
  return true;
}
