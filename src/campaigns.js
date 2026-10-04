import { db, getSettings, json } from './db.js';
import { enqueue } from './messaging.js';
import { render, token, fullName } from './util.js';
import { logActivity } from './contacts.js';

export const TRIGGERS = {
  manual: 'Send once, now (manual)',
  new_lead: 'When a new lead is created',
  stage_entered: 'When a contact enters a stage',
  score_crossed: 'When Ready Score crosses a threshold',
  replied: 'When a contact replies',
  rate_drop: 'When market rate drops below a contact’s rate by X%',
  dormant: 'When a contact goes quiet for N days',
  loan_anniversary: 'On the anniversary of a funded loan',
  form_submitted: 'When a landing page form is submitted',
};

/**
 * Build a SQL filter from audience criteria. Every filter is optional.
 * { stages:[], lead_types:[], loan_types:[], min_score, max_score, tags:[], owner_id, dormant_days, min_rate_gap, sources:[] }
 */
export function audienceWhere(aud = {}, settings = getSettings()) {
  const where = ['c.dnc = 0'];
  const params = [];
  const list = (field, values) => {
    if (Array.isArray(values) && values.length) {
      where.push(`c.${field} IN (${values.map(() => '?').join(',')})`);
      params.push(...values);
    }
  };
  list('stage', aud.stages);
  list('lead_type', aud.lead_types);
  list('loan_type', aud.loan_types);
  list('source', aud.sources);
  if (aud.min_score != null && aud.min_score !== '') { where.push('c.score >= ?'); params.push(Number(aud.min_score)); }
  if (aud.max_score != null && aud.max_score !== '') { where.push('c.score <= ?'); params.push(Number(aud.max_score)); }
  if (aud.owner_id) { where.push('c.owner_id = ?'); params.push(Number(aud.owner_id)); }
  if (Array.isArray(aud.tags) && aud.tags.length) {
    where.push(`(${aud.tags.map(() => `(',' || c.tags || ',') LIKE ?`).join(' OR ')})`);
    params.push(...aud.tags.map((t) => `%,${t.trim()},%`));
  }
  if (aud.dormant_days) { where.push(`COALESCE(c.last_contacted_at, c.created_at) <= datetime('now', ?)`); params.push(`-${Number(aud.dormant_days)} days`); }
  if (aud.min_rate_gap) { where.push('c.current_rate IS NOT NULL AND c.current_rate - ? >= ?'); params.push(Number(settings.market_rate_30yr), Number(aud.min_rate_gap)); }
  return { sql: where.join(' AND '), params };
}

export function previewAudience(aud, user = null) {
  const { sql, params } = audienceWhere(aud);
  const scope = user && user.role === 'member' ? ' AND c.owner_id = ' + Number(user.id) : '';
  const count = db.prepare(`SELECT COUNT(*) n FROM contacts c WHERE ${sql}${scope}`).get(...params).n;
  const sample = db.prepare(`SELECT c.id, c.first_name, c.last_name, c.score, c.stage FROM contacts c WHERE ${sql}${scope} ORDER BY c.score DESC LIMIT 8`).all(...params);
  return { count, sample };
}

function mergeVars(contact, settings) {
  const owner = contact.owner_id ? db.prepare('SELECT name FROM users WHERE id = ?').get(contact.owner_id) : null;
  return {
    first_name: contact.first_name || 'there',
    last_name: contact.last_name || '',
    full_name: fullName(contact),
    city: contact.city || 'your area',
    lo_name: owner?.name || settings.loan_officer_name || settings.company_name,
    company: settings.company_name,
    phone: settings.business_phone || '',
  };
}

/** Queue a campaign for one contact (once per campaign per contact). */
export function enrollContact(campaign, contact, settings = getSettings()) {
  const already = db.prepare('SELECT id FROM campaign_sends WHERE campaign_id = ? AND contact_id = ?').get(campaign.id, contact.id);
  if (already || contact.dnc) return 0;
  const vars = mergeVars(contact, settings);
  const channels = campaign.channel === 'both' ? ['email', 'sms'] : [campaign.channel];
  let queued = 0;
  for (const ch of channels) {
    if (ch === 'sms' && (!contact.phone_norm || contact.opted_out_sms)) continue;
    if (ch === 'email' && (!contact.email_norm || contact.opted_out_email)) continue;
    const t = token(12);
    const r = db.prepare('INSERT INTO campaign_sends (campaign_id, contact_id, channel, token) VALUES (?, ?, ?, ?)').run(campaign.id, contact.id, ch, t);
    enqueue(contact.id, {
      channel: ch,
      subject: ch === 'email' ? render(campaign.subject, vars) : null,
      body: render(ch === 'email' ? campaign.email_body : campaign.sms_body, vars),
      source: 'campaign',
      refId: Number(r.lastInsertRowid),
    });
    queued++;
  }
  if (queued) logActivity(contact.id, { type: 'campaign', body: `Enrolled in campaign "${campaign.name}"`, meta: { campaignId: campaign.id } });
  return queued;
}

