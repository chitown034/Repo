import { views, renderSync } from './views.js';
import { state, esc, api, toast, act, modal, formData, stageLabel, scoreChip, name, money, isAdmin, when, stageOptions, userOptions, refreshMeta } from './app.js';

const pctFmt = (v) => (v == null ? '-' : `${v}%`);
const numFmt = (v) => (v == null ? '-' : Number(v).toLocaleString());
const linkIds = (text) => esc(text).replace(/\[#(\d+)\]/g, '<a href="#/contacts/$1">#$1</a>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

/* ================================== Charts ================================== */

/** Multi-series line chart with legend, direct end labels, crosshair tooltip, and a table toggle. */
function lineChart(el, rows, series, { height = 220, dateKey = 'date' } = {}) {
  const W = 640, H = height, L = 36, R = 70, T = 10, B = 26;
  const max = Math.max(1, ...rows.flatMap((r) => series.map((s) => r[s.key] || 0)));
  const nice = Math.ceil(max / 4) * 4 || 4;
  const x = (i) => L + (rows.length <= 1 ? 0 : (i * (W - L - R)) / (rows.length - 1));
  const y = (v) => T + (H - T - B) * (1 - v / nice);
  const grid = [0, 1, 2, 3, 4].map((g) => { const v = (nice / 4) * g; return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--grid)"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="var(--axis)">${v}</text>`; }).join('');
  const lbl = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const xl = [0, Math.floor((rows.length - 1) / 2), rows.length - 1].filter((v, i, a) => a.indexOf(v) === i && rows[v]).map((i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" font-size="10" fill="var(--axis)">${lbl(rows[i][dateKey])}</text>`).join('');
  const paths = series.map((s) => `<path d="${rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r[s.key] || 0).toFixed(1)}`).join(' ')}" fill="none" stroke="var(${s.color})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
  // Direct labels at the line ends, nudged apart so they never collide.
  const ends = series.map((s) => ({ s, yy: y(rows.at(-1)?.[s.key] || 0) })).sort((a, b) => a.yy - b.yy);
  for (let i = 1; i < ends.length; i++) if (ends[i].yy - ends[i - 1].yy < 12) ends[i].yy = ends[i - 1].yy + 12;
  // Keep the stack above the x-axis labels.
  const floor = H - B - 4;
  for (let i = ends.length - 1; i >= 0; i--) ends[i].yy = Math.min(ends[i].yy, floor - (ends.length - 1 - i) * 12);
  const endLabels = ends.map(({ s, yy }) => `<text x="${W - R + 6}" y="${yy + 4}" font-size="11" fill="var(--ink-2)">${esc(s.label)}</text>`).join('');
  const id = `t${Math.random().toString(36).slice(2, 8)}`;
  el.innerHTML = `<div class="viz"><div class="legend">${series.map((s) => `<span><i style="background:var(${s.color})"></i>${esc(s.label)}</span>`).join('')}<span class="spacer"></span><button class="sm ghost" data-tbl>Table view</button></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map((s) => s.label).join(', '))} over time">${grid}${xl}${paths}${endLabels}
      <line id="${id}-x" y1="${T}" y2="${H - B}" stroke="var(--axis)" stroke-dasharray="3 3" visibility="hidden"/>
      ${series.map((s, k) => `<circle id="${id}-d${k}" r="4" fill="var(${s.color})" stroke="var(--panel)" stroke-width="2" visibility="hidden"/>`).join('')}
      <rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent" id="${id}-hit"/></svg>
    <div class="tip" id="${id}-tip"></div>
    <div class="table-wrap" hidden data-table><table><thead><tr><th>Date</th>${series.map((s) => `<th class="num">${esc(s.label)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr><td>${lbl(r[dateKey])}</td>${series.map((s) => `<td class="num">${r[s.key] || 0}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  const svg = el.querySelector('svg');
  const tip = el.querySelector(`#${id}-tip`);
  const hit = el.querySelector(`#${id}-hit`);
  const move = (evt) => {
    const box = svg.getBoundingClientRect();
    const px = ((evt.clientX - box.left) / box.width) * W;
    const i = Math.max(0, Math.min(rows.length - 1, Math.round(((px - L) / (W - L - R)) * (rows.length - 1))));
    const line = el.querySelector(`#${id}-x`);
    line.setAttribute('x1', x(i)); line.setAttribute('x2', x(i)); line.setAttribute('visibility', 'visible');
    series.forEach((s, k) => { const d = el.querySelector(`#${id}-d${k}`); d.setAttribute('cx', x(i)); d.setAttribute('cy', y(rows[i][s.key] || 0)); d.setAttribute('visibility', 'visible'); });
    tip.innerHTML = `<strong>${lbl(rows[i][dateKey])}</strong>${series.map((s) => `<div><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(${s.color});margin-right:5px"></i>${esc(s.label)}: <strong>${rows[i][s.key] || 0}</strong></div>`).join('')}`;
    tip.style.display = 'block';
    const left = (x(i) / W) * box.width;
    tip.style.left = `${Math.min(box.width - tip.offsetWidth, Math.max(0, left + 12))}px`;
    tip.style.top = '28px';
  };
  hit.addEventListener('mousemove', move);
  hit.addEventListener('mouseleave', () => { tip.style.display = 'none'; el.querySelectorAll(`[id^="${id}-d"], #${id}-x`).forEach((n) => n.setAttribute('visibility', 'hidden')); });
  el.querySelector('[data-tbl]').onclick = (e) => { const t = el.querySelector('[data-table]'); t.hidden = !t.hidden; e.target.textContent = t.hidden ? 'Table view' : 'Hide table'; };
}

/** Horizontal bars (single series, so no legend; values are direct-labeled). */
function hbars(rows, { label, value, fmt = numFmt, sub = null }) {
  const max = Math.max(1, ...rows.map((r) => r[value] || 0));
  return `<div class="viz">${rows.map((r) => `<div class="hbar" title="${esc(r[label])}: ${esc(fmt(r[value]))}${sub ? ` · ${esc(sub(r))}` : ''}"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r[label])}</span><div class="track"><div class="fill" style="width:${((r[value] || 0) / max) * 100}%"></div></div><span class="num">${esc(fmt(r[value]))}${sub ? ` <span class="muted small">${esc(sub(r))}</span>` : ''}</span></div>`).join('') || '<div class="muted small">No data yet</div>'}</div>`;
}

const tile = (l, v, sub = '') => `<div class="card kpi"><div class="l">${l}</div><div class="v">${v}</div>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>`;

/* ================================= Analytics ================================= */

views.analytics = async (main, { query }) => {
  const days = Number(query.days) || 30;
  const owner = query.owner_id || '';
  const m = await api(`/analytics?days=${days}${owner ? `&owner_id=${owner}` : ''}`);
  const k = m.kpi;
  const qs = (patch) => `#/analytics?${new URLSearchParams({ days, ...(owner ? { owner_id: owner } : {}), ...patch })}`;
  main.innerHTML = `<div class="page-head"><h1>Analytics</h1><span class="sub">Performance across leads, pipeline, team, AI, and marketing</span><span class="spacer"></span>
    <div class="pill-toggle">${[[7, '7d'], [30, '30d'], [90, '90d'], [365, '12mo']].map(([d, l]) => `<a class="btn ${d === days ? 'primary' : ''}" href="${qs({ days: d })}">${l}</a>`).join('')}</div>
    ${isAdmin() ? `<select id="owner" style="width:auto">${userOptions(owner, { blank: true }).replace('Anyone', 'Whole team')}</select>` : ''}</div>
  <div class="grid g4" style="margin-bottom:16px">
    ${tile('New leads', numFmt(k.leads), `${pctFmt(k.contact_rate)} contacted · ${pctFmt(k.engagement_rate)} engaged`)}
    ${tile('Speed to lead', m.speed.median_minutes == null ? '-' : `${m.speed.median_minutes < 120 ? `${m.speed.median_minutes}m` : `${Math.round(m.speed.median_minutes / 60)}h`}`, `${pctFmt(m.speed.under_5_min_pct)} under 5 min · ${m.speed.never_contacted} never contacted`)}
    ${tile('Lead → application', pctFmt(k.lead_to_app), `${k.funded} funded · ${money(k.funded_volume) || '$0'}`)}
    ${tile('Revenue (funded)', money(k.revenue) || '$0', `at ${m.comp_bps} bps · projected ${money(k.projected_revenue) || '$0'} from pipeline`)}
  </div>
  <div class="grid side" style="margin-bottom:16px">
    <div class="card"><div class="card-head"><h2>Activity trend</h2><span class="muted small">${m.trend_bucket_days > 1 ? 'weekly' : 'daily'}</span></div><div id="trend"></div></div>
    <div class="card"><h2>Conversion funnel</h2>${hbars(m.funnel, { label: 'step', value: 'n', sub: (r) => `${r.rate}%` })}
      <p class="small muted">Share of leads created in this period that reached each step.</p></div>
  </div>
  <div class="grid g2" style="margin-bottom:16px">
    <div class="card"><h2>Pipeline forecast</h2><div class="table-wrap"><table><thead><tr><th>Stage</th><th class="num">Loans</th><th class="num">Volume</th><th class="num">Close prob.</th><th class="num">Weighted</th></tr></thead><tbody>
      ${m.pipeline.map((p) => `<tr><td>${esc(stageLabel(p.stage))}</td><td class="num">${p.loans}</td><td class="num">${money(p.volume) || '$0'}</td><td class="num">${Math.round(p.probability * 100)}%</td><td class="num">${money(p.weighted) || '$0'}</td></tr>`).join('')}
      <tr><td><strong>Total</strong></td><td class="num"><strong>${m.pipeline.reduce((a, p) => a + p.loans, 0)}</strong></td><td class="num"><strong>${money(k.pipeline_volume) || '$0'}</strong></td><td></td><td class="num"><strong>${money(k.weighted_pipeline) || '$0'}</strong></td></tr></tbody></table></div></div>
    <div class="card"><h2>Outreach mix</h2>${hbars([{ l: 'Calls', v: m.activity.calls }, { l: 'Texts', v: m.activity.texts }, { l: 'Emails', v: m.activity.emails }, { l: 'Voicemail drops', v: m.activity.voicemails }, { l: 'Inbound replies', v: m.activity.inbound }], { label: 'l', value: 'v' })}</div>
  </div>
  <div class="card flush" style="margin-bottom:16px"><div class="card-head" style="padding:16px 16px 0"><h2>Lead source ROI</h2><span class="spacer"></span>${isAdmin() ? '<button class="sm" id="spend">Enter ad / lead spend</button>' : ''}</div>
    <div class="table-wrap"><table><thead><tr><th>Source</th><th class="num">Leads</th><th class="num">Contacted</th><th class="num">Apps</th><th class="num">Funded</th><th class="num">Conv.</th><th class="num">Spend</th><th class="num">Cost/lead</th><th class="num">Cost/funded</th><th class="num">Revenue</th><th class="num">ROI</th></tr></thead><tbody>
    ${m.sources.map((s) => `<tr><td>${esc(s.source)}</td><td class="num">${s.leads}</td><td class="num">${s.contacted}</td><td class="num">${s.applications}</td><td class="num">${s.funded}</td><td class="num">${s.conversion}%</td><td class="num">${s.spend ? money(s.spend) : '-'}</td><td class="num">${s.cost_per_lead != null ? money(s.cost_per_lead) : '-'}</td><td class="num">${s.cost_per_funded != null ? money(s.cost_per_funded) : '-'}</td><td class="num">${money(s.revenue) || '$0'}</td><td class="num">${s.roi != null ? `<span class="badge ${s.roi >= 0 ? 'green' : 'red'}">${s.roi}%</span>` : '-'}</td></tr>`).join('') || '<tr><td colspan="11" class="muted">No leads in this period</td></tr>'}
    </tbody></table></div></div>
  <div class="card flush" style="margin-bottom:16px"><div class="card-head" style="padding:16px 16px 0"><h2>🏆 Leaderboard</h2></div><div class="table-wrap"><table><thead><tr><th>#</th><th>Loan officer</th><th class="num">Leads</th><th class="num">Speed (med.)</th><th class="num">Calls</th><th class="num">Texts</th><th class="num">Emails</th><th class="num">Appts</th><th class="num">Tasks done</th><th class="num">Apps</th><th class="num">Funded</th><th class="num">Volume</th><th class="num">Revenue</th></tr></thead><tbody>
    ${m.leaderboard.map((u, i) => `<tr><td>${i + 1}</td><td><strong>${esc(u.name)}</strong></td><td class="num">${u.leads}</td><td class="num">${u.speed_median_min == null ? '-' : `${u.speed_median_min}m`}</td><td class="num">${u.calls}</td><td class="num">${u.texts}</td><td class="num">${u.emails}</td><td class="num">${u.appointments}</td><td class="num">${u.tasks_done}</td><td class="num">${u.applications}</td><td class="num">${u.funded}</td><td class="num">${money(u.volume) || '$0'}</td><td class="num">${money(u.revenue) || '$0'}</td></tr>`).join('')}
    </tbody></table></div></div>
  <div class="grid g4" style="margin-bottom:16px">
    ${tile(`${esc(state.meta.settings.assistant_name)} drafted`, m.ai.drafted, `${pctFmt(m.ai.approval_rate)} approved`)}
    ${tile('AI messages sent', m.ai.sent, `${m.ai.replies} replies (${pctFmt(m.ai.reply_rate)})`)}
    ${tile('Warm handoffs', m.ai.handoffs, 'AI-qualified conversations')}
    ${tile('Outbound touches', numFmt(k.outbound), `${numFmt(k.replies)} inbound replies`)}
  </div>
  <div class="grid g3">
    <div class="card"><h2>Workflows</h2><div class="table-wrap"><table><thead><tr><th>Workflow</th><th class="num">Enrolled</th><th class="num">Replied</th><th class="num">Goal</th></tr></thead><tbody>${m.workflows.map((w) => `<tr><td><a href="#/workflows/${w.id}">${esc(w.name)}</a></td><td class="num">${w.enrolled}</td><td class="num">${pctFmt(w.reply_rate)}</td><td class="num">${pctFmt(w.goal_rate)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No workflows yet</td></tr>'}</tbody></table></div></div>
    <div class="card"><h2>Campaigns</h2><div class="table-wrap"><table><thead><tr><th>Campaign</th><th class="num">Sent</th><th class="num">Open</th><th class="num">Reply</th><th class="num">Conv.</th></tr></thead><tbody>${m.campaigns.map((c) => `<tr><td><a href="#/campaigns/${c.id}">${esc(c.name)}</a></td><td class="num">${c.sent}</td><td class="num">${pctFmt(c.open_rate)}</td><td class="num">${pctFmt(c.reply_rate)}</td><td class="num">${c.converted}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No sends in this period</td></tr>'}</tbody></table></div></div>
    <div class="card"><h2>Referral partners</h2><div class="table-wrap"><table><thead><tr><th>Partner</th><th class="num">Referrals</th><th class="num">In process</th><th class="num">Funded</th></tr></thead><tbody>${m.partners.filter((p) => p.referrals).map((p) => `<tr><td><a href="#/partners/${p.id}">${esc(p.name)}</a></td><td class="num">${p.referrals}</td><td class="num">${p.in_process || 0}</td><td class="num">${p.funded || 0}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No referrals in this period</td></tr>'}</tbody></table></div></div>
  </div>`;
  lineChart(main.querySelector('#trend'), m.trend, [{ key: 'touches', label: 'Outbound', color: '--series-1' }, { key: 'replies', label: 'Replies', color: '--series-2' }, { key: 'leads', label: 'New leads', color: '--series-3' }]);
  main.querySelector('#owner')?.addEventListener('change', (e) => (location.hash = `#/analytics?days=${days}${e.target.value ? `&owner_id=${e.target.value}` : ''}`));
  main.querySelector('#spend')?.addEventListener('click', () => spendModal(() => views.analytics(main, { query })));
};

async function spendModal(done) {
  const rows = await api('/lead-spend');
  const month = new Date().toISOString().slice(0, 7);
  modal(`<h2>Lead & ad spend</h2><p class="small muted">Enter what you spend per source each month (Zillow, Facebook ads, lead vendors…). The source name must match the contact source exactly. Used for cost per lead, cost per funded loan, and ROI.</p>
    <div class="form-grid"><label class="f">Source<input id="src" list="srcs" placeholder="e.g. Zillow"></label><label class="f">Month<input id="mo" type="month" value="${month}"></label><label class="f">Amount ($)<input id="amt" type="number" min="0"></label><div class="f" style="align-self:end"><button class="primary" id="add">Save</button></div></div>
    <datalist id="srcs"></datalist>
    <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Month</th><th>Source</th><th class="num">Amount</th><th></th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.month)}</td><td>${esc(r.source)}</td><td class="num">${money(r.amount)}</td><td><button class="sm ghost" data-del="${r.id}">✕</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Nothing entered yet</td></tr>'}</tbody></table></div>
    <div class="actions"><button data-close>Done</button></div>`, {
    onMount: (m, close) => {
      api('/analytics?days=365').then((a) => (m.querySelector('#srcs').innerHTML = a.sources.map((s) => `<option value="${esc(s.source)}">`).join('')));
      m.querySelector('#add').onclick = async () => {
        await act(() => api('/lead-spend', { method: 'POST', body: { source: m.querySelector('#src').value, month: m.querySelector('#mo').value, amount: m.querySelector('#amt').value } }), 'Saved');
        close(); done(); spendModal(done);
      };
      m.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => { await act(() => api(`/lead-spend/${b.dataset.del}`, { method: 'DELETE' })); close(); done(); spendModal(done); }));
    },
  });
}

/* ================================= Workflows ================================= */

let wfMeta = null;
async function loadWfMeta() {
  if (!wfMeta) wfMeta = await api('/workflows/meta');
  return wfMeta;
}
const statusBadge = (s) => `<span class="badge ${s === 'active' ? 'green' : s === 'paused' ? 'amber' : 'gray'}">${esc(s)}</span>`;

views.workflows = async (main) => {
  const [list, meta] = await Promise.all([api('/workflows'), loadWfMeta()]);
  const installed = new Set(list.map((w) => w.recipe).filter(Boolean));
  main.innerHTML = `<div class="page-head"><h1>Workflows</h1><span class="sub">Multi-step automations: triggers, branches, waits, and actions across every channel</span><span class="spacer"></span>${isAdmin() ? '<a class="btn primary" href="#/workflows/new">+ New workflow</a>' : ''}</div>
  <div class="card flush" style="margin-bottom:16px"><div class="table-wrap">${list.length ? `<table><thead><tr><th>Workflow</th><th>Trigger</th><th>Status</th><th class="num">Enrolled</th><th class="num">Active</th><th class="num">Completed</th><th class="num">Replied</th><th class="num">Goal reached</th></tr></thead><tbody>
    ${list.map((w) => `<tr><td><a href="#/workflows/${w.id}"><strong>${esc(w.name)}</strong></a><div class="small muted">${esc(w.description || '')}</div></td><td class="small">${esc(meta.triggers[w.trigger]?.label || w.trigger)}</td><td>${statusBadge(w.status)}</td><td class="num">${w.stats.enrolled || 0}</td><td class="num">${w.stats.active || 0}</td><td class="num">${w.stats.completed || 0}</td><td class="num">${w.stats.replied || 0}</td><td class="num">${w.stats.goals || 0}</td></tr>`).join('')}
  </tbody></table>` : '<div class="empty">No workflows yet. Install a proven recipe below or build your own.</div>'}</div></div>
  <h2>Recipe library</h2><p class="muted small" style="margin-top:-6px">Battle-tested mortgage automations. Install, review, customize, then activate.</p>
  <div class="grid g3">${meta.recipes.map((r) => `<div class="card"><div class="row"><h3 style="margin:0">${esc(r.name)}</h3><span class="spacer"></span>${installed.has(r.key) ? '<span class="badge green">installed</span>' : ''}</div>
    <p class="small muted">${esc(r.description)}</p><div class="small">Trigger: <strong>${esc(meta.triggers[r.trigger]?.label || r.trigger)}</strong></div>
    ${isAdmin() ? `<button class="sm" style="margin-top:10px" data-recipe="${r.key}">${installed.has(r.key) ? 'Install another copy' : 'Install'}</button>` : ''}</div>`).join('')}</div>`;
  main.querySelectorAll('[data-recipe]').forEach((b) => (b.onclick = async () => {
    const w = await act(() => api('/workflows', { method: 'POST', body: { recipe: b.dataset.recipe } }), 'Installed as a draft - review and activate it');
    location.hash = `#/workflows/${w.id}`;
  }));
};

const GROUP_CLASS = { Communicate: '', Flow: 'flow', Organize: 'org', Notify: 'notify' };

views.workflow = async (main, { id }) => {
  const isNew = id === 'new';
  const meta = await loadWfMeta();
  const [wf, campaigns, drops, pages] = await Promise.all([
    isNew ? { name: '', description: '', trigger: 'new_lead', trigger_config: {}, steps: [], exit_on_reply: 1, exit_stages: [], allow_reentry: 0, status: 'draft', stats: {}, runs: [] } : api(`/workflows/${id}`),
    api('/campaigns'), api('/voicemail-drops'), api('/landing-pages'),
  ]);
  const lookups = {
    stage: [['', '-'], ...state.meta.stages.map((s) => [s.key, s.label])],
    user_or_rr: [['round_robin', 'Round-robin (team routing)'], ...state.meta.users.filter((u) => u.active).map((u) => [String(u.id), u.name])],
    campaign: [['', 'Choose…'], ...campaigns.map((c) => [String(c.id), c.name])],
    voicemail: [['', 'Choose…'], ...drops.map((d) => [String(d.id), d.name])],
    landing_page: [['', 'Any'], ...pages.map((p) => [String(p.id), p.title])],
  };
  const steps = wf.steps;

  const fieldInput = (f, value, attrs) => {
    const v = value ?? f.default ?? '';
    const opts = f.type === 'select' ? f.options : lookups[f.type];
    if (opts) return `<select ${attrs}>${opts.map(([k, l]) => `<option value="${esc(k)}" ${String(v) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    if (f.type === 'textarea') return `<textarea rows="3" ${attrs}>${esc(v)}</textarea>`;
    return `<input ${f.type === 'number' ? 'type="number" step="any"' : ''} value="${esc(v)}" ${attrs}>`;
  };
  const condRow = (pathStr, ci, c) => {
    const def = meta.conditions[c.field] || { type: 'text' };
    const ops = def.type === 'bool' ? [['is_true', 'is true'], ['is_false', 'is false']] : def.type === 'number' ? [['gte', '≥'], ['gt', '>'], ['lte', '≤'], ['lt', '<'], ['eq', '=']] : [['eq', 'is'], ['neq', 'is not'], ['contains', 'contains'], ['not_contains', 'does not contain']];
    return `<div class="cond-row"><select data-cond="${pathStr}" data-ci="${ci}" data-ck="field">${Object.entries(meta.conditions).map(([k, d]) => `<option value="${k}" ${k === c.field ? 'selected' : ''}>${esc(d.label)}</option>`).join('')}</select>
      <select data-cond="${pathStr}" data-ci="${ci}" data-ck="op">${ops.map(([k, l]) => `<option value="${k}" ${k === c.op ? 'selected' : ''}>${l}</option>`).join('')}</select>
      ${def.type === 'bool' ? '<span></span>' : def.type === 'stage' ? `<select data-cond="${pathStr}" data-ci="${ci}" data-ck="value">${stageOptions(c.value)}</select>` : `<input data-cond="${pathStr}" data-ci="${ci}" data-ck="value" value="${esc(c.value ?? '')}">`}
      <button class="sm ghost" data-delcond="${pathStr}" data-ci="${ci}" title="Remove condition">✕</button></div>`;
  };
  const addMenu = (listPath) => `<div class="row" style="margin:4px 0 10px"><select data-addto="${esc(JSON.stringify(listPath))}" style="width:auto"><option value="">+ Add step…</option>${['Communicate', 'Flow', 'Organize', 'Notify'].map((g) => `<optgroup label="${g}">${Object.entries(meta.steps).filter(([, d]) => d.group === g).map(([k, d]) => `<option value="${k}">${esc(d.label)}</option>`).join('')}</optgroup>`).join('')}</select></div>`;
  const renderList = (list, basePath) => `<ol class="wf-steps">${list.map((s, i) => {
    const path = [...basePath, i];
    const ps = esc(JSON.stringify(path));
    const def = meta.steps[s.type] || { label: s.type, fields: [], group: 'Flow' };
    const body = s.type === 'if'
      ? `<div class="small" style="margin:6px 0">Match <select data-step="${ps}" data-k="match" style="width:auto;display:inline-block"><option value="all" ${s.config.match !== 'any' ? 'selected' : ''}>all</option><option value="any" ${s.config.match === 'any' ? 'selected' : ''}>any</option></select> of these conditions:</div>
         ${(s.config.conditions || []).map((c, ci) => condRow(JSON.stringify(path), ci, c)).join('')}<button class="sm" data-addcond="${ps}">+ Condition</button>
         <div class="wf-branch"><div class="lbl" style="color:var(--ok)">✓ Yes</div>${renderList(s.yes || [], [...path, 'yes'])}${addMenu([...path, 'yes'])}</div>
         <div class="wf-branch"><div class="lbl" style="color:var(--hot)">✕ No</div>${renderList(s.no || [], [...path, 'no'])}${addMenu([...path, 'no'])}</div>`
      : `<div class="form-grid" style="margin-top:8px">${def.fields.map((f) => `<label class="f ${f.type === 'textarea' || ['subject', 'title', 'goal', 'url'].includes(f.key) ? 'wide' : ''}">${esc(f.label)}${fieldInput(f, s.config[f.key], `data-step="${ps}" data-k="${f.key}"`)}</label>`).join('')}</div>`;
    return `<li class="wf-step ${GROUP_CLASS[def.group] || ''}"><div class="head"><span class="small muted">${path.filter((p) => typeof p === 'number').map((n) => n + 1).join('.')}</span><strong>${esc(def.label)}</strong>
      <button class="sm ghost" data-move="${ps}" data-dir="-1" title="Move up">↑</button><button class="sm ghost" data-move="${ps}" data-dir="1" title="Move down">↓</button><button class="sm ghost" data-del="${ps}" title="Delete step">✕</button></div>${body}</li>`;
  }).join('')}</ol>`;

  const listAt = (listPath) => {
    if (!listPath.length) return steps;
    let node = null;
    let list = steps;
    for (let i = 0; i < listPath.length; i++) {
      if (i % 2 === 0) node = list[listPath[i]];
      else { node[listPath[i]] ||= []; list = node[listPath[i]]; }
    }
    return list;
  };
  const stepAtPath = (p) => listAt(p.slice(0, -1))[p.at(-1)];

  const trig = meta.triggers[wf.trigger] || meta.triggers.manual;
  main.innerHTML = `<div class="page-head"><a class="btn sm" href="#/workflows">←</a><h1>${isNew ? 'New workflow' : esc(wf.name)}</h1>${isNew ? '' : statusBadge(wf.status)}<span class="spacer"></span>
    ${!isNew && isAdmin() ? `${wf.status === 'active' ? '<button id="pause">Pause</button>' : '<button class="primary" id="activate">Activate</button>'}<button id="enroll">Enroll contacts</button><button class="danger" id="del">Delete</button>` : ''}
    ${isAdmin() ? '<button class="primary" id="save">Save</button>' : ''}</div>
  <div class="grid side"><div>
    <div class="card" style="margin-bottom:12px"><div class="form-grid">
      <label class="f">Name<input id="wf-name" value="${esc(wf.name)}" placeholder="e.g. Open house follow-up"></label>
      <label class="f">Trigger<select id="wf-trigger">${Object.entries(meta.triggers).map(([k, d]) => `<option value="${k}" ${k === wf.trigger ? 'selected' : ''}>${esc(d.label)}</option>`).join('')}</select></label>
      <div id="tc-fields" style="display:contents">${trig.fields.map((f) => `<label class="f">${esc(f.label)}${fieldInput(f, wf.trigger_config[f.key], `data-tc="${f.key}"`)}</label>`).join('')}</div>
      <label class="f wide">Description<input id="wf-desc" value="${esc(wf.description || '')}"></label>
    </div></div>
    <div class="card"><h2 id="when-lbl">⚡ When: ${esc(trig.label)}</h2>
      <div id="steps">${renderList(steps, [])}${addMenu([])}</div>
      <div class="wf-connector">🏁 End</div></div>
  </div><div class="grid" style="align-content:start">
    <div class="card"><h2>Exit & goals</h2>
      <label class="row small"><input type="checkbox" id="wf-reply" ${wf.exit_on_reply ? 'checked' : ''}> Stop when the contact replies</label>
      <label class="row small" style="margin-top:6px"><input type="checkbox" id="wf-reentry" ${wf.allow_reentry ? 'checked' : ''}> Allow re-enrollment (after finishing)</label>
      <label class="f" style="margin-top:10px">Goal stages (reaching one ends the workflow)<select id="wf-goals" multiple size="5">${state.meta.stages.map((s) => `<option value="${s.key}" ${wf.exit_stages.includes(s.key) ? 'selected' : ''}>${esc(s.label)}</option>`).join('')}</select></label>
      <p class="small muted">Opt-outs, Do Not Contact, and quiet hours are enforced on every step automatically. Texts and emails go through the same compliance footer as manual sends.</p></div>
    ${isNew ? '' : `<div class="card"><h2>Performance</h2><div class="grid g2">${[['Enrolled', wf.stats.enrolled], ['Active now', wf.stats.active], ['Completed', wf.stats.completed], ['Exited', wf.stats.exited], ['Replied', wf.stats.replied], ['Goal reached', wf.stats.goals]].map(([l, v]) => `<div><div class="small muted">${l}</div><div style="font-size:20px;font-weight:800">${v || 0}</div></div>`).join('')}</div></div>
    <div class="card"><h2>Recent runs</h2><ul class="list small">${wf.runs.slice(0, 25).map((r) => `<li><div class="row"><a href="#/contacts/${r.contact_id}">${name(r)}</a> ${statusBadge(r.status)}<span class="spacer"></span>${r.status === 'active' ? `<button class="sm ghost" data-stop="${r.id}">Stop</button>` : ''}</div>
      <div class="muted">${r.status === 'active' ? `next step ${when(r.next_run_at)}` : esc(r.exit_reason || '')} · started ${when(r.started_at)}</div>${r.log.length ? `<div class="muted">↳ ${esc(r.log.at(-1).note || r.log.at(-1).error || '')}</div>` : ''}</li>`).join('') || '<li class="muted">No runs yet</li>'}</ul></div>`}
  </div></div>`;

  const rerender = () => { main.querySelector('#steps').innerHTML = `${renderList(steps, [])}${addMenu([])}`; wire(); };
  const wire = () => {
    const root = main.querySelector('#steps');
    root.querySelectorAll('[data-step]').forEach((el) => el.addEventListener('input', () => {
      const s = stepAtPath(JSON.parse(el.dataset.step));
      s.config[el.dataset.k] = el.type === 'number' ? Number(el.value) : el.value;
    }));
    root.querySelectorAll('[data-addto]').forEach((el) => (el.onchange = () => {
      if (!el.value) return;
      const def = meta.steps[el.value];
      const config = Object.fromEntries(def.fields.map((f) => [f.key, f.default ?? (f.type === 'select' ? f.options[0][0] : f.type === 'user_or_rr' ? 'round_robin' : '')]));
      const s = el.value === 'if' ? { type: 'if', config: { match: 'all', conditions: [{ field: 'replied_since_start', op: 'is_false' }] }, yes: [], no: [] } : { type: el.value, config };
      listAt(JSON.parse(el.dataset.addto)).push(s);
      rerender();
    }));
    root.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => { const p = JSON.parse(b.dataset.del); listAt(p.slice(0, -1)).splice(p.at(-1), 1); rerender(); }));
    root.querySelectorAll('[data-move]').forEach((b) => (b.onclick = () => {
      const p = JSON.parse(b.dataset.move);
      const list = listAt(p.slice(0, -1));
      const i = p.at(-1);
      const j = i + Number(b.dataset.dir);
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      rerender();
    }));
    root.querySelectorAll('[data-addcond]').forEach((b) => (b.onclick = () => { const s = stepAtPath(JSON.parse(b.dataset.addcond)); (s.config.conditions ||= []).push({ field: 'score', op: 'gte', value: 50 }); rerender(); }));
    root.querySelectorAll('[data-delcond]').forEach((b) => (b.onclick = () => { stepAtPath(JSON.parse(b.dataset.delcond)).config.conditions.splice(Number(b.dataset.ci), 1); rerender(); }));
    root.querySelectorAll('[data-cond]').forEach((el) => el.addEventListener('change', () => {
      const c = stepAtPath(JSON.parse(el.dataset.cond)).config.conditions[Number(el.dataset.ci)];
      c[el.dataset.ck] = el.value;
      if (el.dataset.ck === 'field') { c.op = meta.conditions[el.value].type === 'bool' ? 'is_true' : meta.conditions[el.value].type === 'number' ? 'gte' : 'eq'; c.value = ''; rerender(); }
    }));
    root.querySelectorAll('[data-cond][data-ck="value"]').forEach((el) => el.addEventListener('input', () => { stepAtPath(JSON.parse(el.dataset.cond)).config.conditions[Number(el.dataset.ci)].value = el.value; }));
  };
  wire();

  const collect = () => ({
    name: main.querySelector('#wf-name').value.trim(),
    description: main.querySelector('#wf-desc').value,
    trigger: main.querySelector('#wf-trigger').value,
    trigger_config: Object.fromEntries([...main.querySelectorAll('[data-tc]')].map((el) => [el.dataset.tc, el.value])),
    steps,
    exit_on_reply: main.querySelector('#wf-reply').checked,
    allow_reentry: main.querySelector('#wf-reentry').checked,
    exit_stages: [...main.querySelector('#wf-goals').selectedOptions].map((o) => o.value),
  });
  main.querySelector('#wf-trigger').onchange = (e) => {
    const t = meta.triggers[e.target.value];
    main.querySelector('#tc-fields').innerHTML = t.fields.map((f) => `<label class="f">${esc(f.label)}${fieldInput(f, undefined, `data-tc="${f.key}"`)}</label>`).join('');
    main.querySelector('#when-lbl').textContent = `⚡ When: ${t.label}`;
  };
  const save = async (extra = {}) => {
    const body = { ...collect(), ...extra };
    if (!body.name) throw new Error('Name the workflow first');
    return isNew ? api('/workflows', { method: 'POST', body }) : api(`/workflows/${id}`, { method: 'PATCH', body });
  };
  main.querySelector('#save')?.addEventListener('click', async () => { const r = await act(save, 'Saved'); if (isNew) location.hash = `#/workflows/${r.id}`; });
  main.querySelector('#activate')?.addEventListener('click', async () => { await act(() => save({ status: 'active' }), 'Workflow is live'); views.workflow(main, { id }); });
  main.querySelector('#pause')?.addEventListener('click', async () => { await act(() => save({ status: 'paused' }), 'Paused - active runs will wait'); views.workflow(main, { id }); });
  main.querySelector('#del')?.addEventListener('click', async () => { if (confirm('Delete this workflow and its run history?')) { await act(() => api(`/workflows/${id}`, { method: 'DELETE' }), 'Deleted'); location.hash = '#/workflows'; } });
  main.querySelectorAll('[data-stop]').forEach((b) => (b.onclick = async () => { await act(() => api(`/workflow-runs/${b.dataset.stop}/stop`, { method: 'POST' }), 'Stopped'); views.workflow(main, { id }); }));
  main.querySelector('#enroll')?.addEventListener('click', () => enrollModal(id, () => views.workflow(main, { id })));
};

function enrollModal(workflowId, done) {
  modal(`<h2>Enroll contacts</h2><input id="q" placeholder="Search contacts…"><div id="res" class="small" style="max-height:320px;overflow:auto;margin-top:8px"></div>
    <div class="actions"><span class="muted small" id="cnt">0 selected</span><span class="spacer"></span><button data-close>Cancel</button><button class="primary" id="go">Enroll</button></div>`, {
    onMount: (m, close) => {
      const sel = new Set();
      const search = async () => {
        const { contacts } = await api(`/contacts?limit=50&q=${encodeURIComponent(m.querySelector('#q').value)}`);
        m.querySelector('#res').innerHTML = contacts.map((c) => `<label class="row" style="padding:4px 0"><input type="checkbox" value="${c.id}" ${sel.has(c.id) ? 'checked' : ''}> ${scoreChip(c.score)} ${name(c)} <span class="muted">${esc(stageLabel(c.stage))}</span></label>`).join('') || '<div class="muted">No matches</div>';
        m.querySelectorAll('#res input').forEach((cb) => (cb.onchange = () => { cb.checked ? sel.add(Number(cb.value)) : sel.delete(Number(cb.value)); m.querySelector('#cnt').textContent = `${sel.size} selected`; }));
      };
      let t;
      m.querySelector('#q').oninput = () => { clearTimeout(t); t = setTimeout(search, 250); };
      search();
      m.querySelector('#go').onclick = async () => {
        const r = await act(() => api(`/workflows/${workflowId}/enroll`, { method: 'POST', body: { contact_ids: [...sel] } }));
        toast(`Enrolled ${r.enrolled}${r.skipped ? ` · ${r.skipped} skipped (already enrolled)` : ''}`);
        close(); done();
      };
    },
  });
}

/* ================================= Partners ================================= */

const PARTNER_TYPES = { realtor: 'Realtor', builder: 'Builder', financial_planner: 'Financial planner', cpa: 'CPA', attorney: 'Attorney', other: 'Other' };

function partnerModal(p, done) {
  modal(`<h2>${p ? 'Edit partner' : 'New referral partner'}</h2><form id="f" class="form-grid">
    <label class="f">Name<input name="name" value="${esc(p?.name || '')}"></label><label class="f">Company<input name="company" value="${esc(p?.company || '')}"></label>
    <label class="f">Type<select name="type">${Object.entries(PARTNER_TYPES).map(([k, l]) => `<option value="${k}" ${p?.type === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="f">Email<input name="email" type="email" value="${esc(p?.email || '')}"></label><label class="f">Phone<input name="phone" value="${esc(p?.phone || '')}"></label>
    <label class="f row" style="font-weight:500"><input type="checkbox" name="send_updates" ${p ? (p.send_updates ? 'checked' : '') : 'checked'}> Send automatic loan updates</label>
    ${p ? `<label class="f row" style="font-weight:500"><input type="checkbox" name="active" ${p.active ? 'checked' : ''}> Active</label>` : ''}
    <label class="f wide">Notes<textarea name="notes" rows="2">${esc(p?.notes || '')}</textarea></label></form>
    <div class="actions"><button data-close>Cancel</button><button class="primary" id="s">Save</button></div>`, {
    onMount: (m, close) => (m.querySelector('#s').onclick = async () => {
      const body = formData(m.querySelector('#f'));
      await act(() => (p ? api(`/partners/${p.id}`, { method: 'PATCH', body }) : api('/partners', { method: 'POST', body })), 'Saved');
      await refreshMeta();
      close(); done();
    }),
  });
}

views.partners = async (main) => {
  const list = await api('/partners');
  main.innerHTML = `<div class="page-head"><h1>Referral partners</h1><span class="sub">Realtors, builders, and advisors who send you business</span><span class="spacer"></span><button class="primary" id="add">+ Add partner</button></div>
  <div class="grid g4" style="margin-bottom:16px">${tile('Partners', list.filter((p) => p.active).length)}${tile('Referrals', list.reduce((a, p) => a + p.referrals, 0))}${tile('In process', list.reduce((a, p) => a + (p.in_process || 0), 0))}${tile('Funded volume', money(list.reduce((a, p) => a + (p.volume || 0), 0)) || '$0')}</div>
  <div class="card flush"><div class="table-wrap">${list.length ? `<table><thead><tr><th>Partner</th><th>Type</th><th class="num">Referrals</th><th class="num">In process</th><th class="num">Funded</th><th class="num">Volume</th><th>Last referral</th><th>Updates</th></tr></thead><tbody>
    ${list.map((p) => `<tr><td><a href="#/partners/${p.id}"><strong>${esc(p.name)}</strong></a>${p.active ? '' : ' <span class="badge gray">inactive</span>'}<div class="small muted">${esc(p.company || '')}</div></td><td class="small">${esc(PARTNER_TYPES[p.type] || p.type)}</td><td class="num">${p.referrals}</td><td class="num">${p.in_process || 0}</td><td class="num">${p.funded || 0}</td><td class="num">${money(p.volume) || '$0'}</td><td class="small muted">${when(p.last_referral) || '-'}</td><td>${p.send_updates ? '<span class="badge green">auto</span>' : '<span class="badge gray">off</span>'}</td></tr>`).join('')}
  </tbody></table>` : '<div class="empty">Add the agents who refer to you. Tag contacts with their partner and they get automatic loan-status updates (install the "Referral partner loan updates" workflow).</div>'}</div></div>`;
  main.querySelector('#add').onclick = () => partnerModal(null, () => views.partners(main));
};

views.partner = async (main, { id }) => {
  const p = await api(`/partners/${id}`);
  const lps = (await api('/landing-pages')).filter((x) => x.partner_id === p.id);
  main.innerHTML = `<div class="page-head"><a class="btn sm" href="#/partners">←</a><div><h1>${esc(p.name)}</h1><div class="sub">${esc([PARTNER_TYPES[p.type], p.company].filter(Boolean).join(' · '))}</div></div><span class="spacer"></span><button id="edit">Edit</button>${isAdmin() ? '<button class="danger" id="del">Delete</button>' : ''}</div>
  <div class="grid side"><div class="card flush"><div class="card-head" style="padding:16px 16px 0"><h2>Referred clients</h2></div><div class="table-wrap">${p.clients.length ? `<table><thead><tr><th>Score</th><th>Client</th><th>Stage</th><th class="num">Loan</th><th>Added</th></tr></thead><tbody>${p.clients.map((c) => `<tr><td>${scoreChip(c.score)}</td><td><a href="#/contacts/${c.id}">${name(c)}</a></td><td><span class="badge">${esc(stageLabel(c.stage))}</span></td><td class="num">${money(c.loan_amount)}</td><td class="small muted">${when(c.created_at)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">No referred clients yet. Set this partner on a contact, or co-brand a landing page with them.</div>'}</div></div>
  <div class="grid" style="align-content:start"><div class="card"><h2>Contact</h2><div class="small" style="display:grid;gap:6px">${p.email ? `<div>✉️ <a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div>` : ''}${p.phone ? `<div>📱 <a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></div>` : ''}<div>Automatic loan updates: <strong>${p.send_updates ? 'on' : 'off'}</strong></div>${p.notes ? `<div class="muted">${esc(p.notes)}</div>` : ''}</div></div>
    <div class="card"><h2>Co-branded pages</h2>${lps.length ? lps.map((l) => `<div class="small"><a href="#/pages/${l.id}">${esc(l.title)}</a> · ${l.submissions} leads</div>`).join('') : '<div class="small muted">None yet. In Landing Pages, pick this partner under "Co-branded with partner" so every lead is credited to them automatically.</div>'}</div></div></div>`;
  main.querySelector('#edit').onclick = () => partnerModal(p, () => views.partner(main, { id }));
  main.querySelector('#del')?.addEventListener('click', async () => { if (confirm('Delete this partner? Their clients stay in the CRM.')) { await act(() => api(`/partners/${id}`, { method: 'DELETE' }), 'Deleted'); await refreshMeta(); location.hash = '#/partners'; } });
};

/* ================================== Copilot ================================== */

const SUGGESTIONS = ['What should I focus on today?', 'Who are my top refinance opportunities?', 'Which loans are stalled?', 'How am I doing this month?', 'Who replied and is still waiting on me?', 'Who has the most equity for a HELOC?'];

views.copilot = async (main, { query }) => {
  const threads = await api('/copilot/threads');
  let threadId = query.t ? Number(query.t) : null;
  let messages = threadId ? (await api(`/copilot/threads/${threadId}`).catch(() => ({ messages: [] }))).messages : [];
  main.innerHTML = `<div class="page-head"><h1>🧠 Copilot</h1><span class="sub">Ask anything about your business. It can look things up and take actions.</span><span class="spacer"></span><a class="btn" href="#/copilot">New chat</a></div>
  <div class="grid" style="grid-template-columns:minmax(0,1fr) 260px;gap:16px">
    <div class="card" style="display:flex;flex-direction:column;min-height:60vh">
      ${state.meta.ai ? '' : '<div class="callout small" style="margin-bottom:12px">Offline mode: no <code>ANTHROPIC_API_KEY</code> is set, so Copilot answers the common questions below directly from your data. Add a key for full conversations and actions.</div>'}
      <div class="chat" id="chat" style="flex:1;overflow-y:auto;max-height:62vh;padding:4px"></div>
      <div class="row" id="sugg" style="margin:10px 0"></div>
      <form id="f" class="row" style="flex-wrap:nowrap"><textarea id="q" rows="2" placeholder="e.g. Find past clients in Temecula with 40%+ equity and add a task to call the top 3" style="flex:1"></textarea><button class="primary" type="submit">Send</button></form>
    </div>
    <div class="card" style="align-self:start"><h3>Recent chats</h3><ul class="list small">${threads.map((t) => `<li class="row" style="flex-wrap:nowrap"><a href="#/copilot?t=${t.id}" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${t.id === threadId ? 'font-weight:700' : ''}">${esc(t.title || 'Chat')}</a><button class="sm ghost" data-del="${t.id}" title="Delete">✕</button></li>`).join('') || '<li class="muted">No chats yet</li>'}</ul></div>
  </div>`;
  const chat = main.querySelector('#chat');
  const draw = (pending = false) => {
    chat.innerHTML = messages.map((m) => (m.role === 'user' ? `<div class="bubble-u">${esc(m.text)}</div>` : `<div class="bubble-a">${m.tools?.length ? `<div>${m.tools.map((t) => `<span class="tool-chip">🔧 ${esc(t.replace(/_/g, ' '))}</span>`).join('')}</div>` : ''}${linkIds(m.text || '')}</div>`)).join('')
      + (pending ? '<div class="bubble-a muted">Thinking…</div>' : '')
      + (!messages.length && !pending ? '<div class="empty">Ask about your pipeline, people, numbers, or tell it what to do.</div>' : '');
    chat.scrollTop = chat.scrollHeight;
    main.querySelector('#sugg').innerHTML = messages.length ? '' : SUGGESTIONS.map((s) => `<button class="sm" data-s="${esc(s)}">${esc(s)}</button>`).join('');
    main.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => send(b.dataset.s)));
  };
  const send = async (text) => {
    if (!text.trim()) return;
    messages.push({ role: 'user', text });
    draw(true);
    main.querySelector('#q').value = '';
    try {
      const r = await api('/copilot', { method: 'POST', body: { thread_id: threadId, text } });
      threadId = r.thread_id;
      messages = r.messages;
      if (r.actions.some((a) => !['search_contacts', 'get_contact', 'find_opportunities', 'get_metrics', 'list_tasks', 'list_workflows'].includes(a.tool))) toast('Copilot made changes - see the details in its reply');
      history.replaceState(null, '', `#/copilot?t=${threadId}`);
      const ts = await api('/copilot/threads');
      main.querySelector('.card:last-child .list').innerHTML = ts.map((t) => `<li class="row" style="flex-wrap:nowrap"><a href="#/copilot?t=${t.id}" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${t.id === threadId ? 'font-weight:700' : ''}">${esc(t.title || 'Chat')}</a></li>`).join('');
    } catch (e) {
      messages.push({ role: 'assistant', text: `⚠️ ${e.message}` });
    }
    draw();
  };
  main.querySelector('#f').onsubmit = (e) => { e.preventDefault(); send(main.querySelector('#q').value); };
  main.querySelector('#q').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e.target.value); } };
  main.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => { await act(() => api(`/copilot/threads/${b.dataset.del}`, { method: 'DELETE' })); location.hash = '#/copilot'; views.copilot(main, { query: {} }); }));
  draw();
  main.querySelector('#q').focus();
};

/* =============================== Content Studio =============================== */

views.studio = async (main) => {
  const [meta, items] = await Promise.all([api('/content/meta'), api('/content')]);
  const kinds = Object.entries(meta.kinds);
  const groups = { scheduled: items.filter((i) => i.status === 'scheduled').sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)), draft: items.filter((i) => i.status === 'draft'), published: items.filter((i) => i.status === 'published') };
  main.innerHTML = `<div class="page-head"><h1>🎨 Content Studio</h1><span class="sub">AI-written social posts, newsletters, blogs, and video scripts in your voice</span></div>
  <div class="grid side"><div class="grid" style="align-content:start">
    <div class="card"><h2>Create</h2><div class="form-grid">
      <label class="f">Type<select id="kind">${kinds.map(([k, d]) => `<option value="${k}">${esc(d.label)}</option>`).join('')}</select></label>
      <label class="f">Platform<select id="platform"></select></label>
      <label class="f">Tone<select id="tone">${['friendly and expert', 'warm and personal', 'confident and direct', 'fun and upbeat', 'calm and educational'].map((t) => `<option>${t}</option>`).join('')}</select></label>
      <label class="f">Audience<select id="aud">${['local home buyers and homeowners', 'first-time home buyers', 'past clients and homeowners', 'veterans and military families', 'real estate agents (referral partners)', 'move-up buyers'].map((t) => `<option>${t}</option>`).join('')}</select></label>
      <label class="f wide">Topic<input id="topic" placeholder="e.g. 5 myths about down payments, or why spring is a smart time to get pre-approved"></label>
    </div><div class="row" style="margin-top:10px"><span class="small muted">${meta.ai ? 'Written by Claude with mortgage advertising guardrails.' : 'Using templates - set ANTHROPIC_API_KEY for AI-written content.'}</span><span class="spacer"></span><button class="primary" id="gen">✨ Generate</button></div></div>
    <div class="card" id="editor" hidden><h2>Edit & publish</h2>
      <input id="title" placeholder="Title"><textarea id="body" rows="12" style="margin-top:8px;font-family:inherit"></textarea>
      <div class="row" style="margin-top:10px"><span class="small muted" id="chars"></span><span class="spacer"></span><button id="copy">Copy</button><input type="datetime-local" id="when" style="width:auto"><button id="sched">Schedule</button><button id="draft">Save draft</button><button class="primary" id="pub">Publish now</button></div>
      <p class="small muted">Publishing fires the <code>content.published</code> event. Connect it in Integrations to Zapier, Make, or Buffer to post to Facebook, Instagram, LinkedIn, and more automatically.</p></div>
  </div><div class="grid" style="align-content:start">
    ${[['scheduled', '🗓️ Scheduled'], ['draft', '📝 Drafts'], ['published', '✅ Published']].map(([k, l]) => `<div class="card"><h2>${l} <span class="muted small">${groups[k].length}</span></h2><ul class="list small">${groups[k].slice(0, 15).map((i) => `<li><div class="row" style="flex-wrap:nowrap"><strong style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(i.title || i.body.slice(0, 50))}</strong><button class="sm ghost" data-open="${i.id}">Open</button></div><div class="muted">${esc(meta.kinds[i.kind]?.label || i.kind)}${i.platform ? ` · ${esc(i.platform)}` : ''} · ${k === 'scheduled' ? `goes out ${esc(i.scheduled_at)}` : when(i.published_at || i.created_at)}</div></li>`).join('') || '<li class="muted">Nothing here</li>'}</ul></div>`).join('')}
  </div></div>`;
  let currentId = null;
  let currentKind = null;
  const kindSel = main.querySelector('#kind');
  const syncPlatforms = () => (main.querySelector('#platform').innerHTML = meta.kinds[kindSel.value].platforms.map((p) => `<option>${p}</option>`).join(''));
  kindSel.onchange = syncPlatforms;
  syncPlatforms();
  const ed = main.querySelector('#editor');
  const bodyEl = main.querySelector('#body');
  const showEditor = (item) => {
    ed.hidden = false;
    main.querySelector('#title').value = item.title || '';
    bodyEl.value = item.body;
    currentId = item.id || null;
    currentKind = item.kind || kindSel.value;
    main.querySelector('#chars').textContent = `${bodyEl.value.length} characters`;
    const extra = ed.querySelector('#tocamp');
    if (extra) extra.remove();
    if (currentId && currentKind === 'newsletter' && isAdmin()) ed.querySelector('.row').insertAdjacentHTML('afterbegin', '<button id="tocamp">📣 Send as email campaign</button>');
    ed.querySelector('#tocamp')?.addEventListener('click', async () => { const r = await act(() => api(`/content/${currentId}/to-campaign`, { method: 'POST' }), 'Campaign draft created'); location.hash = `#/campaigns/${r.campaign_id}`; });
    ed.scrollIntoView({ behavior: 'smooth' });
  };
  bodyEl.oninput = () => (main.querySelector('#chars').textContent = `${bodyEl.value.length} characters`);
  main.querySelector('#gen').onclick = async (e) => {
    e.target.disabled = true; e.target.textContent = 'Writing…';
    try {
      const r = await act(() => api('/content/generate', { method: 'POST', body: { kind: kindSel.value, platform: main.querySelector('#platform').value, topic: main.querySelector('#topic').value, tone: main.querySelector('#tone').value, audience: main.querySelector('#aud').value } }));
      showEditor({ ...r, kind: kindSel.value });
    } finally { e.target.disabled = false; e.target.textContent = '✨ Generate'; }
  };
  const save = async (extra) => {
    const body = { kind: currentKind, platform: main.querySelector('#platform').value, title: main.querySelector('#title').value, body: bodyEl.value, ...extra };
    return currentId ? api(`/content/${currentId}`, { method: 'PATCH', body }) : api('/content', { method: 'POST', body });
  };
  main.querySelector('#copy').onclick = () => navigator.clipboard.writeText(bodyEl.value).then(() => toast('Copied'));
  main.querySelector('#draft').onclick = async () => { await act(() => save({}), 'Saved'); views.studio(main); };
  main.querySelector('#sched').onclick = async () => { const w = main.querySelector('#when').value; if (!w) return toast('Pick a date and time', true); await act(() => save({ scheduled_at: new Date(w).toISOString() }), 'Scheduled'); views.studio(main); };
  main.querySelector('#pub').onclick = async () => {
    const saved = await act(() => save({}));
    await act(() => api(`/content/${saved.id}`, { method: 'PATCH', body: { publish: true } }), 'Published');
    views.studio(main);
  };
  main.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => { const item = items.find((i) => i.id === Number(b.dataset.open)); kindSel.value = item.kind; syncPlatforms(); showEditor(item); }));
};

