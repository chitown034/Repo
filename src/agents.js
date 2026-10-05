import { db, getSettings, getSetting, setSetting, json, STAGES, STAGE_KEYS } from './db.js';
import { aiEnabled, getClient, MODEL, COMPLIANCE_RULES, structured } from './ai.js';
import { getContact, logActivity, changeStage, updateContact, serializeContact } from './contacts.js';
import { proposeOutreach } from './assistant.js';
import { performance } from './metrics.js';
import { enroll } from './workflows.js';
import { emit } from './events.js';
import { fullName, daysSince } from './util.js';

const scopeSql = (user, alias = 'c') => (['owner', 'admin'].includes(user.role) ? '1=1' : `${alias}.owner_id = ${Number(user.id)}`);
const brief = (c) => ({ id: c.id, name: fullName(c), stage: c.stage, lead_type: c.lead_type, score: c.score, phone: c.phone_norm, email: c.email, last_contact_days: Number.isFinite(daysSince(c.last_contacted_at)) ? Math.round(daysSince(c.last_contacted_at)) : null, top_reason: json(c.score_reasons, []).find((r) => r.pts > 0)?.why || null });

function canSee(user, contactId) {
  const c = getContact(Number(contactId));
  if (!c) throw new Error(`Contact ${contactId} not found`);
  if (!['owner', 'admin'].includes(user.role) && c.owner_id !== user.id) throw new Error(`Contact ${contactId} not found`);
  return c;
}

/* ============================== Opportunities ============================== */

export function findOpportunities(user, kind, limit = 15) {
  const s = getSettings();
  const scope = scopeSql(user);
  const q = (sql, ...p) => db.prepare(sql).all(...p).map(brief);
  switch (kind) {
    case 'refi':
      return q(`SELECT c.* FROM contacts c WHERE ${scope} AND c.dnc = 0 AND c.current_rate IS NOT NULL AND c.current_rate - ? >= 0.75 AND c.stage NOT IN ('application','processing','underwriting','clear_to_close') ORDER BY c.current_rate DESC LIMIT ?`, Number(s.market_rate_30yr), limit);
    case 'equity':
      return q(`SELECT c.* FROM contacts c WHERE ${scope} AND c.dnc = 0 AND c.loan_amount > 0 AND COALESCE(c.avm_value, c.property_value) > 0 AND c.loan_amount / COALESCE(c.avm_value, c.property_value) <= 0.6 ORDER BY COALESCE(c.avm_value, c.property_value) - c.loan_amount DESC LIMIT ?`, limit);
    case 'hot':
      return q(`SELECT c.* FROM contacts c WHERE ${scope} AND c.dnc = 0 AND c.score >= 55 AND c.stage NOT IN ('application','processing','underwriting','clear_to_close','funded') ORDER BY c.score DESC LIMIT ?`, limit);
    case 'dormant':
      return q(`SELECT c.* FROM contacts c WHERE ${scope} AND c.dnc = 0 AND COALESCE(c.last_contacted_at, c.created_at) <= datetime('now', ?) ORDER BY c.score DESC LIMIT ?`, `-${Number(s.dormant_days) || 90} days`, limit);
    case 'stalled_loans':
      return q(`SELECT c.* FROM contacts c WHERE ${scope} AND c.stage IN ('application','processing','underwriting','clear_to_close') AND c.stage_changed_at <= datetime('now','-7 days') ORDER BY c.stage_changed_at LIMIT ?`, limit);
    case 'unanswered':
      return q(`SELECT c.* FROM contacts c WHERE ${scope} AND c.last_inbound_at IS NOT NULL AND c.last_inbound_at >= datetime('now','-14 days')
        AND NOT EXISTS (SELECT 1 FROM activities a WHERE a.contact_id = c.id AND a.direction = 'out' AND a.created_at > c.last_inbound_at) ORDER BY c.last_inbound_at DESC LIMIT ?`, limit);
    default:
      throw new Error(`Unknown opportunity type: ${kind}`);
  }
}