export function launchCampaign(campaignId) {
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  const settings = getSettings();
  const { sql, params } = audienceWhere(json(campaign.audience, {}), settings);
  const contacts = db.prepare(`SELECT c.* FROM contacts c WHERE ${sql}`).all(...params);
  let queued = 0;
  db.exec('BEGIN');
  try {
    for (const c of contacts) queued += enrollContact(campaign, c, settings);
    db.prepare(`UPDATE campaigns SET status = ?, last_run_at = datetime('now') WHERE id = ?`).run(campaign.trigger === 'manual' ? 'sent' : 'active', campaignId);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return { audience: contacts.length, queued };
}

/** Fire every active campaign with this trigger whose config and audience match the contact. */
export function fireTrigger(trigger, contact, ctx = {}) {
  const campaigns = db.prepare(`SELECT * FROM campaigns WHERE status = 'active' AND trigger = ?`).all(trigger);
  const settings = getSettings();
  let fired = 0;
  for (const camp of campaigns) {
    const cfg = json(camp.trigger_config, {});
    if (trigger === 'stage_entered' && cfg.stage && cfg.stage !== ctx.to) continue;
    if (trigger === 'score_crossed' && !(ctx.before < Number(cfg.threshold || 70) && ctx.after >= Number(cfg.threshold || 70))) continue;
    if (trigger === 'form_submitted' && cfg.landing_page_id && Number(cfg.landing_page_id) !== Number(ctx.landingPageId)) continue;
    const { sql, params } = audienceWhere(json(camp.audience, {}), settings);
    const match = db.prepare(`SELECT c.* FROM contacts c WHERE c.id = ? AND ${sql}`).get(contact.id, ...params);
    if (match) fired += enrollContact(camp, match, settings);
  }
  return fired;
}

/** Time-based triggers checked by the scheduler: dormancy, anniversaries, rate drops. */
export function runScheduledTriggers() {
  const settings = getSettings();
  let fired = 0;
  for (const camp of db.prepare(`SELECT * FROM campaigns WHERE status = 'active' AND trigger IN ('dormant','loan_anniversary','rate_drop')`).all()) {
    const cfg = json(camp.trigger_config, {});
    const { sql, params } = audienceWhere(json(camp.audience, {}), settings);
    let extra = '';
    const extraParams = [];
    if (camp.trigger === 'dormant') {
      extra = `AND COALESCE(c.last_contacted_at, c.created_at) <= datetime('now', ?)`;
      extraParams.push(`-${Number(cfg.days || settings.dormant_days || 90)} days`);
    } else if (camp.trigger === 'loan_anniversary') {
      extra = `AND c.loan_close_date IS NOT NULL AND strftime('%m-%d', c.loan_close_date) = strftime('%m-%d','now') AND c.loan_close_date <= date('now','-300 days')`;
    } else if (camp.trigger === 'rate_drop') {
      extra = 'AND c.current_rate IS NOT NULL AND c.current_rate - ? >= ?';
      extraParams.push(Number(settings.market_rate_30yr), Number(cfg.gap || 0.75));
    }
    // Recurring triggers (anniversary) may re-enroll yearly; others enroll once.
    const contacts = db.prepare(`SELECT c.* FROM contacts c WHERE ${sql} ${extra}`).all(...params, ...extraParams);
    for (const c of contacts) {
      if (camp.trigger === 'loan_anniversary') {
        const last = db.prepare(`SELECT id FROM campaign_sends WHERE campaign_id = ? AND contact_id = ? AND created_at >= datetime('now','-300 days')`).get(camp.id, c.id);
        if (last) continue;
        db.prepare('DELETE FROM campaign_sends WHERE campaign_id = ? AND contact_id = ?').run(camp.id, c.id);
      }
      fired += enrollContact(camp, c, settings);
    }
    db.prepare(`UPDATE campaigns SET last_run_at = datetime('now') WHERE id = ?`).run(camp.id);
  }
  return fired;
}

/** Attribution: a reply within 7 days of a send counts as a reply; application within 30 days counts as a conversion. */
export function attributeReply(contactId) {
  db.prepare(`UPDATE campaign_sends SET replied_at = datetime('now') WHERE contact_id = ? AND replied_at IS NULL AND sent_at >= datetime('now','-7 days')`).run(contactId);
}
export function attributeConversion(contactId) {
  db.prepare(`UPDATE campaign_sends SET converted_at = datetime('now') WHERE contact_id = ? AND converted_at IS NULL AND sent_at >= datetime('now','-30 days')`).run(contactId);
}

export function campaignStats(campaignId) {
  return db
    .prepare(
      `SELECT COUNT(*) total,
        SUM(status = 'sent') sent, SUM(status IN ('failed','blocked')) failed,
        SUM(opened_at IS NOT NULL) opened, SUM(clicked_at IS NOT NULL) clicked,
        SUM(replied_at IS NOT NULL) replied, SUM(converted_at IS NOT NULL) converted
       FROM campaign_sends WHERE campaign_id = ?`,
    )
    .get(campaignId);
}