/* ============================== Integrations hub ============================== */

views.hub = async (main, { query }) => {
  const [h, s] = await Promise.all([api('/hub'), api('/settings')]);
  const ev = Object.entries(h.events);
  const curl = `curl ${h.api_base}/contacts -H "Authorization: Bearer crm_YOUR_KEY"\n\ncurl -X POST ${h.api_base}/contacts -H "Authorization: Bearer crm_YOUR_KEY" -H "Content-Type: application/json" \\\n  -d '{"first_name":"Pat","email":"pat@example.com","phone":"9515550100","source":"Website"}'`;
  main.innerHTML = `<div class="page-head"><h1>🔌 Integrations</h1><span class="sub">Connect your CRM to everything else you use</span></div>
  <div class="grid g4" style="margin-bottom:16px">
    ${[['Texting & calling', s.providers.sms === 'twilio'], ['Email', s.providers.email === 'smtp'], ['AI (Claude)', s.providers.ai === 'claude'], ['Slack', h.slack.connected]].map(([l, on]) => `<div class="card kpi"><div class="l">${l}</div><div style="margin-top:6px"><span class="badge ${on ? 'green' : 'amber'}">${on ? 'connected' : 'not connected'}</span></div></div>`).join('')}
  </div>
  <div class="card" id="sync" style="margin-bottom:16px"><div class="muted small">Loading…</div></div>
  <div class="grid g2" style="margin-bottom:16px">
    <div class="card"><div class="card-head"><h2>Outbound webhooks</h2><span class="spacer"></span><button class="sm primary" id="wh-add">+ Webhook</button></div>
      <p class="small muted" style="margin-top:0">Send CRM events to Zapier, Make, n8n, your LOS, or your own code. Each delivery is signed (<code>X-CRM-Signature: sha256=…</code>) and retried with backoff.</p>
      <ul class="list small">${h.webhooks.map((w) => `<li><div class="row" style="flex-wrap:nowrap"><code style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(w.url)}</code><span class="badge ${w.active ? 'green' : 'gray'}">${w.active ? 'on' : 'off'}</span></div>
        <div class="muted">${esc(w.events.join(', '))} · ✓ ${w.stats.delivered || 0} · ✕ ${w.stats.failed || 0}${w.stats.pending ? ` · ⏳ ${w.stats.pending}` : ''}</div>
        <div class="row" style="margin-top:4px"><button class="sm" data-test="${w.id}">Send test</button><button class="sm" data-toggle="${w.id}" data-on="${w.active}">${w.active ? 'Disable' : 'Enable'}</button><button class="sm danger" data-delwh="${w.id}">Delete</button></div></li>`).join('') || '<li class="muted">No webhooks yet</li>'}</ul>
      ${h.deliveries.length ? `<details><summary class="small">Recent deliveries</summary><ul class="list small">${h.deliveries.map((d) => `<li>${esc(d.event)} · <span class="badge ${d.status === 'delivered' ? 'green' : d.status === 'failed' ? 'red' : 'amber'}">${esc(d.status)}</span> ${d.response_code || ''} ${esc(d.error || '')} <span class="muted">${when(d.created_at)}</span></li>`).join('')}</ul></details>` : ''}</div>
    <div class="card"><div class="card-head"><h2>REST API</h2><span class="spacer"></span><button class="sm primary" id="key-add">+ API key</button></div>
      <p class="small muted" style="margin-top:0">Base URL <code>${esc(h.api_base)}</code>. Endpoints: <code>GET/POST /contacts</code>, <code>GET/PATCH /contacts/:id</code>, <code>POST /contacts/:id/notes</code>, <code>POST /contacts/:id/stage</code>, <code>POST /tasks</code>, <code>POST /workflows/:id/enroll</code>, <code>GET /metrics</code>, <code>POST/DELETE /hooks</code> (Zapier REST hooks), <code>GET /events</code>.</p>
      <ul class="list small">${h.api_keys.map((k) => `<li class="row"><strong>${esc(k.name)}</strong><code>${esc(k.prefix)}…</code><span class="muted">${k.revoked ? 'revoked' : `last used ${when(k.last_used_at) || 'never'}`}</span><span class="spacer"></span>${k.revoked ? '' : `<button class="sm danger" data-revoke="${k.id}">Revoke</button>`}</li>`).join('') || '<li class="muted">No API keys yet</li>'}</ul>
      <details><summary class="small">Example requests</summary><pre class="small" style="white-space:pre-wrap;word-break:break-all">${esc(curl)}</pre></details></div>
  </div>
  <div class="grid g2">
    <div class="card"><h2>Slack</h2><p class="small muted" style="margin-top:0">Get hot-lead handoffs, new leads, and funded loans in a Slack channel. Create an <em>Incoming Webhook</em> in Slack and paste its URL.</p>
      <div class="row"><input id="slack" type="password" placeholder="${h.slack.connected ? 'Connected - paste a new URL to change' : 'https://hooks.slack.com/services/…'}" style="flex:1"><button class="sm primary" id="slack-save">${h.slack.connected ? 'Update' : 'Connect'}</button>${h.slack.connected ? '<button class="sm" id="slack-off">Disconnect</button>' : ''}</div>
      <div class="row small" style="margin-top:8px">${['contact.handoff', 'contact.created', 'loan.funded', 'contact.replied', 'stage.changed', 'form.submitted'].map((e) => `<label class="row" style="gap:4px"><input type="checkbox" data-sev="${e}" ${h.slack.events.includes(e) ? 'checked' : ''}> ${esc(e)}</label>`).join('')}</div></div>
    <div class="card"><h2>Calendar</h2><p class="small muted" style="margin-top:0">Subscribe to your tasks and appointments from Google Calendar (Other calendars → From URL), Outlook (Add calendar → Subscribe from web), or Apple Calendar (File → New Calendar Subscription).</p>
      <div class="row"><input readonly value="${esc(h.calendar_url)}" style="flex:1"><button class="sm" id="cal-copy">Copy</button></div><p class="small muted">This private link is unique to you. Treat it like a password.</p></div>
  </div>`;
  renderSync(main.querySelector('#sync'), s.settings, query.google === 'connected');
  if (query.google === 'connected') toast('Google Contacts connected - syncing now');
  if (query.google_error) toast(`Google: ${query.google_error}`, true);
  const reload = () => views.hub(main, { query: {} });
  main.querySelector('#wh-add').onclick = () => modal(`<h2>New webhook</h2><label class="f">URL<input id="u" placeholder="https://hooks.zapier.com/hooks/catch/…"></label><label class="f" style="margin-top:8px">Description<input id="d" placeholder="e.g. Zapier → Google Sheets"></label>
    <h3 style="margin-top:12px">Events</h3><div class="grid g2 small">${ev.map(([k, d]) => `<label class="row" style="flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" value="${k}"> <span><code>${k}</code><br><span class="muted">${esc(d)}</span></span></label>`).join('')}</div>
    <div class="actions"><button data-close>Cancel</button><button class="primary" id="s">Create</button></div>`, {
    onMount: (m, close) => (m.querySelector('#s').onclick = async () => {
      const r = await act(() => api('/hub/webhooks', { method: 'POST', body: { url: m.querySelector('#u').value, description: m.querySelector('#d').value, events: [...m.querySelectorAll('input[type=checkbox]:checked')].map((x) => x.value) } }));
      close();
      modal(`<h2>Webhook created</h2><p>Signing secret (shown once - store it to verify <code>X-CRM-Signature</code>):</p><pre style="word-break:break-all;white-space:pre-wrap">${esc(r.secret)}</pre><div class="actions"><button class="primary" data-close>Done</button></div>`);
      reload();
    }),
  });
  main.querySelectorAll('[data-test]').forEach((b) => (b.onclick = async () => { const r = await act(() => api(`/hub/webhooks/${b.dataset.test}/test`, { method: 'POST' })); toast(r.status === 'delivered' ? `Delivered (HTTP ${r.response_code})` : `Not delivered: ${r.error || r.status}`, r.status !== 'delivered'); reload(); }));
  main.querySelectorAll('[data-toggle]').forEach((b) => (b.onclick = async () => { await act(() => api(`/hub/webhooks/${b.dataset.toggle}`, { method: 'PATCH', body: { active: b.dataset.on !== '1' } })); reload(); }));
  main.querySelectorAll('[data-delwh]').forEach((b) => (b.onclick = async () => { if (confirm('Delete this webhook?')) { await act(() => api(`/hub/webhooks/${b.dataset.delwh}`, { method: 'DELETE' })); reload(); } }));
  main.querySelector('#key-add').onclick = async () => {
    const nm = prompt('Name this key (e.g. Zapier, Website):');
    if (!nm) return;
    const r = await act(() => api('/hub/api-keys', { method: 'POST', body: { name: nm } }));
    modal(`<h2>API key created</h2><p>Copy it now - it won't be shown again:</p><pre style="word-break:break-all;white-space:pre-wrap">${esc(r.key)}</pre><div class="actions"><button id="c">Copy</button><button class="primary" data-close>Done</button></div>`, { onMount: (m) => (m.querySelector('#c').onclick = () => navigator.clipboard.writeText(r.key).then(() => toast('Copied'))) });
    reload();
  };
  main.querySelectorAll('[data-revoke]').forEach((b) => (b.onclick = async () => { if (confirm('Revoke this key? Anything using it stops working.')) { await act(() => api(`/hub/api-keys/${b.dataset.revoke}`, { method: 'DELETE' })); reload(); } }));
  const slackEvents = () => [...main.querySelectorAll('[data-sev]:checked')].map((x) => x.dataset.sev);
  main.querySelector('#slack-save').onclick = async () => { const url = main.querySelector('#slack').value.trim(); await act(() => api('/hub/slack', { method: 'POST', body: url ? { url, events: slackEvents() } : { events: slackEvents() } }), url ? 'Slack connected - check your channel' : 'Saved'); reload(); };
  main.querySelector('#slack-off')?.addEventListener('click', async () => { await act(() => api('/hub/slack', { method: 'POST', body: { url: '' } }), 'Disconnected'); reload(); });
  main.querySelectorAll('[data-sev]').forEach((cb) => (cb.onchange = () => act(() => api('/hub/slack', { method: 'POST', body: { events: slackEvents() } }), 'Saved')));
  main.querySelector('#cal-copy').onclick = () => navigator.clipboard.writeText(h.calendar_url).then(() => toast('Calendar link copied'));
};

