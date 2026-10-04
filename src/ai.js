import Anthropic from '@anthropic-ai/sdk';
import { getSettings, json } from './db.js';
import { fullName, daysSince } from './util.js';

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
let client = null;

export function aiEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

const COMPLIANCE_RULES = `Mortgage compliance rules you must follow in every message:
- Never quote a specific interest rate, APR, monthly payment, closing cost, or loan term. Those are "triggering terms" under Reg Z. Say things like "rates have moved" or "it may be worth running the numbers" instead.
- Never promise approval, guarantee savings, or say someone "qualifies" for anything.
- Never mention or infer race, religion, national origin, sex, familial status, disability, or any other protected characteristic.
- Don't ask for SSNs, account numbers, or other sensitive data over text or email.
- Be honest that you're reaching out on behalf of the loan officer if asked; never claim to be human if sincerely asked.`;

function systemPrompt(settings) {
  return `You are ${settings.assistant_name}, the follow-up assistant for ${settings.loan_officer_name || 'a loan officer'} at ${settings.company_name}, a mortgage lender.
Your job is to keep relationships warm with past clients, sphere, and leads, and to notice when someone is ready to talk to the loan officer.
Voice: ${settings.assistant_voice}
Write like a real person texting or emailing someone they know: short, specific, one clear question, no hype, no emojis unless the contact used them first. SMS must be under 300 characters. Emails should be 3-6 short sentences, signed with the loan officer's first name.
Reference what you actually know about the person. Never invent facts.

${COMPLIANCE_RULES}`;
}

function contactBrief(contact, activities = []) {
  const facts = json(contact.facts, []);
  const reasons = json(contact.score_reasons, []).filter((r) => r.pts > 0).slice(0, 4).map((r) => r.why);
  const lines = [
    `Name: ${fullName(contact)}`,
    `Type: ${contact.lead_type || 'unknown'}; stage: ${contact.stage}; source: ${contact.source || 'unknown'}`,
    contact.city || contact.state ? `Location: ${[contact.city, contact.state].filter(Boolean).join(', ')}` : null,
    contact.loan_type ? `Loan type: ${contact.loan_type}` : null,
    contact.loan_close_date ? `Loan funded: ${contact.loan_close_date}` : null,
    contact.purchase_timeline ? `Purchase timeline: ${contact.purchase_timeline}` : null,
    contact.is_veteran ? 'Veteran' : null,
    contact.first_time_buyer ? 'First-time buyer' : null,
    `Days since last contact: ${Number.isFinite(daysSince(contact.last_contacted_at)) ? Math.round(daysSince(contact.last_contacted_at)) : 'never contacted'}`,
    reasons.length ? `Why now (internal, do not quote numbers): ${reasons.join('; ')}` : null,
    facts.length ? `Things we've learned: ${facts.join('; ')}` : null,
  ].filter(Boolean);
  const convo = activities
    .filter((a) => ['sms', 'email', 'call', 'note'].includes(a.type))
    .slice(0, 12)
    .reverse()
    .map((a) => `[${a.created_at.slice(0, 10)} ${a.type}${a.direction ? ' ' + a.direction : ''}] ${(a.subject ? a.subject + ': ' : '') + (a.body || '').slice(0, 400)}`);
  return `${lines.join('\n')}${convo.length ? `\n\nRecent history (oldest first):\n${convo.join('\n')}` : '\n\nNo prior conversation.'}`;
}

async function structured(prompt, schema, settings, effort = 'medium') {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: systemPrompt(settings),
    output_config: { effort, format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content: prompt }],
  });
  if (response.stop_reason === 'refusal') throw new Error('Claude declined this request');
  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('Empty response from Claude');
  return JSON.parse(text);
}

const OUTREACH_SCHEMA = {
  type: 'object',
  properties: { subject: { type: 'string' }, body: { type: 'string' } },
  required: ['subject', 'body'],
  additionalProperties: false,
};