/* ================================ Coach agent ================================ */

/** Prioritized next-best actions for today. Deterministic and instant; the AI briefing is optional on top. */
export function nextBestActions(user) {
  const scope = scopeSql(user);
  const s = getSettings();
  const actions = [];
  const push = (priority, icon, title, detail, link, count = null) => actions.push({ priority, icon, title, detail, link, count });

  const handoffs = db.prepare(`SELECT t.*, c.first_name, c.last_name FROM tasks t JOIN contacts c ON c.id = t.contact_id WHERE t.done = 0 AND t.kind = 'handoff' AND ${scope}`).all();
  for (const h of handoffs.slice(0, 5)) push(100, '🔥', `Call ${fullName(h)} - warm handoff`, h.title.replace(/^🔥 Warm handoff: call [^-]+- /, ''), `#/contacts/${h.contact_id}`);

  for (const c of findOpportunities(user, 'unanswered', 5)) push(95, '💬', `Reply to ${c.name}`, 'They replied and nobody has answered yet', `#/contacts/${c.id}`);

  const fresh = db.prepare(`SELECT c.* FROM contacts c WHERE ${scope} AND c.stage = 'new' AND c.last_contacted_at IS NULL AND c.created_at <= datetime('now', ?) AND c.created_at >= datetime('now','-3 days') ORDER BY c.created_at LIMIT 5`).all(`-${Number(s.speed_to_lead_minutes) || 5} minutes`);
  const ago = (mins) => (mins < 90 ? `${Math.round(mins)} minutes` : mins < 2880 ? `${Math.round(mins / 60)} hours` : `${Math.round(mins / 1440)} days`);
  for (const c of fresh) push(90, '⚡', `Contact new lead ${fullName(c)}`, `Waiting ${ago(daysSince(c.created_at) * 1440)} - speed to lead matters`, `#/contacts/${c.id}`);

  const overdue = db.prepare(`SELECT COUNT(*) n FROM tasks t LEFT JOIN contacts c ON c.id = t.contact_id WHERE t.done = 0 AND t.due_at < datetime('now') AND ${['owner', 'admin'].includes(user.role) ? '1=1' : `t.user_id = ${Number(user.id)}`}`).get().n;
  if (overdue) push(80, '⏰', `${overdue} overdue task${overdue > 1 ? 's' : ''}`, 'Clear these before they cost you a deal', '#/tasks', overdue);

  for (const c of findOpportunities(user, 'stalled_loans', 4)) push(75, '🧱', `Unstick ${c.name}'s loan`, `In ${STAGES.find((x) => x.key === c.stage)?.label} for ${Math.round(daysSince(db.prepare('SELECT stage_changed_at FROM contacts WHERE id = ?').get(c.id).stage_changed_at))} days`, `#/contacts/${c.id}`);

  const drafts = db.prepare(`SELECT COUNT(*) n FROM ai_drafts d JOIN contacts c ON c.id = d.contact_id WHERE d.status = 'pending' AND ${scope}`).get().n;
  if (drafts) push(70, '✨', `Approve ${drafts} AI message${drafts > 1 ? 's' : ''}`, `${s.assistant_name} has follow-ups ready`, '#/assistant', drafts);

  const hot = db.prepare(`SELECT c.* FROM contacts c WHERE ${scope} AND c.dnc = 0 AND c.score >= 60 AND (c.last_contacted_at IS NULL OR c.last_contacted_at <= datetime('now','-7 days')) AND c.stage NOT IN ('application','processing','underwriting','clear_to_close') ORDER BY c.score DESC LIMIT 3`).all();
  for (const c of hot) push(65, '🎯', `Call ${fullName(c)} (score ${c.score})`, json(c.score_reasons, []).find((r) => r.pts > 0)?.why || 'High Ready Score', `#/contacts/${c.id}`);

  const refi = findOpportunities(user, 'refi', 100).filter((c) => c.last_contact_days == null || c.last_contact_days >= 30);
  if (refi.length) push(60, '📉', `${refi.length} refinance opportunit${refi.length > 1 ? 'ies' : 'y'}`, `Rate 0.75%+ above today's ${s.market_rate_30yr}% and not contacted in 30 days`, '#/contacts?min_score=20&lead_type=past_client', refi.length);

  const dates = db.prepare(`SELECT c.* FROM contacts c WHERE ${scope} AND c.dnc = 0 AND ((c.birthday IS NOT NULL AND strftime('%m-%d', c.birthday) = strftime('%m-%d','now','localtime')) OR (c.loan_close_date IS NOT NULL AND c.loan_close_date <= date('now','-300 days') AND strftime('%m-%d', c.loan_close_date) = strftime('%m-%d','now','localtime'))) LIMIT 5`).all();
  for (const c of dates) push(55, '🎉', `${fullName(c)}: ${c.birthday && c.birthday.slice(5) === new Date().toISOString().slice(5, 10) ? 'birthday' : 'home anniversary'} today`, 'A personal touch goes a long way', `#/contacts/${c.id}`);

  return actions.sort((a, b) => b.priority - a.priority).slice(0, 12);
}

