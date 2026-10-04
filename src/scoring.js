import { db, getSettings } from './db.js';
import { daysSince } from './util.js';
import { emit } from './events.js';

/**
 * Ready Score (0-100): how likely this contact is to need a mortgage *now*.
 * Blends refinance opportunity (rate gap, equity, loan age), purchase readiness
 * (timeline, pre-approval, credit) and engagement (recent replies, opens, clicks).
 * Every point comes with a human-readable reason so the score is never a black box.
 */
export function computeScore(contact, settings, engagement = {}) {
  const reasons = [];
  let score = 0;
  const add = (pts, why) => {
    if (pts > 0) {
      score += pts;
      reasons.push({ pts, why });
    }
  };

  if (contact.dnc || (contact.opted_out_sms && contact.opted_out_email)) {
    return { score: 0, reasons: [{ pts: 0, why: 'Opted out / do-not-contact' }] };
  }
  if (contact.stage === 'lost') {
    // Lost leads can still come back, but start them low.
    reasons.push({ pts: 0, why: 'Marked lost - scored on engagement only' });
  }

  const market = Number(settings.market_rate_30yr) || 0;
  const hasLoan = contact.current_rate && contact.loan_amount;
  const isOwner = contact.lead_type === 'past_client' || contact.lead_type === 'refinance' || contact.lead_type === 'heloc' || hasLoan;

  if (isOwner && contact.stage !== 'lost') {
    // Refinance math: a 0.75%+ rate gap usually pencils out after costs.
    if (contact.current_rate && market) {
      const gap = contact.current_rate - market;
      if (gap >= 1.25) add(32, `Rate ${contact.current_rate}% is ${gap.toFixed(2)}% above market - strong refi candidate`);
      else if (gap >= 0.75) add(24, `Rate ${contact.current_rate}% is ${gap.toFixed(2)}% above market - refi likely pencils`);
      else if (gap >= 0.5) add(12, `Rate is ${gap.toFixed(2)}% above market - watch for further drops`);
    }

    // Equity: cash-out, HELOC, or dropping mortgage insurance.
    if (contact.property_value && contact.loan_amount) {
      const ltv = contact.loan_amount / contact.property_value;
      const equity = contact.property_value - contact.loan_amount;
      if (ltv <= 0.6) add(12, `~${Math.round((1 - ltv) * 100)}% equity ($${Math.round(equity / 1000)}k) - cash-out / HELOC candidate`);
      else if (ltv <= 0.8) add(7, `LTV ${Math.round(ltv * 100)}% - enough equity to restructure`);
      if (/fha/i.test(contact.loan_type || '') && ltv <= 0.8) add(10, 'FHA loan under 80% LTV - can refi out of MIP');
    }

    // Loan age: seasoning, anniversaries, and the typical 5-7 year move-up window.
    if (contact.loan_close_date) {
      const ageDays = daysSince(contact.loan_close_date);
      const years = ageDays / 365.25;
      const toAnniversary = 365.25 - (ageDays % 365.25);
      if (ageDays >= 180 && (toAnniversary <= 30 || toAnniversary >= 358)) add(6, `Loan anniversary in ${Math.round(toAnniversary)} days - natural check-in`);
      if (years >= 4 && years <= 8) add(8, `Loan is ${years.toFixed(1)} years old - typical move-up window`);
      if (ageDays < 180) reasons.push({ pts: 0, why: 'Loan funded < 6 months ago - not yet seasoned for refi' });
    }
  }

  if (!isOwner || contact.lead_type === 'purchase') {
    const t = String(contact.purchase_timeline || '').toLowerCase();
    if (/(asap|now|0-3|immediate|30|60|90|1-3)/.test(t)) add(26, `Buying soon (${contact.purchase_timeline})`);
    else if (/(3-6|4-6|6 ?mo)/.test(t)) add(15, `Buying in ${contact.purchase_timeline}`);
    else if (/(6-12|12|year)/.test(t)) add(6, `Buying in ${contact.purchase_timeline}`);
    if (contact.preapproved) add(8, 'Already pre-approved (shopping or needs a better lender)');
    const credit = String(contact.credit_band || '').toLowerCase();
    if (/excellent|740|760|780|800/.test(credit)) add(8, 'Excellent credit');
    else if (/good|700|720/.test(credit)) add(5, 'Good credit');
    else if (/fair|640|660|680/.test(credit)) add(2, 'Fair credit');
    if (contact.is_veteran) add(4, 'Veteran - VA eligible');
    if (contact.first_time_buyer) add(2, 'First-time buyer - program eligible');
  }

  // Engagement signals - the strongest indicator of timing.
  const inbound = daysSince(contact.last_inbound_at);
  if (inbound <= 7) add(18, 'Replied in the last 7 days');
  else if (inbound <= 30) add(9, 'Replied in the last 30 days');
  const engagementPts = Math.min(10, (engagement.opens || 0) * 2 + (engagement.clicks || 0) * 4);
  if (engagementPts) add(engagementPts, `Opened/clicked ${engagement.opens || 0}/${engagement.clicks || 0} campaign messages in 30 days`);
  if (engagement.formSubmitDays !== undefined && engagement.formSubmitDays <= 14) add(12, 'Submitted a landing page form recently');

  if (contact.stage === 'new' && daysSince(contact.created_at) <= 2) add(10, 'Brand new lead - speed to lead matters');
  if (contact.stage === 'prequalified') add(6, 'Pre-qualified - ready to move to application');

  // Dormancy is not a penalty; it's surfaced so the assistant re-engages.
  const quietDays = daysSince(contact.last_contacted_at || contact.created_at);
  if (quietDays >= Number(settings.dormant_days || 90) && Number.isFinite(quietDays)) {
    reasons.push({ pts: 0, why: `No contact in ${Math.round(quietDays)} days - going cold` });
  }

  if (contact.dnc) score = 0;
  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons: reasons.sort((a, b) => b.pts - a.pts) };
}