/** Draft a personalized first-touch or re-engagement message. */
export async function draftOutreach(contact, { reason, channel, activities = [] }) {
  const settings = getSettings();
  if (aiEnabled()) {
    try {
      const out = await structured(
        `Write a ${channel === 'sms' ? 'text message' : 'email'} to this contact.
Reason we're reaching out now: ${reason}

${contactBrief(contact, activities)}

${channel === 'sms' ? 'Return an empty subject.' : 'Include a short, natural subject line (no clickbait).'} Do not include an opt-out line or signature block; those are added automatically.`,
        OUTREACH_SCHEMA,
        settings,
      );
      return { subject: channel === 'sms' ? null : out.subject, body: out.body.trim(), generator: 'claude' };
    } catch (err) {
      console.error('[ai] draftOutreach failed, using template:', err.message);
    }
  }
  return { ...templateOutreach(contact, reason, channel, settings), generator: 'template' };
}

function templateOutreach(contact, reason, channel, settings) {
  const first = contact.first_name || 'there';
  const lo = (settings.loan_officer_name || settings.company_name).split(' ')[0];
  const r = reason.toLowerCase();
  // Lead with the strongest reason this contact might need help now.
  const signals = json(contact.score_reasons, []).filter((x) => x.pts > 0).map((x) => x.why.toLowerCase()).join(' ');
  let body;
  if (r.includes('new lead')) {
    body = contact.lead_type === 'refinance'
      ? `Hi ${first}, this is ${lo} with ${settings.company_name}. Thanks for reaching out about refinancing! What's the main goal - lowering your payment, pulling cash out, or something else?`
      : `Hi ${first}, this is ${lo} with ${settings.company_name}. Thanks for reaching out! Are you already looking at homes, or still getting a feel for what you can afford?`;
  } else if (r.includes('rate') || r.includes('refi') || signals.includes('refi') || signals.includes('above market')) {
    body = `Hi ${first}, ${lo} here. Rates have moved since you got your loan, and it might be worth a quick look at whether a refinance makes sense for you. Want me to run the numbers?`;
  } else if (r.includes('anniversary') || signals.includes('anniversary')) {
    body = `Hi ${first}, ${lo} here - can you believe it's been another year in the house? I like to do a quick annual mortgage check-up for my clients. Want me to see if there's anything worth improving?`;
  } else if (r.includes('equity') || signals.includes('equity') || signals.includes('mip')) {
    body = `Hi ${first}, ${lo} here. Home values have changed a lot, and you may have built up more equity than you realize. Any projects or plans on your list this year?`;
  } else {
    body = `Hi ${first}, ${lo} with ${settings.company_name} checking in. It's been a while! How's everything going - any changes on the home front I can help with?`;
  }
  return { subject: channel === 'sms' ? null : `Checking in, ${first}`, body };
}

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    intent: { type: 'string', enum: ['warm', 'engaged', 'not_now', 'not_interested', 'wrong_person', 'opt_out'] },
    summary: { type: 'string' },
    facts: { type: 'array', items: { type: 'string' } },
    suggested_reply: { type: 'string' },
    timeline: { type: 'string' },
  },
  required: ['intent', 'summary', 'facts', 'suggested_reply', 'timeline'],
  additionalProperties: false,
};

/**
 * Read an inbound reply: learn durable facts, classify intent, and draft the next message.
 * "warm" means hand off to the loan officer now.
 */
export async function analyzeReply(contact, inboundText, activities = []) {
  const settings = getSettings();
  if (aiEnabled()) {
    try {
      return await structured(
        `The contact just replied: """${inboundText}"""

${contactBrief(contact, activities)}

Analyze the reply:
- intent: "warm" if they want to talk, asked about rates/approval/a specific property, gave a near-term timeline, or asked to be called; "engaged" if friendly but not ready; "not_now" if they gave a later timeline; "not_interested"; "wrong_person"; "opt_out" if they asked you to stop in any wording.
- facts: durable personal details worth remembering for future messages (spouse/kids names, job change, move timeline, home projects, life events). Short phrases. Empty if none.
- timeline: their buying/refi timeline in a few words if stated, else "".
- suggested_reply: the next ${channel(contact)} message to keep the conversation going (empty if intent is opt_out, wrong_person, or warm - warm conversations go to the loan officer).
- summary: one sentence for the loan officer.`,
        ANALYSIS_SCHEMA,
        settings,
      );
    } catch (err) {
      console.error('[ai] analyzeReply failed, using heuristics:', err.message);
    }
  }
  return heuristicAnalysis(contact, inboundText, settings);
}

function channel(contact) {
  return contact.phone_norm && !contact.opted_out_sms ? 'text' : 'email';
}