export async function coachBriefing(user, { refresh = false } = {}) {
  const key = `coach_briefing_${user.id}_${new Date().toISOString().slice(0, 10)}`;
  const cached = getSetting(key);
  if (cached && !refresh) return cached;
  if (!aiEnabled()) return null;
  const m = performance({ days: 30, ownerId: ['owner', 'admin'].includes(user.role) ? null : user.id });
  const data = { actions: nextBestActions(user).map((a) => a.title), kpi: m.kpi, speed: m.speed, funnel: m.funnel.map((f) => `${f.step}: ${f.n}`), top_sources: m.sources.slice(0, 4) };
  const out = await structured(
    `You are a performance coach for ${user.name}, a loan officer. Using this data, write a short morning briefing (3-5 sentences): one genuine win, the single biggest leak in their funnel, and the 2-3 actions that will move the most money today. Be specific and direct; no fluff.\n\n${JSON.stringify(data)}`,
    { type: 'object', properties: { briefing: { type: 'string' } }, required: ['briefing'], additionalProperties: false },
    getSettings(),
    'low',
  );
  setSetting(key, out.briefing);
  return out.briefing;
}

/* =============================== Content Studio =============================== */

export const CONTENT_KINDS = {
  social_post: { label: 'Social post', platforms: ['facebook', 'instagram', 'linkedin', 'x'] },
  newsletter: { label: 'Email newsletter', platforms: ['email'] },
  blog: { label: 'Blog article', platforms: ['website'] },
  video_script: { label: 'Video script (Reels/TikTok/YouTube)', platforms: ['instagram', 'tiktok', 'youtube'] },
  market_update: { label: 'Market update', platforms: ['facebook', 'linkedin', 'email'] },
};

