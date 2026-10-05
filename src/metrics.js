import { db, getSettings } from './db.js';

const STAGE_RANK = { new: 0, contacted: 1, nurture: 1, prequalified: 2, application: 3, processing: 4, underwriting: 5, clear_to_close: 6, funded: 7, lost: -1 };
const PROBABILITY = { application: 0.5, processing: 0.65, underwriting: 0.75, clear_to_close: 0.92 };

function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const toSql = (d) => d.toISOString().replace('T', ' ').slice(0, 19);

/**
 * Performance metrics for a date range.
 * opts: { days = 30, ownerId = null }  -  ownerId scopes everything to one loan officer.
 */
export function performance({ days = 30, ownerId = null } = {}) {
  const s = getSettings();
  const bps = Number(s.comp_bps) || 0;
  const end = new Date();
  const start = new Date(Date.now() - days * 86_400_000);
  const from = toSql(start);
  const owner = ownerId ? ' AND c.owner_id = ' + Number(ownerId) : '';

  /* Leads + funnel */
  const leads = db.prepare(`SELECT c.id, c.created_at, c.stage, c.source, c.owner_id, c.partner_id, c.loan_amount, c.last_inbound_at FROM contacts c WHERE c.created_at >= ?${owner}`).all(from);
  const leadIds = leads.map((l) => l.id);
  const inList = leadIds.length ? leadIds.join(',') : '0';
  const firstOut = new Map(db.prepare(`SELECT contact_id, MIN(created_at) t FROM activities WHERE contact_id IN (${inList}) AND direction = 'out' AND type IN ('sms','email','call','voicemail') GROUP BY contact_id`).all().map((r) => [r.contact_id, r.t]));
  const engaged = new Set(db.prepare(`SELECT DISTINCT contact_id FROM activities WHERE contact_id IN (${inList}) AND ((direction = 'in' AND type IN ('sms','email','call')) OR (type = 'call' AND json_extract(meta,'$.outcome') IN ('connected','appointment_set')))`).all().map((r) => r.contact_id));
  const maxRank = new Map(db.prepare(`SELECT contact_id, json_extract(meta,'$.to') st FROM activities WHERE contact_id IN (${inList}) AND type = 'stage_change'`).all().reduce((m, r) => {
    m.set(r.contact_id, Math.max(m.get(r.contact_id) ?? 0, STAGE_RANK[r.st] ?? 0));
    return m;
  }, new Map()));
  const reached = (l, rank) => Math.max(maxRank.get(l.id) ?? 0, STAGE_RANK[l.stage] ?? 0) >= rank;
  const funnel = [
    { step: 'Leads', n: leads.length },
    { step: 'Contacted', n: leads.filter((l) => firstOut.has(l.id) || engaged.has(l.id) || reached(l, 1)).length },
    { step: 'Engaged', n: leads.filter((l) => engaged.has(l.id) || reached(l, 2)).length },
    { step: 'Pre-qualified', n: leads.filter((l) => reached(l, 2)).length },
    { step: 'Application', n: leads.filter((l) => reached(l, 3)).length },
    { step: 'Funded', n: leads.filter((l) => reached(l, 7)).length },
  ].map((f, i, arr) => ({ ...f, rate: pct(f.n, arr[0].n), stepRate: i ? pct(f.n, arr[i - 1].n) : 100 }));

  /* Speed to lead */
  const parse = (t) => new Date(`${t.replace(' ', 'T')}Z`).getTime();
  const responseMins = leads.filter((l) => firstOut.has(l.id)).map((l) => Math.max(0, (parse(firstOut.get(l.id)) - parse(l.created_at)) / 60_000));
  const speed = {
    median_minutes: responseMins.length ? Math.round(median(responseMins) * 10) / 10 : null,
    under_5_min_pct: pct(responseMins.filter((m) => m <= 5).length, leads.length),
    never_contacted: leads.length - responseMins.length,
  };

  /* Funded + pipeline */
  const funded = db
    .prepare(`SELECT COUNT(DISTINCT c.id) n, COALESCE(SUM(c.loan_amount),0) volume FROM activities a JOIN contacts c ON c.id = a.contact_id WHERE a.type = 'stage_change' AND json_extract(a.meta,'$.to') = 'funded' AND a.created_at >= ?${owner}`)
    .get(from);
  const pipeRows = db.prepare(`SELECT c.stage, COUNT(*) n, COALESCE(SUM(c.loan_amount),0) volume FROM contacts c WHERE c.stage IN ('application','processing','underwriting','clear_to_close')${owner} GROUP BY c.stage`).all();
  const pipeline = Object.keys(PROBABILITY).map((st) => {
    const r = pipeRows.find((x) => x.stage === st) || { n: 0, volume: 0 };
    return { stage: st, loans: r.n, volume: r.volume, probability: PROBABILITY[st], weighted: Math.round(r.volume * PROBABILITY[st]) };
  });
  const weightedVolume = pipeline.reduce((a, p) => a + p.weighted, 0);

  /* Activity */
  const acts = db
    .prepare(`SELECT a.type, a.direction, COUNT(*) n FROM activities a JOIN contacts c ON c.id = a.contact_id WHERE a.created_at >= ? AND a.type IN ('sms','email','call','voicemail')${owner} GROUP BY a.type, a.direction`)
    .all(from);
  const actCount = (type, dir) => acts.filter((a) => (!type || a.type === type) && (!dir || a.direction === dir)).reduce((x, a) => x + a.n, 0);

  /* Trend: daily buckets (weekly for long ranges) */
  const bucketDays = days > 120 ? 7 : 1;
  const buckets = [];
  for (let t = start.getTime(); t <= end.getTime(); t += bucketDays * 86_400_000) buckets.push(new Date(t).toISOString().slice(0, 10));
  const bucketOf = (iso) => {
    const idx = Math.floor((parse(iso) - start.getTime()) / (bucketDays * 86_400_000));
    return buckets[Math.max(0, Math.min(buckets.length - 1, idx))];
  };
  const trendMap = Object.fromEntries(buckets.map((b) => [b, { date: b, leads: 0, touches: 0, replies: 0 }]));
  for (const l of leads) trendMap[bucketOf(l.created_at)].leads++;
  for (const a of db.prepare(`SELECT a.created_at, a.direction FROM activities a JOIN contacts c ON c.id = a.contact_id WHERE a.created_at >= ? AND a.type IN ('sms','email','call','voicemail')${owner}`).all(from)) {
    trendMap[bucketOf(a.created_at)][a.direction === 'in' ? 'replies' : 'touches']++;
  }
  const trend = Object.values(trendMap);

  /* Lead sources & ROI */
  const months = [];
  for (let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)); d <= end; d.setUTCMonth(d.getUTCMonth() + 1)) months.push(d.toISOString().slice(0, 7));
  const spend = new Map(db.prepare(`SELECT source, SUM(amount) amt FROM lead_source_spend WHERE month IN (${months.map(() => '?').join(',')}) GROUP BY source`).all(...months).map((r) => [r.source, r.amt]));
  const bySource = new Map();
  for (const l of leads) {
    const k = l.source || 'unknown';
    const row = bySource.get(k) || { source: k, leads: 0, contacted: 0, applications: 0, funded: 0, volume: 0 };
    row.leads++;
    if (firstOut.has(l.id)) row.contacted++;
    if (reached(l, 3)) row.applications++;
    if (reached(l, 7)) { row.funded++; row.volume += l.loan_amount || 0; }
    bySource.set(k, row);
  }
  for (const [src] of spend) if (!bySource.has(src)) bySource.set(src, { source: src, leads: 0, contacted: 0, applications: 0, funded: 0, volume: 0 });
  const sources = [...bySource.values()].map((r) => {
    const sp = spend.get(r.source) || 0;
    const revenue = Math.round((r.volume * bps) / 10000);
    return { ...r, spend: sp, revenue, conversion: pct(r.funded, r.leads), cost_per_lead: r.leads && sp ? Math.round(sp / r.leads) : null, cost_per_funded: r.funded && sp ? Math.round(sp / r.funded) : null, roi: sp ? Math.round(((revenue - sp) / sp) * 100) : null };
  }).sort((a, b) => b.leads - a.leads);

  /* Leaderboard */
  const users = db.prepare(`SELECT id, name FROM users WHERE active = 1 ${ownerId ? `AND id = ${Number(ownerId)}` : ''} ORDER BY name`).all();
  const leaderboard = users.map((u) => {
    const a = db.prepare(`SELECT
        SUM(type = 'call' AND direction = 'out') calls, SUM(type = 'sms' AND direction = 'out') texts, SUM(type = 'email' AND direction = 'out') emails,
        SUM(type = 'call' AND json_extract(meta,'$.outcome') = 'appointment_set') appointments
      FROM activities WHERE user_id = ? AND created_at >= ?`).get(u.id, from);
    const mine = leads.filter((l) => l.owner_id === u.id);
    const mins = mine.filter((l) => firstOut.has(l.id)).map((l) => (parse(firstOut.get(l.id)) - parse(l.created_at)) / 60_000);
    const f = db.prepare(`SELECT COUNT(DISTINCT c.id) n, COALESCE(SUM(c.loan_amount),0) v FROM activities x JOIN contacts c ON c.id = x.contact_id WHERE x.type = 'stage_change' AND json_extract(x.meta,'$.to') = 'funded' AND x.created_at >= ? AND c.owner_id = ?`).get(from, u.id);
    const apps = db.prepare(`SELECT COUNT(DISTINCT x.contact_id) n FROM activities x JOIN contacts c ON c.id = x.contact_id WHERE x.type = 'stage_change' AND json_extract(x.meta,'$.to') = 'application' AND x.created_at >= ? AND c.owner_id = ?`).get(from, u.id).n;
    const tasks = db.prepare(`SELECT COUNT(*) n FROM tasks WHERE user_id = ? AND done = 1 AND done_at >= ?`).get(u.id, from).n;
    return { user_id: u.id, name: u.name, leads: mine.length, calls: a.calls || 0, texts: a.texts || 0, emails: a.emails || 0, appointments: a.appointments || 0, tasks_done: tasks, applications: apps, funded: f.n, volume: f.v, revenue: Math.round((f.v * bps) / 10000), speed_median_min: mins.length ? Math.round(median(mins)) : null };
  }).sort((x, y) => y.volume - x.volume || y.applications - x.applications || y.calls - x.calls);

  /* AI */
  const aiOwner = ownerId ? ` AND c.owner_id = ${Number(ownerId)}` : '';
  const ai = db.prepare(`SELECT COUNT(*) drafted, SUM(d.status IN ('approved','sent')) approved, SUM(d.status = 'rejected') rejected FROM ai_drafts d JOIN contacts c ON c.id = d.contact_id WHERE d.created_at >= ?${aiOwner}`).get(from);
  const aiSent = db.prepare(`SELECT o.contact_id, o.sent_at FROM outbox o JOIN contacts c ON c.id = o.contact_id WHERE o.source = 'ai' AND o.status = 'sent' AND o.sent_at >= ?${aiOwner}`).all(from);
  const aiReplied = aiSent.filter((o) => db.prepare(`SELECT 1 FROM activities WHERE contact_id = ? AND direction = 'in' AND type IN ('sms','email') AND created_at > ? AND created_at <= datetime(?, '+3 days')`).get(o.contact_id, o.sent_at, o.sent_at)).length;
  const handoffs = db.prepare(`SELECT COUNT(*) n FROM tasks t JOIN contacts c ON c.id = t.contact_id WHERE t.kind = 'handoff' AND t.created_at >= ?${aiOwner}`).get(from).n;

  /* Workflows / campaigns / partners */
  const workflows = db.prepare(`SELECT w.id, w.name, w.status, COUNT(r.id) enrolled, SUM(r.status = 'active') active, SUM(r.status = 'completed') completed,
      SUM(r.exit_reason = 'contact replied') replied, SUM(r.exit_reason LIKE 'reached goal%') goals
    FROM workflows w LEFT JOIN workflow_runs r ON r.workflow_id = w.id AND r.started_at >= ? GROUP BY w.id ORDER BY enrolled DESC`).all(from)
    .map((w) => ({ ...w, reply_rate: pct(w.replied || 0, w.enrolled), goal_rate: pct(w.goals || 0, w.enrolled) }));
  const campaigns = db.prepare(`SELECT cp.id, cp.name, COUNT(s.id) sent, SUM(s.opened_at IS NOT NULL) opened, SUM(s.clicked_at IS NOT NULL) clicked, SUM(s.replied_at IS NOT NULL) replied, SUM(s.converted_at IS NOT NULL) converted
    FROM campaigns cp JOIN campaign_sends s ON s.campaign_id = cp.id AND s.sent_at >= ? GROUP BY cp.id ORDER BY sent DESC`).all(from)
    .map((c) => ({ ...c, open_rate: pct(c.opened, c.sent), reply_rate: pct(c.replied, c.sent) }));
  const partners = db.prepare(`SELECT p.id, p.name, p.company, COUNT(c.id) referrals, SUM(c.stage IN ('application','processing','underwriting','clear_to_close')) in_process, SUM(c.stage = 'funded') funded, COALESCE(SUM(CASE WHEN c.stage = 'funded' THEN c.loan_amount END),0) volume
    FROM partners p LEFT JOIN contacts c ON c.partner_id = p.id AND c.created_at >= ?${owner} GROUP BY p.id ORDER BY referrals DESC`).all(from);

  return {
    range: { days, from: start.toISOString(), to: end.toISOString(), owner_id: ownerId },
    kpi: {
      leads: leads.length,
      contact_rate: pct(funnel[1].n, leads.length),
      engagement_rate: pct(funnel[2].n, leads.length),
      lead_to_app: pct(funnel[4].n, leads.length),
      funded: funded.n,
      funded_volume: funded.volume,
      revenue: Math.round((funded.volume * bps) / 10000),
      pipeline_volume: pipeline.reduce((a, p) => a + p.volume, 0),
      weighted_pipeline: weightedVolume,
      projected_revenue: Math.round((weightedVolume * bps) / 10000),
      outbound: actCount(null, 'out'),
      replies: actCount(null, 'in'),
    },
    speed,
    funnel,
    pipeline,
    trend,
    trend_bucket_days: bucketDays,
    activity: { calls: actCount('call', 'out'), texts: actCount('sms', 'out'), emails: actCount('email', 'out'), voicemails: actCount('voicemail', 'out'), inbound: actCount(null, 'in') },
    sources,
    leaderboard,
    ai: { drafted: ai.drafted || 0, approved: ai.approved || 0, rejected: ai.rejected || 0, approval_rate: pct(ai.approved || 0, (ai.approved || 0) + (ai.rejected || 0)), sent: aiSent.length, replies: aiReplied, reply_rate: pct(aiReplied, aiSent.length), handoffs },
    workflows,
    campaigns,
    partners,
    comp_bps: bps,
  };
}