/* ========================== Today + contact additions ========================== */

const baseToday = views.today;
views.today = async (main, ctx) => {
  await baseToday(main, ctx);
  const side = main.querySelector('.grid.side > .grid');
  if (!side) return;
  side.insertAdjacentHTML('afterbegin', '<div class="card" id="coach"><h2>🎯 Coach: next best actions</h2><div class="muted small">Loading…</div></div>');
  const el = side.querySelector('#coach');
  const drawCoach = (c) => {
    el.innerHTML = `<div class="card-head"><h2>🎯 Coach: next best actions</h2><span class="spacer"></span>${c.ai ? `<button class="sm" id="brief">${c.briefing ? 'Refresh' : 'AI briefing'}</button>` : ''}</div>
      ${c.briefing ? `<div class="callout small" style="margin-bottom:10px">${esc(c.briefing)}</div>` : ''}
      ${c.actions.length ? c.actions.map((a) => `<a class="nba" href="${esc(a.link)}" style="color:inherit;text-decoration:none"><span class="ic">${a.icon}</span><span><strong>${esc(a.title)}</strong><div class="small muted">${esc(a.detail)}</div></span><span class="muted">›</span></a>`).join('') : '<div class="muted small">You’re all caught up. Work your call list or build pipeline with a campaign.</div>'}`;
    el.querySelector('#brief')?.addEventListener('click', async (e) => {
      e.target.disabled = true; e.target.textContent = 'Thinking…';
      const r = await act(() => api('/coach/briefing', { method: 'POST' })).catch(() => null);
      drawCoach({ ...c, briefing: r?.briefing || c.briefing });
    });
  };
  drawCoach(await api('/coach'));
};