export async function generateContent({ kind = 'social_post', platform = 'facebook', topic, tone = 'friendly and expert', audience = 'local home buyers and homeowners' }) {
  if (!CONTENT_KINDS[kind]) throw new Error('Unknown content type');
  if (!topic?.trim()) throw new Error('Give the content a topic');
  const s = getSettings();
  const lengths = { social_post: platform === 'x' ? 'under 270 characters' : '60-150 words with 3-6 relevant hashtags at the end', newsletter: '250-400 words with a subject line, short sections, one call to action', blog: '600-900 words with H2 subheadings in Markdown and an SEO-friendly title', video_script: '45-60 seconds: hook in the first 3 seconds, on-screen text cues in [brackets], and a call to action', market_update: '120-220 words, plain language, what it means for buyers and homeowners' };
  if (aiEnabled()) {
    try {
      const out = await structured(
        `Create a ${CONTENT_KINDS[kind].label.toLowerCase()} for ${platform}.\nTopic: ${topic}\nAudience: ${audience}\nTone: ${tone}\nLength/format: ${lengths[kind]}\nBrand: ${s.loan_officer_name || 'the loan officer'} at ${s.company_name}${s.loan_officer_nmls ? ` (NMLS #${s.loan_officer_nmls})` : ''}.\nMake it genuinely useful and specific, not generic hype. End with a soft call to action.\n\n${COMPLIANCE_RULES}\n- Advertising: if you must reference rates, speak only in general trends, never specific numbers.`,
        { type: 'object', properties: { title: { type: 'string' }, body: { type: 'string' } }, required: ['title', 'body'], additionalProperties: false },
        s,
      );
      return { ...out, generator: 'claude' };
    } catch (err) {
      console.error('[content] generation failed, using template:', err.message);
    }
  }
  const lo = s.loan_officer_name || s.company_name;
  const t = topic.trim();
  const templates = {
    social_post: `${t} 🏡\n\nHere's what most people don't realize: the right loan strategy can matter as much as the house itself. A quick conversation now can save real money later.\n\nQuestions? Send me a message - happy to help, no pressure.\n\n- ${lo}, ${s.company_name}\n\n#homebuying #mortgage #firsttimehomebuyer #realestate`,
    newsletter: `Subject: ${t}\n\nHi {{first_name}},\n\n${t} - here's what it means for you.\n\nWhat's happening: The market keeps shifting, and small changes can affect what you can afford and what makes sense to do next.\n\nWhat to do: If you're thinking about buying, refinancing, or tapping equity this year, now is a great time to get your numbers in order.\n\nReply to this email and I'll put together a personalized snapshot for you.\n\n${lo}\n${s.company_name}`,
    blog: `# ${t}\n\n## Why it matters\nWhether you're buying your first home or thinking about your next move, understanding this topic can save you time, money, and stress.\n\n## What to know\n- Your credit, down payment, and loan type all shape your options.\n- There are more programs available than most people realize.\n- Getting pre-approved early puts you in a stronger position.\n\n## Next steps\nTalk with a local loan officer who can walk you through your options. Reach out to ${lo} at ${s.company_name} anytime.`,
    video_script: `[HOOK - on screen: "${t}"]\nStop scrolling if you're thinking about buying a home this year.\n\n[Point 1]\nMost people start house hunting before they know their real budget. Big mistake.\n\n[Point 2]\nA pre-approval tells you exactly what you can afford - and makes your offer stronger.\n\n[CTA - on screen: "DM me 'READY'"]\nSend me a message and I'll help you get your numbers - ${lo}, ${s.company_name}.`,
    market_update: `${t}\n\nThe quick take: the market keeps moving, and that creates opportunities for both buyers and homeowners.\n\nBuyers: getting pre-approved now helps you move fast when the right home appears.\nHomeowners: it may be worth checking whether your current loan still fits your goals.\n\nWant a personalized look at your situation? Message me anytime. - ${lo}`,
  };
  return { title: t, body: templates[kind], generator: 'template' };
}

/** Publish scheduled content whose time has come (fires content.published for Zapier/Buffer/etc.). */
export function publishDueContent() {
  const due = db.prepare(`SELECT * FROM content_items WHERE status = 'scheduled' AND scheduled_at <= datetime('now')`).all();
  for (const item of due) publishContent(item.id);
  return due.length;
}

export function publishContent(id) {
  db.prepare(`UPDATE content_items SET status = 'published', published_at = datetime('now') WHERE id = ?`).run(id);
  const item = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);
  emit('content.published', { item });
  return item;
}

/* ================================ Copilot agent ================================ */