function heuristicAnalysis(contact, text, settings) {
  const t = text.toLowerCase();
  const first = contact.first_name || 'there';
  const lo = (settings.loan_officer_name || settings.company_name).split(' ')[0];
  let intent = 'engaged';
  if (/\b(stop|unsubscribe|remove me|don'?t (text|email|contact))\b/.test(t)) intent = 'opt_out';
  else if (/wrong (number|person)|who is this/.test(t)) intent = 'wrong_person';
  else if (/not interested|no thanks|no thank you|already (refinanced|closed|got)/.test(t)) intent = 'not_interested';
  else if (/call me|give me a call|yes|interested|rate|approv|pre-?qual|how much|offer|found a (house|home)|ready|let'?s talk|sure/.test(t)) intent = 'warm';
  else if (/next year|later|few months|not (right )?now|maybe/.test(t)) intent = 'not_now';
  const timeline = (t.match(/(next (month|year|spring|summer|fall|winter)|\d+\s*(months?|weeks?))/) || [''])[0];
  const facts = [];
  const m = t.match(/my (wife|husband|partner|spouse)(?:,)? (\w+)/);
  if (m) facts.push(`${m[1]}'s name is ${m[2][0].toUpperCase()}${m[2].slice(1)}`);
  if (/new job|got a job|promot/.test(t)) facts.push('Recent job change');
  if (/baby|pregnan/.test(t)) facts.push('Growing family');
  if (timeline) facts.push(`Timeline: ${timeline}`);
  const replies = {
    engaged: `Great to hear from you, ${first}! Anything on your radar this year - moving, remodeling, or just keeping an eye on rates?`,
    not_now: `Totally understand, ${first}. I'll check back in closer to then - and if anything changes, just text me here. - ${lo}`,
    not_interested: `No problem at all, ${first} - thanks for letting me know. I'm here if anything ever changes.`,
  };
  return { intent, summary: `Replied: "${text.slice(0, 120)}"`, facts, suggested_reply: replies[intent] || '', timeline };
}

const CAMPAIGN_SCHEMA = {
  type: 'object',
  properties: { subject: { type: 'string' }, email_body: { type: 'string' }, sms_body: { type: 'string' } },
  required: ['subject', 'email_body', 'sms_body'],
  additionalProperties: false,
};

/** Draft campaign copy in the loan officer's voice, using merge fields. */
export async function generateCampaignCopy({ goal, audience }) {
  const settings = getSettings();
  if (aiEnabled()) {
    try {
      return await structured(
        `Write campaign copy for this goal: ${goal}
Audience: ${audience || 'mixed database of past clients and leads'}
Use merge fields exactly like {{first_name}}, {{lo_name}}, {{company}} where natural. The email should be 4-8 short sentences with one clear call to action (reply, or book a call). The SMS must be under 280 characters with one question. Do not add opt-out text or signatures; those are appended automatically.`,
        CAMPAIGN_SCHEMA,
        settings,
      );
    } catch (err) {
      console.error('[ai] generateCampaignCopy failed, using template:', err.message);
    }
  }
  return {
    subject: `${goal.slice(0, 60)}`,
    email_body: `Hi {{first_name}},\n\nI wanted to reach out personally. ${goal}.\n\nIf it would help, I'm happy to take a quick look at your situation - no pressure and no obligation. Just reply to this email and we'll find a time.\n\nTalk soon,\n{{lo_name}}\n{{company}}`,
    sms_body: `Hi {{first_name}}, {{lo_name}} here. ${goal.slice(0, 140)} - want me to take a quick look for you?`,
  };
}

/** One-paragraph narrative for the monthly report. */
export async function summarizeReport(data) {
  if (!aiEnabled()) return null;
  try {
    const out = await structured(
      `Here is this month's database activity as JSON. Write a short, plain-English briefing (4-6 sentences) for the loan officer: what moved, who went quiet, and where to focus next. No rates, no hype.\n\n${JSON.stringify(data).slice(0, 30000)}`,
      { type: 'object', properties: { briefing: { type: 'string' } }, required: ['briefing'], additionalProperties: false },
      getSettings(),
      'low',
    );
    return out.briefing;
  } catch (err) {
    console.error('[ai] summarizeReport failed:', err.message);
    return null;
  }
}