function engagementFor(contactId) {
  const e = db
    .prepare(
      `SELECT
         SUM(CASE WHEN opened_at  >= datetime('now','-30 days') THEN 1 ELSE 0 END) AS opens,
         SUM(CASE WHEN clicked_at >= datetime('now','-30 days') THEN 1 ELSE 0 END) AS clicks
       FROM campaign_sends WHERE contact_id = ?`,
    )
    .get(contactId);
  const form = db
    .prepare(`SELECT julianday('now') - julianday(MAX(created_at)) AS d FROM activities WHERE contact_id = ? AND type = 'form'`)
    .get(contactId);
  return { opens: e?.opens || 0, clicks: e?.clicks || 0, formSubmitDays: form?.d ?? undefined };
}

/** Rescore one contact; logs a score_change activity when it moves 5+ points. Returns { before, after }. */
export function rescoreContact(contactId, { settings = getSettings(), log = true } = {}) {
  const c = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId);
  if (!c) return null;
  const { score, reasons } = computeScore(c, settings, engagementFor(contactId));
  db.prepare(`UPDATE contacts SET score_prev = score, score = ?, score_reasons = ?, score_updated_at = datetime('now') WHERE id = ?`).run(
    score,
    JSON.stringify(reasons),
    contactId,
  );
  if (score !== c.score) {
    db.prepare('INSERT INTO score_history (contact_id, score) VALUES (?, ?)').run(contactId, score);
    emit('score.changed', { contact: { ...c, score, score_prev: c.score }, before: c.score, after: score });
    if (log && Math.abs(score - c.score) >= 5) {
      db.prepare(`INSERT INTO activities (contact_id, type, body, meta) VALUES (?, 'score_change', ?, ?)`).run(
        contactId,
        `Ready Score ${c.score} → ${score}`,
        JSON.stringify({ from: c.score, to: score, top: reasons[0]?.why }),
      );
    }
  }
  return { before: c.score, after: score };
}

export function rescoreAll() {
  const settings = getSettings();
  const ids = db.prepare('SELECT id FROM contacts').all();
  let moved = 0;
  db.exec('BEGIN');
  try {
    for (const { id } of ids) {
      const r = rescoreContact(id, { settings });
      if (r && r.before !== r.after) moved++;
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return { scored: ids.length, moved };
}