const COPILOT_TOOLS = [
  { name: 'search_contacts', description: 'Search the CRM for contacts by name/email/phone/tag/city text and filters. Returns up to `limit` contacts with score and stage.', input_schema: { type: 'object', properties: { query: { type: 'string', description: 'Free text to match' }, stage: { type: 'string', enum: STAGE_KEYS }, lead_type: { type: 'string', enum: ['purchase', 'refinance', 'heloc', 'past_client', 'sphere'] }, min_score: { type: 'number' }, tag: { type: 'string' }, limit: { type: 'number', description: 'Max results, default 15' } } } },
  { name: 'get_contact', description: 'Full details for one contact: profile, loan, score reasons, learned facts, open tasks, and the 12 most recent activities.', input_schema: { type: 'object', properties: { contact_id: { type: 'number' } }, required: ['contact_id'] } },
  { name: 'find_opportunities', description: 'Ranked lists: refi (rate 0.75%+ above market), equity (LTV<=60%), hot (high score, not in a loan), dormant (gone quiet), stalled_loans (no stage change 7+ days), unanswered (replied, nobody answered).', input_schema: { type: 'object', properties: { kind: { type: 'string', enum: ['refi', 'equity', 'hot', 'dormant', 'stalled_loans', 'unanswered'] }, limit: { type: 'number' } }, required: ['kind'] } },
  { name: 'get_metrics', description: 'Performance metrics: KPIs, conversion funnel, speed to lead, pipeline forecast, lead sources/ROI, leaderboard, AI and workflow performance.', input_schema: { type: 'object', properties: { days: { type: 'number', description: 'Lookback window in days (default 30)' } } } },
  { name: 'list_tasks', description: 'Open tasks for the current user (or the team for owners/admins), soonest first.', input_schema: { type: 'object', properties: { overdue_only: { type: 'boolean' } } } },
  { name: 'create_task', description: 'Create a task, optionally linked to a contact.', input_schema: { type: 'object', properties: { title: { type: 'string' }, contact_id: { type: 'number' }, due_at: { type: 'string', description: 'ISO datetime, optional' } }, required: ['title'] } },
  { name: 'add_note', description: 'Add a note to a contact timeline.', input_schema: { type: 'object', properties: { contact_id: { type: 'number' }, body: { type: 'string' } }, required: ['contact_id', 'body'] } },
  { name: 'draft_message', description: 'Have the follow-up assistant draft a personalized text or email to a contact. It goes to the approval queue (or sends under autonomous mode rules); never use this to message many people at once.', input_schema: { type: 'object', properties: { contact_id: { type: 'number' }, goal: { type: 'string' }, channel: { type: 'string', enum: ['sms', 'email'] } }, required: ['contact_id', 'goal'] } },
  { name: 'move_stage', description: 'Move a contact to a pipeline stage.', input_schema: { type: 'object', properties: { contact_id: { type: 'number' }, stage: { type: 'string', enum: STAGE_KEYS } }, required: ['contact_id', 'stage'] } },
  { name: 'add_tag', description: 'Add a tag to a contact (tags can trigger workflows).', input_schema: { type: 'object', properties: { contact_id: { type: 'number' }, tag: { type: 'string' } }, required: ['contact_id', 'tag'] } },
  { name: 'list_workflows', description: 'List workflows with their status and triggers.', input_schema: { type: 'object', properties: {} } },
  { name: 'enroll_in_workflow', description: 'Enroll a contact in a workflow.', input_schema: { type: 'object', properties: { contact_id: { type: 'number' }, workflow_id: { type: 'number' } }, required: ['contact_id', 'workflow_id'] } },
];