const baseContact = views.contact;
views.contact = async (main, ctx) => {
  await baseContact(main, ctx);
  const side = main.querySelector('.grid.side > .grid:last-child');
  if (!side) return;
  const [runs, wfs, detail] = await Promise.all([api(`/contacts/${ctx.id}/workflows`), api('/workflows'), api(`/contacts/${ctx.id}`)]);
  const c = detail.contact;
  const partner = c.partner_id ? (state.meta.partners || []).find((p) => p.id === c.partner_id) : null;
  side.insertAdjacentHTML('afterbegin', `${partner ? `<div class="card"><h2>🤝 Referred by</h2><a href="#/partners/${partner.id}"><strong>${esc(partner.name)}</strong></a>${partner.company ? `<div class="small muted">${esc(partner.company)}</div>` : ''}</div>` : ''}
    <div class="card"><h2>🔁 Workflows</h2><ul class="list small">${runs.map((r) => `<li class="row"><a href="#/workflows/${r.workflow_id}">${esc(r.name)}</a>${statusBadge(r.status)}<span class="spacer"></span>${r.status === 'active' ? `<button class="sm ghost" data-stoprun="${r.id}">Stop</button>` : `<span class="muted">${esc(r.exit_reason || '')}</span>`}</li>`).join('') || '<li class="muted">Not in any workflows</li>'}</ul>
    ${wfs.length ? `<div class="row" style="margin-top:8px"><select id="wf-pick" style="flex:1">${wfs.map((w) => `<option value="${w.id}">${esc(w.name)}${w.status !== 'active' ? ` (${w.status})` : ''}</option>`).join('')}</select><button class="sm" id="wf-add">Enroll</button></div>` : ''}</div>`);
  side.querySelector('#wf-add')?.addEventListener('click', async () => {
    const r = await act(() => api(`/workflows/${side.querySelector('#wf-pick').value}/enroll`, { method: 'POST', body: { contact_id: Number(ctx.id) } }));
    toast(r.enrolled ? 'Enrolled' : 'Already in this workflow', !r.enrolled);
    views.contact(main, ctx);
  });
  side.querySelectorAll('[data-stoprun]').forEach((b) => (b.onclick = async () => { await act(() => api(`/workflow-runs/${b.dataset.stoprun}/stop`, { method: 'POST' }), 'Stopped'); views.contact(main, ctx); }));
};

