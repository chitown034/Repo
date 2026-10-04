import { db, getSettings, STAGES } from './db.js';
import { summarizeReport } from './ai.js';
import { fullName } from './util.js';

function periodBounds(period) {
  const [y, m] = period.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  const f = (d) => d.toISOString().replace('T', ' ').slice(0, 19);
  return [f(start), f(end)];
}

export function previousPeriod(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
  return d.toISOString().slice(0, 7);
}

/** Monthly Intelligence Report: who moved up, who went quiet, pipeline flow, campaign results, where to focus. */
export async function buildMonthlyReport(period) {
  const [start, end] = periodBounds(period);
  const settings = getSettings();

  const newContacts = db.prepare('SELECT COUNT(*) n FROM contacts WHERE created_at >= ? AND created_at < ?').get(start, end).n;
  const bySource = db.prepare(`SELECT COALESCE(source,'unknown') source, COUNT(*) n FROM contacts WHERE created_at >= ? AND created_at < ? GROUP BY 1 ORDER BY 2 DESC`).all(start, end);

  // Score movement: first vs last score in the period.
  const movers = db
    .prepare(
      `WITH b AS (
         SELECT contact_id,
           (SELECT score FROM score_history h2 WHERE h2.contact_id = h.contact_id AND h2.created_at < ? ORDER BY created_at DESC LIMIT 1) AS start_score,
           (SELECT score FROM score_history h3 WHERE h3.contact_id = h.contact_id AND h3.created_at < ? ORDER BY created_at DESC LIMIT 1) AS end_score
         FROM score_history h WHERE created_at >= ? AND created_at < ? GROUP BY contact_id)
       SELECT b.contact_id id, COALESCE(b.start_score, 0) start_score, b.end_score, b.end_score - COALESCE(b.start_score, 0) delta, c.first_name, c.last_name, c.score_reasons
       FROM b JOIN contacts c ON c.id = b.contact_id`,
    )
    .all(start, end, start, end);
  const movedUp = movers.filter((m) => m.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 10)
    .map((m) => ({ id: m.id, name: fullName(m), from: m.start_score, to: m.end_score, why: JSON.parse(m.score_reasons || '[]')[0]?.why || '' }));
  const movedDown = movers.filter((m) => m.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 5)
    .map((m) => ({ id: m.id, name: fullName(m), from: m.start_score, to: m.end_score }));

  const wentQuiet = db
    .prepare(
      `SELECT id, first_name, last_name, score, last_inbound_at FROM contacts
       WHERE last_inbound_at IS NOT NULL AND last_inbound_at < datetime(?, '-30 days') AND last_inbound_at >= datetime(?, '-90 days')
       AND stage NOT IN ('funded','lost') ORDER BY score DESC LIMIT 10`,
    )
    .all(end, end)
    .map((c) => ({ id: c.id, name: fullName(c), score: c.score, last_reply: c.last_inbound_at }));

  const stageMoves = db
    .prepare(`SELECT json_extract(meta,'$.to') stage, COUNT(*) n FROM activities WHERE type = 'stage_change' AND created_at >= ? AND created_at < ? GROUP BY 1`)
    .all(start, end);
  const stageFlow = STAGES.map((s) => ({ stage: s.label, entered: stageMoves.find((m) => m.stage === s.key)?.n || 0 }));
  const funded = db
    .prepare(`SELECT COUNT(*) n, COALESCE(SUM(c.loan_amount),0) volume FROM activities a JOIN contacts c ON c.id = a.contact_id WHERE a.type = 'stage_change' AND json_extract(a.meta,'$.to') = 'funded' AND a.created_at >= ? AND a.created_at < ?`)
    .get(start, end);

  const touches = db
    .prepare(`SELECT type, direction, COUNT(*) n FROM activities WHERE type IN ('sms','email','call') AND created_at >= ? AND created_at < ? GROUP BY 1,2`)
    .all(start, end);
  const ai = db
    .prepare(`SELECT COUNT(*) drafted, SUM(status IN ('approved','sent')) approved FROM ai_drafts WHERE created_at >= ? AND created_at < ?`)
    .get(start, end);
  const handoffs = db.prepare(`SELECT COUNT(*) n FROM tasks WHERE kind = 'handoff' AND created_at >= ? AND created_at < ?`).get(start, end).n;

  const campaigns = db
    .prepare(
      `SELECT cp.id, cp.name, COUNT(s.id) sent, SUM(s.opened_at IS NOT NULL) opened, SUM(s.clicked_at IS NOT NULL) clicked,
              SUM(s.replied_at IS NOT NULL) replied, SUM(s.converted_at IS NOT NULL) converted
       FROM campaign_sends s JOIN campaigns cp ON cp.id = s.campaign_id
       WHERE s.sent_at >= ? AND s.sent_at < ? GROUP BY cp.id ORDER BY sent DESC`,
    )
    .all(start, end);

  const focus = db
    .prepare(`SELECT id, first_name, last_name, score, score_reasons FROM contacts WHERE dnc = 0 AND stage NOT IN ('lost','application','processing','underwriting','clear_to_close') ORDER BY score DESC LIMIT 10`)
    .all()
    .map((c) => ({ id: c.id, name: fullName(c), score: c.score, why: JSON.parse(c.score_reasons || '[]')[0]?.why || '' }));

  const rateOpportunities = db
    .prepare(`SELECT COUNT(*) n FROM contacts WHERE dnc = 0 AND current_rate IS NOT NULL AND current_rate - ? >= 0.75`)
    .get(Number(settings.market_rate_30yr)).n;

  const data = {
    period,
    generated_at: new Date().toISOString(),
    totals: {
      contacts: db.prepare('SELECT COUNT(*) n FROM contacts').get().n,
      new_contacts: newContacts,
      funded_loans: funded.n,
      funded_volume: funded.volume,
      ai_drafted: ai.drafted || 0,
      ai_approved: ai.approved || 0,
      handoffs,
      rate_opportunities: rateOpportunities,
    },
    by_source: bySource,
    moved_up: movedUp,
    moved_down: movedDown,
    went_quiet: wentQuiet,
    stage_flow: stageFlow,
    touches,
    campaigns,
    focus_next: focus,
  };
  data.briefing = await summarizeReport(data);
  db.prepare('INSERT INTO reports (period, data) VALUES (?, ?) ON CONFLICT(period) DO UPDATE SET data = excluded.data, created_at = datetime(\'now\')').run(period, JSON.stringify(data));
  return data;
}