async function runTool(user, name, input) {
  switch (name) {
    case 'search_contacts': {
      const where = [scopeSql(user)];
      const p = [];
      if (input.query) { where.push(`(c.first_name || ' ' || COALESCE(c.last_name,'') LIKE ? OR c.email LIKE ? OR c.phone_norm LIKE ? OR c.tags LIKE ? OR c.city LIKE ?)`); const l = `%${input.query}%`; p.push(l, l, `%${String(input.query).replace(/\D/g, '') || input.query}%`, l, l); }
      if (input.stage) { where.push('c.stage = ?'); p.push(input.stage); }
      if (input.lead_type) { where.push('c.lead_type = ?'); p.push(input.lead_type); }
      if (input.min_score) { where.push('c.score >= ?'); p.push(Number(input.min_score)); }
      if (input.tag) { where.push(`(',' || c.tags || ',') LIKE ?`); p.push(`%,${input.tag},%`); }
      return db.prepare(`SELECT c.* FROM contacts c WHERE ${where.join(' AND ')} ORDER BY c.score DESC LIMIT ?`).all(...p, Math.min(50, Number(input.limit) || 15)).map(brief);
    }
    case 'get_contact': {
      const c = canSee(user, input.contact_id);
      const s = serializeContact(c);
      return {
        ...brief(c), email: c.email, city: c.city, state: c.state, loan_type: c.loan_type, loan_amount: c.loan_amount, property_value: c.property_value, est_value: c.avm_value, current_rate: c.current_rate, loan_close_date: c.loan_close_date, timeline: c.purchase_timeline, credit: c.credit_band, tags: s.tags, facts: s.facts, score_reasons: s.score_reasons, opted_out_sms: !!c.opted_out_sms, ai_paused: !!c.ai_paused,
        tasks: db.prepare('SELECT id, title, due_at FROM tasks WHERE contact_id = ? AND done = 0').all(c.id),
        recent_activity: db.prepare('SELECT type, direction, subject, substr(body,1,300) body, created_at FROM activities WHERE contact_id = ? ORDER BY id DESC LIMIT 12').all(c.id),
      };
    }
    case 'find_opportunities': return findOpportunities(user, input.kind, Math.min(50, Number(input.limit) || 15));
    case 'get_metrics': {
      const m = performance({ days: Number(input.days) || 30, ownerId: ['owner', 'admin'].includes(user.role) ? null : user.id });
      return { kpi: m.kpi, speed: m.speed, funnel: m.funnel, pipeline: m.pipeline, sources: m.sources.slice(0, 8), leaderboard: m.leaderboard.slice(0, 10), ai: m.ai, workflows: m.workflows.slice(0, 8), campaigns: m.campaigns.slice(0, 8) };
    }
    case 'list_tasks':
      return db.prepare(`SELECT t.id, t.title, t.due_at, t.contact_id, c.first_name, c.last_name FROM tasks t LEFT JOIN contacts c ON c.id = t.contact_id WHERE t.done = 0 AND ${['owner', 'admin'].includes(user.role) ? '1=1' : `t.user_id = ${Number(user.id)}`} ${input.overdue_only ? "AND t.due_at < datetime('now')" : ''} ORDER BY t.due_at IS NULL, t.due_at LIMIT 40`).all();
    case 'create_task': {
      if (input.contact_id) canSee(user, input.contact_id);
      const id = db.prepare('INSERT INTO tasks (contact_id, user_id, title, due_at) VALUES (?, ?, ?, ?)').run(input.contact_id || null, user.id, String(input.title).slice(0, 240), input.due_at || null).lastInsertRowid;
      return { created_task_id: Number(id) };
    }
    case 'add_note': {
      canSee(user, input.contact_id);
      logActivity(Number(input.contact_id), { type: 'note', body: String(input.body), userId: user.id, meta: { via: 'copilot' } });
      return { ok: true };
    }
    case 'draft_message': {
      canSee(user, input.contact_id);
      const id = await proposeOutreach(Number(input.contact_id), `Copilot request: ${input.goal}`, { channel: input.channel || null, force: true });
      if (!id) return { error: 'No reachable channel for this contact (check phone/email and opt-outs)' };
      const d = db.prepare('SELECT channel, subject, body, status FROM ai_drafts WHERE id = ?').get(id);
      return { draft_id: id, ...d, note: getSetting('assistant_mode') === 'autonomous' ? 'Autonomous mode: queued to send within quiet-hour rules' : 'Waiting in the approval queue' };
    }
    case 'move_stage': {
      canSee(user, input.contact_id);
      if (!STAGE_KEYS.includes(input.stage)) throw new Error('Unknown stage');
      changeStage(Number(input.contact_id), input.stage, { userId: user.id, reason: 'copilot' });
      return { ok: true };
    }
    case 'add_tag': {
      const c = canSee(user, input.contact_id);
      updateContact(c.id, { tags: [...new Set([...(c.tags || '').split(','), String(input.tag).trim()].filter(Boolean))].join(',') }, { userId: user.id });
      return { ok: true };
    }
    case 'list_workflows':
      return db.prepare('SELECT id, name, trigger, status FROM workflows ORDER BY id').all();
    case 'enroll_in_workflow': {
      canSee(user, input.contact_id);
      const runId = enroll(Number(input.workflow_id), Number(input.contact_id), { reason: 'copilot', force: true });
      return runId ? { run_id: runId } : { error: 'Not enrolled (already in it, or the workflow does not exist)' };
    }
    default:
      throw new Error(`Unknown tool ${name}`);
  }
}

function copilotSystem(user) {
  const s = getSettings();
  return `You are the CRM Copilot for ${s.company_name}, working for ${user.name} (role: ${user.role}). Today is ${new Date().toISOString().slice(0, 10)}. The 30-year market rate is set to ${s.market_rate_30yr}%.
You can look things up and take actions in the CRM with your tools. Always ground answers in tool results; never invent contacts, numbers, or activity.
When you take an action (task, note, stage change, tag, workflow enrollment, message draft), say exactly what you did. Messages you draft go through the assistant's approval/compliance rules; you can't send bulk messages.
Format answers for a busy loan officer: lead with the answer, then short bullets. When you mention a contact, include their id as [#123] so the UI can link it.
${COMPLIANCE_RULES}`;
}

/** Offline fallback when no API key: answer the most common requests directly. */
function offlineCopilot(user, text) {
  const t = text.toLowerCase();
  const list = (items) => items.map((c) => `- ${c.name} [#${c.id}] · score ${c.score}${c.top_reason ? ` · ${c.top_reason}` : ''}`).join('\n') || '- None right now';
  if (/refi|rate/.test(t)) return `Top refinance opportunities:\n${list(findOpportunities(user, 'refi', 10))}`;
  if (/equity|heloc|cash/.test(t)) return `Biggest equity positions:\n${list(findOpportunities(user, 'equity', 10))}`;
  if (/stall|stuck|pipeline/.test(t)) return `Loans with no movement in 7+ days:\n${list(findOpportunities(user, 'stalled_loans', 10))}`;
  if (/unanswer|reply|replied/.test(t)) return `Contacts waiting on a reply:\n${list(findOpportunities(user, 'unanswered', 10))}`;
  if (/cold|dormant|quiet/.test(t)) return `Contacts going cold:\n${list(findOpportunities(user, 'dormant', 10))}`;
  if (/metric|stat|how am i|performance|numbers|kpi/.test(t)) {
    const m = performance({ days: 30, ownerId: ['owner', 'admin'].includes(user.role) ? null : user.id });
    return `Last 30 days:\n- ${m.kpi.leads} leads, ${m.kpi.contact_rate}% contacted, ${m.kpi.lead_to_app}% to application\n- Speed to lead: ${m.speed.median_minutes ?? 'n/a'} min median, ${m.speed.under_5_min_pct}% under 5 min\n- ${m.kpi.funded} funded ($${Math.round(m.kpi.funded_volume).toLocaleString()})\n- Weighted pipeline: $${Math.round(m.kpi.weighted_pipeline).toLocaleString()}`;
  }
  if (/today|focus|priorit|what should/.test(t)) return `Your next best actions:\n${nextBestActions(user).map((a) => `- ${a.icon} ${a.title} - ${a.detail}`).join('\n') || '- Nothing urgent. Work your call list.'}`;
  return `I'm running in offline mode (no ANTHROPIC_API_KEY), so I can answer these directly:\n- "Top refi opportunities"\n- "Who has the most equity?"\n- "Which loans are stalled?"\n- "Who's waiting on a reply?"\n- "Who's going cold?"\n- "How am I doing this month?"\n- "What should I focus on today?"\nAdd an API key to unlock full conversational Copilot that can also take actions.`;
}

/**
 * One Copilot turn. Threads are stored server-side and appended exactly as the API returned them,
 * so thinking blocks and tool-use history stay valid across turns.
 */
export async function copilotTurn(user, { threadId = null, text }) {
  if (!text?.trim()) throw new Error('Ask the Copilot something');
  let thread = threadId ? db.prepare('SELECT * FROM copilot_threads WHERE id = ? AND user_id = ?').get(Number(threadId), user.id) : null;
  if (!thread) {
    const id = db.prepare('INSERT INTO copilot_threads (user_id, title) VALUES (?, ?)').run(user.id, text.slice(0, 80)).lastInsertRowid;
    thread = db.prepare('SELECT * FROM copilot_threads WHERE id = ?').get(Number(id));
  }
  const messages = json(thread.messages, []);
  messages.push({ role: 'user', content: text.trim() });
  const actions = [];

  if (!aiEnabled()) {
    messages.push({ role: 'assistant', content: [{ type: 'text', text: offlineCopilot(user, text) }] });
  } else {
    for (let i = 0; i < 10; i++) {
      const response = await getClient().beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: copilotSystem(user),
        tools: COPILOT_TOOLS,
        output_config: { effort: 'medium' },
        messages,
      });
      messages.push({ role: 'assistant', content: response.content });
      if (response.stop_reason === 'refusal') {
        actions.push({ tool: 'declined', input: {} });
        break;
      }
      if (response.stop_reason !== 'tool_use') break;
      const results = [];
      for (const block of response.content.filter((b) => b.type === 'tool_use')) {
        try {
          const out = await runTool(user, block.name, block.input || {});
          actions.push({ tool: block.name, input: block.input });
          results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(out).slice(0, 60_000) });
        } catch (err) {
          results.push({ type: 'tool_result', tool_use_id: block.id, content: err.message, is_error: true });
        }
      }
      messages.push({ role: 'user', content: results });
    }
  }
  db.prepare(`UPDATE copilot_threads SET messages = ?, updated_at = datetime('now') WHERE id = ?`).run(JSON.stringify(messages), thread.id);
  return { thread_id: thread.id, messages: renderThread(messages), actions };
}

/** Thread as the UI shows it: user text, assistant text, and tool chips (tool results hidden). */
export function renderThread(messages) {
  const out = [];
  for (const m of messages) {
    if (m.role === 'user') {
      if (typeof m.content === 'string') out.push({ role: 'user', text: m.content });
      continue;
    }
    const text = (m.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    const tools = (m.content || []).filter((b) => b.type === 'tool_use').map((b) => b.name);
    if (text || tools.length) out.push({ role: 'assistant', text, tools });
  }
  return out;
}

export function listThreads(user) {
  return db.prepare('SELECT id, title, updated_at FROM copilot_threads WHERE user_id = ? ORDER BY updated_at DESC LIMIT 30').all(user.id);
}

export function getThread(user, id) {
  const t = db.prepare('SELECT * FROM copilot_threads WHERE id = ? AND user_id = ?').get(Number(id), user.id);
  if (!t) return null;
  return { id: t.id, title: t.title, messages: renderThread(json(t.messages, [])) };
}
