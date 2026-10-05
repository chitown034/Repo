import { state, esc, api, toast, act, modal, formData, stageLabel, scoreChip, name, money, isAdmin, when, phoneFmt, stageOptions, userOptions, refreshMeta, route } from './app.js';

export const views = {};

const LEAD_TYPES = { purchase: 'Purchase', refinance: 'Refinance', heloc: 'HELOC / Cash-out', past_client: 'Past client', sphere: 'Sphere / referral partner' };
const leadTypeOptions = (sel) => Object.entries(LEAD_TYPES).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v}</option>`).join('');
const ACT_ICON = { sms: '💬', email: '✉️', call: '📞', note: '📝', stage_change: '➡️', score_change: '📈', ai: '✨', system: '⚙️', form: '🧲', campaign: '📣', task: '✅', voicemail: '📼' };

/* ---------------------------------- Auth ----------------------------------- */

views.auth = async (app) => {
  const { needsSetup } = await api('/setup-status');
  app.innerHTML = `<div class="auth"><div class="card">
    <h1>${needsSetup ? 'Set up your CRM' : 'Sign in'}</h1>
    <p class="muted">${needsSetup ? 'Create the owner account for your workspace.' : 'Welcome back.'}</p>
    <form id="f" class="grid" style="gap:12px">
      ${needsSetup ? `<label class="f">Your name<input name="name" required></label><label class="f">Company name<input name="company_name" placeholder="e.g. Pacific Home Loans"></label>` : ''}
      <label class="f">Email<input name="email" type="email" required autocomplete="email"></label>
      <label class="f">Password<input name="password" type="password" required minlength="${needsSetup ? 8 : 1}" autocomplete="${needsSetup ? 'new-password' : 'current-password'}"></label>
      <button class="primary" type="submit">${needsSetup ? 'Create workspace' : 'Sign in'}</button>
    </form></div></div>`;
  app.querySelector('#f').onsubmit = async (e) => {
    e.preventDefault();
    await act(() => api(needsSetup ? '/setup' : '/login', { method: 'POST', body: formData(e.target) }));
    await refreshMeta();
    location.hash = '#/';
    route();
  };
};

/* ---------------------------------- Today ---------------------------------- */

function reasonLine(c) {
  const top = (c.score_reasons || []).filter((r) => r.pts > 0).slice(0, 2).map((r) => r.why);
  return top.length ? esc(top.join(' · ')) : '<span class="muted">No strong signals yet</span>';
}

views.today = async (main) => {
  const d = await api('/dashboard');
  const k = d.kpi;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  main.innerHTML = `
  <div class="page-head"><div><h1>${greeting}, ${esc(state.user.name.split(' ')[0])}</h1><div class="sub">${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · 30-yr market rate set to ${esc(state.meta.settings.market_rate_30yr)}%</div></div></div>
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card kpi"><div class="l">Contacts</div><div class="v">${k.total || 0}</div><div class="small muted">${k.new_7d || 0} new this week</div></div>
    <div class="card kpi"><div class="l">Hot (60+)</div><div class="v" style="color:var(--hot)">${k.hot || 0}</div><div class="small muted">ready to talk</div></div>
    <div class="card kpi"><div class="l">Refi opportunities</div><div class="v">${k.refi_opps || 0}</div><div class="small muted">rate ≥ 0.75% over market</div></div>
    <div class="card kpi"><div class="l">Going cold</div><div class="v">${k.dormant || 0}</div><div class="small muted">no touch in ${esc(state.meta.settings.dormant_days)}+ days</div></div>
  </div>
  <div class="grid side">
    <div class="card flush">
      <div class="card-head" style="padding:16px 16px 0"><h2>📞 Daily call list</h2><span class="muted small">ranked by Ready Score · ${d.callList.length} contacts</span><span class="spacer"></span><a class="btn sm" href="#/contacts">All contacts</a></div>
      ${d.callList.length ? `<div class="table-wrap"><table><thead><tr><th class="hide-sm">#</th><th>Score</th><th>Contact</th><th class="hide-sm">Why now</th><th></th></tr></thead><tbody>
        ${d.callList.map((c, i) => `<tr>
          <td class="muted hide-sm">${i + 1}</td><td>${scoreChip(c.score)}</td>
          <td><a href="#/contacts/${c.id}"><strong>${name(c)}</strong></a><div class="small muted">${esc(LEAD_TYPES[c.lead_type] || c.lead_type || '')} · ${esc(stageLabel(c.stage))}</div></td>
          <td class="small hide-sm">${reasonLine(c)}</td>
          <td style="text-align:right;white-space:nowrap"><a class="btn sm" href="tel:${esc(c.phone_norm)}">Call</a> <button class="sm" data-log="${c.id}">Log</button></td></tr>`).join('')}
      </tbody></table></div>` : '<div class="empty">Nobody on the list - import contacts to get started.</div>'}
    </div>
    <div class="grid" style="align-content:start">
      ${d.pendingDrafts ? `<a class="card callout" href="#/assistant" style="text-decoration:none"><strong>✨ ${d.pendingDrafts} message${d.pendingDrafts > 1 ? 's' : ''} waiting for your approval</strong><div class="small">${esc(state.meta.settings.assistant_name)} drafted follow-ups. Review →</div></a>` : ''}
      <div class="card"><div class="card-head"><h2>✅ Tasks & handoffs</h2><span class="spacer"></span><a class="small" href="#/tasks">All</a></div>
        ${d.tasks.length ? `<ul class="list">${d.tasks.map(taskRow).join('')}</ul>` : '<div class="muted">Nothing due. 🎉</div>'}
      </div>
      <div class="card"><h2>📈 Scores on the move</h2>
        ${d.movers.length ? `<ul class="list">${d.movers.map((c) => `<li class="row"><a href="#/contacts/${c.id}">${name(c)}</a><span class="spacer"></span><span class="small muted">${c.score_prev} →</span> ${scoreChip(c.score)}</li>`).join('')}</ul>` : '<div class="muted small">Scores refresh nightly and whenever contacts engage.</div>'}
      </div>
      <div class="card"><h2>Recent activity</h2><ul class="list">${d.recent.map((a) => `<li class="small"><span>${ACT_ICON[a.type] || '•'}</span> <a href="#/contacts/${a.contact_id}">${name(a)}</a> · ${esc((a.subject || a.body || '').slice(0, 80))} <span class="muted">${when(a.created_at)}</span></li>`).join('') || '<li class="muted">No activity yet</li>'}</ul></div>
    </div>
  </div>`;
  wireTasks(main, () => views.today(main));
  main.querySelectorAll('[data-log]').forEach((b) => (b.onclick = () => logCallModal(Number(b.dataset.log), () => views.today(main))));
};

function taskRow(t) {
  const overdue = t.due_at && new Date(t.due_at.replace(' ', 'T') + (t.due_at.length <= 16 ? '' : 'Z')) < new Date();
  return `<li class="row" style="flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" data-task="${t.id}" ${t.done ? 'checked' : ''} style="margin-top:3px">
    <div style="flex:1;min-width:0"><div ${t.kind === 'handoff' ? 'style="font-weight:700"' : ''}>${esc(t.title)}</div>
    <div class="small muted">${t.contact_id ? `<a href="#/contacts/${t.contact_id}">${name(t)}</a> · ` : ''}${t.due_at ? `<span style="${overdue ? 'color:var(--hot)' : ''}">due ${esc(t.due_at.slice(0, 16).replace('T', ' '))}</span>` : 'no due date'}${t.user_name ? ` · ${esc(t.user_name)}` : ''}</div></div></li>`;
}
function wireTasks(root, reload) {
  root.querySelectorAll('[data-task]').forEach((cb) => (cb.onchange = async () => {
    await act(() => api(`/tasks/${cb.dataset.task}`, { method: 'PATCH', body: { done: cb.checked } }), cb.checked ? 'Task completed' : 'Task reopened');
    reload?.();
  }));
}

function logCallModal(contactId, done) {
  modal(`<h2>Log a call</h2><form id="f" class="form-grid">
    <label class="f">Outcome<select name="outcome"><option value="connected">Connected</option><option value="appointment_set">Appointment set</option><option value="left_voicemail">Left voicemail</option><option value="no_answer">No answer</option><option value="bad_number">Bad number</option></select></label>
    <label class="f">Direction<select name="direction"><option value="out">Outbound</option><option value="in">Inbound</option></select></label>
    <label class="f">Minutes<input name="duration_min" type="number" min="0"></label>
    <label class="f wide">Notes<textarea name="notes" rows="3" placeholder="What did you learn?"></textarea></label>
    <label class="f">Follow-up task<input name="follow_up_title" placeholder="e.g. Send pre-approval"></label>
    <label class="f">Follow-up due<input name="follow_up_at" type="datetime-local"></label>
  </form><div class="actions"><button data-close>Cancel</button><button class="primary" id="save">Save call</button></div>`, {
    onMount: (m, close) => (m.querySelector('#save').onclick = async () => {
      const body = formData(m.querySelector('#f'));
      if (!body.follow_up_title) delete body.follow_up_at;
      await act(() => api(`/contacts/${contactId}/calls`, { method: 'POST', body }), 'Call logged');
      close();
      done?.();
    }),
  });
}

/* -------------------------------- Contacts --------------------------------- */

views.contacts = async (main, { query }) => {
  const filters = { q: query.q || '', stage: query.stage || '', lead_type: query.lead_type || '', owner_id: query.owner_id || '', sort: query.sort || 'score', min_score: query.min_score || '' };
  main.innerHTML = `<div class="page-head"><h1>Contacts</h1><span class="sub" id="count"></span><span class="spacer"></span>
    <button id="import">⬆️ Import</button><a class="btn" href="/api/export.csv">⬇️ Export</a><button class="primary" id="add">+ Add contact</button></div>
    <div class="card" style="margin-bottom:12px"><div class="row">
      <input id="q" placeholder="Search name, email, phone, tag, city…" value="${esc(filters.q)}" style="flex:2;min-width:200px">
      <select id="stage" style="flex:1;min-width:130px"><option value="">All stages</option>${stageOptions(filters.stage)}</select>
      <select id="lead_type" style="flex:1;min-width:130px"><option value="">All types</option>${leadTypeOptions(filters.lead_type)}</select>
      ${isAdmin() ? `<select id="owner_id" style="flex:1;min-width:130px">${userOptions(filters.owner_id, { blank: true })}</select>` : ''}
      <select id="min_score" style="flex:1;min-width:110px"><option value="">Any score</option>${[20, 45, 60, 70].map((s) => `<option value="${s}" ${String(s) === filters.min_score ? 'selected' : ''}>${s}+</option>`).join('')}</select>
      <select id="sort" style="flex:1;min-width:130px">${[['score', 'Highest score'], ['recent', 'Newest'], ['name', 'Name'], ['last_contact', 'Longest untouched'], ['updated', 'Recently updated']].map(([v, l]) => `<option value="${v}" ${v === filters.sort ? 'selected' : ''}>${l}</option>`).join('')}</select>
    </div></div>
    <div class="row" id="bulk" hidden style="margin-bottom:10px"><strong id="selcount"></strong>
      <select id="bulk-stage"><option value="">Move to stage…</option>${stageOptions('')}</select>
      ${isAdmin() ? `<select id="bulk-assign"><option value="">Assign to…</option>${userOptions('')}</select>` : ''}
      <button id="bulk-tag" class="sm">Add tag</button><button id="bulk-pause" class="sm">Pause assistant</button><button id="bulk-resume" class="sm">Resume assistant</button><button id="bulk-vm" class="sm">📼 Drop voicemail</button>
      ${isAdmin() ? '<button id="bulk-del" class="sm danger">Delete</button>' : ''}</div>
    <div class="card flush"><div class="table-wrap" id="tbl"></div></div>`;

  const selected = new Set();
  const load = async () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    const { total, contacts } = await api(`/contacts?${params}&limit=200`);
    main.querySelector('#count').textContent = `${total.toLocaleString()} total`;
    main.querySelector('#tbl').innerHTML = contacts.length ? `<table><thead><tr><th><input type="checkbox" id="all"></th><th>Score</th><th>Name</th><th>Stage</th><th>Type</th><th>Phone / Email</th><th>Owner</th><th>Last touch</th></tr></thead><tbody>
      ${contacts.map((c) => `<tr><td><input type="checkbox" data-sel="${c.id}" ${selected.has(c.id) ? 'checked' : ''}></td><td>${scoreChip(c.score)}</td>
        <td><a href="#/contacts/${c.id}"><strong>${name(c)}</strong></a>${c.ai_paused ? ' <span class="badge gray" title="Assistant paused">⏸</span>' : ''}${c.opted_out_sms || c.dnc ? ' <span class="badge red">opted out</span>' : ''}<div class="small muted">${esc(c.tags.join(', '))}</div></td>
        <td><span class="badge">${esc(stageLabel(c.stage))}</span></td><td class="small">${esc(LEAD_TYPES[c.lead_type] || c.lead_type || '')}</td>
        <td class="small">${esc(phoneFmt(c.phone_norm) || c.phone || '')}<div class="muted">${esc(c.email || '')}</div></td>
        <td class="small">${esc(c.owner_name || '')}</td><td class="small muted">${when(c.last_contacted_at) || 'never'}</td></tr>`).join('')}
      </tbody></table>` : '<div class="empty">No contacts match. Try clearing filters or import your database.</div>';
    main.querySelectorAll('[data-sel]').forEach((cb) => (cb.onchange = () => { cb.checked ? selected.add(Number(cb.dataset.sel)) : selected.delete(Number(cb.dataset.sel)); syncBulk(); }));
    const all = main.querySelector('#all');
    if (all) all.onchange = () => { main.querySelectorAll('[data-sel]').forEach((cb) => { cb.checked = all.checked; all.checked ? selected.add(Number(cb.dataset.sel)) : selected.delete(Number(cb.dataset.sel)); }); syncBulk(); };
  };
  const syncBulk = () => {
    main.querySelector('#bulk').hidden = !selected.size;
    main.querySelector('#selcount').textContent = `${selected.size} selected`;
  };
  const bulk = async (action, value) => {
    await act(() => api('/contacts/bulk', { method: 'POST', body: { ids: [...selected], action, value } }), (r) => `Updated ${r.updated} contacts`);
    selected.clear();
    syncBulk();
    load();
  };
  let t;
  main.querySelector('#q').oninput = (e) => { clearTimeout(t); t = setTimeout(() => { filters.q = e.target.value; load(); }, 250); };
  for (const id of ['stage', 'lead_type', 'owner_id', 'min_score', 'sort']) {
    const el = main.querySelector(`#${id}`);
    if (el) el.onchange = () => { filters[id] = el.value; load(); };
  }
  main.querySelector('#bulk-stage').onchange = (e) => e.target.value && bulk('stage', e.target.value);
  main.querySelector('#bulk-assign')?.addEventListener('change', (e) => e.target.value && bulk('assign', e.target.value));
  main.querySelector('#bulk-tag').onclick = () => { const tag = prompt('Tag to add:'); if (tag) bulk('tag', tag.trim()); };
  main.querySelector('#bulk-pause').onclick = () => bulk('pause_ai', 1);
  main.querySelector('#bulk-vm').onclick = async () => {
    const drops = await api('/voicemail-drops');
    if (!drops.length) return toast('Create a voicemail in Settings first', true);
    modal(`<h2>Drop a voicemail to ${selected.size} contacts</h2>
      <label class="f">Voicemail<select id="d">${drops.map((dr) => `<option value="${dr.id}">${esc(dr.name)}</option>`).join('')}</select></label>
      <p class="small muted">Contacts who opted out, are marked Do Not Contact, or have no valid phone are skipped. Drops don't run during quiet hours. Prerecorded calls to cell phones generally require prior express written consent - only use this for contacts who gave it.</p>
      <div class="actions"><button data-close>Cancel</button><button class="primary" id="go">Drop voicemails</button></div>`, {
      onMount: (m, close) => (m.querySelector('#go').onclick = async () => {
        m.querySelector('#go').disabled = true;
        const r = await act(() => api('/voicemail/bulk', { method: 'POST', body: { ids: [...selected], drop_id: Number(m.querySelector('#d').value) } }));
        close();
        toast(`${r.queued} voicemail${r.queued === 1 ? '' : 's'} sent${r.skipped.length ? ` · ${r.skipped.length} skipped (${r.skipped[0].reason})` : ''}`);
        selected.clear();
        syncBulk();
        load();
      }),
    });
  };
  main.querySelector('#bulk-resume').onclick = () => bulk('pause_ai', 0);
  main.querySelector('#bulk-del')?.addEventListener('click', () => confirm(`Delete ${selected.size} contacts permanently?`) && bulk('delete'));
  main.querySelector('#add').onclick = () => contactForm(null, (c) => (location.hash = `#/contacts/${c.id}`));
  main.querySelector('#import').onclick = () => importModal(load);
  await load();
};

function contactFields(c = {}) {
  const v = (k) => esc(c[k] ?? '');
  const chk = (k, label) => `<label class="f row" style="font-weight:500"><input type="checkbox" name="${k}" ${c[k] ? 'checked' : ''}> ${label}</label>`;
  return `<div class="form-grid">
    <label class="f">First name<input name="first_name" value="${v('first_name')}"></label>
    <label class="f">Last name<input name="last_name" value="${v('last_name')}"></label>
    <label class="f">Mobile phone<input name="phone" value="${v('phone')}"></label>
    <label class="f">Email<input name="email" type="email" value="${v('email')}"></label>
    <label class="f">Lead type<select name="lead_type">${leadTypeOptions(c.lead_type || 'purchase')}</select></label>
    <label class="f">Source<input name="source" value="${v('source')}" placeholder="Zillow, referral…"></label>
    ${isAdmin() ? `<label class="f">Owner<select name="owner_id"><option value="">Auto-route</option>${userOptions(c.owner_id)}</select></label>` : ''}
    <label class="f">Tags<input name="tags" value="${esc((c.tags || []).join?.(', ') ?? c.tags ?? '')}" placeholder="comma, separated"></label>
    <label class="f">Address<input name="address" value="${v('address')}"></label>
    <label class="f">City<input name="city" value="${v('city')}"></label>
    <label class="f">State<input name="state" value="${v('state')}" maxlength="2"></label>
    <label class="f">ZIP<input name="zip" value="${v('zip')}"></label>
    <div class="wide"><h3 style="margin-top:6px">Loan details</h3></div>
    <label class="f">Loan type<select name="loan_type">${['', 'Conventional', 'FHA', 'VA', 'USDA', 'Jumbo', 'Non-QM', 'Not sure'].map((o) => `<option ${o === (c.loan_type || '') ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
    <label class="f">Property value<input name="property_value" inputmode="decimal" value="${v('property_value')}"></label>
    <label class="f">Loan amount / balance<input name="loan_amount" inputmode="decimal" value="${v('loan_amount')}"></label>
    <label class="f">Current rate (%)<input name="current_rate" inputmode="decimal" value="${v('current_rate')}"></label>
    <label class="f">Loan funded date<input name="loan_close_date" type="date" value="${v('loan_close_date')}"></label>
    <label class="f">Purchase timeline<select name="purchase_timeline">${['', 'ASAP', '1-3 months', '3-6 months', '6-12 months', 'Just exploring'].map((o) => `<option ${o === (c.purchase_timeline || '') ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
    <label class="f">Credit<select name="credit_band">${['', 'Excellent (740+)', 'Good (700-739)', 'Fair (640-699)', 'Building (<640)'].map((o) => `<option ${o === (c.credit_band || '') ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
    <label class="f">Annual income<input name="annual_income" inputmode="decimal" value="${v('annual_income')}"></label>
    ${chk('preapproved', 'Pre-approved')}${chk('is_veteran', 'Veteran / VA eligible')}${chk('first_time_buyer', 'First-time buyer')}
    ${c.id ? `<div class="wide"><h3 style="margin-top:6px">Communication</h3></div>${chk('opted_out_sms', 'Opted out of texts')}${chk('opted_out_email', 'Unsubscribed from email')}${chk('dnc', 'Do not contact')}` : ''}
  </div>`;
}

function contactForm(c, done) {
  modal(`<h2>${c ? 'Edit contact' : 'New contact'}</h2><form id="f">${contactFields(c || {})}</form>
    <div class="actions"><button data-close>Cancel</button><button class="primary" id="save">Save</button></div>`, {
    wide: true,
    onMount: (m, close) => (m.querySelector('#save').onclick = async () => {
      const body = formData(m.querySelector('#f'));
      if (body.owner_id === '') delete body.owner_id;
      const r = await act(() => (c ? api(`/contacts/${c.id}`, { method: 'PATCH', body }) : api('/contacts', { method: 'POST', body })), (r) => (c ? 'Saved' : r.created ? 'Contact created' : 'Matched an existing contact - merged details'));
      close();
      done?.(r.contact);
    }),
  });
}

function importModal(done) {
  modal(`<h2>Import contacts</h2>
    <p class="muted">Upload a CSV from Google Contacts, Outlook, your LOS, another CRM, or a spreadsheet. Duplicates are matched by email or phone and merged - nothing you already have gets overwritten.</p>
    <input type="file" id="file" accept=".csv,text/csv"><div id="step2"></div>
    <div class="actions"><button data-close>Cancel</button><button class="primary" id="go" disabled>Import</button></div>`, {
    wide: true,
    onMount: (m, close) => {
      let csv = '';
      m.querySelector('#file').onchange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        csv = await f.text();
        const p = await act(() => api('/import/preview', { method: 'POST', body: { csv } }));
        m.querySelector('#step2').innerHTML = `<p><strong>${p.rows.toLocaleString()} rows found.</strong> Check how columns map to CRM fields:</p>
          <div class="table-wrap"><table><thead><tr><th>Your column</th><th>Maps to</th><th>Example</th></tr></thead><tbody>
          ${p.headers.map((h) => `<tr><td>${esc(h)}</td><td><select data-col="${esc(h)}"><option value="">- skip -</option>${p.fields.map((f) => `<option value="${f}" ${p.mapping[h] === f ? 'selected' : ''}>${f}</option>`).join('')}</select></td><td class="small muted">${esc(p.sample[0]?.[h] || '')}</td></tr>`).join('')}
          </tbody></table></div>
          <div class="form-grid" style="margin-top:12px"><label class="f">Source for these contacts<input id="d-source" placeholder="e.g. Old CRM export"></label>
          <label class="f">Lead type (if not in file)<select id="d-type"><option value="">From file / purchase</option>${leadTypeOptions('')}</select></label>
          <label class="f">Add tag to all<input id="d-tags" placeholder="e.g. import-2026"></label></div>`;
        m.querySelector('#go').disabled = false;
      };
      m.querySelector('#go').onclick = async () => {
        const mapping = {};
        m.querySelectorAll('[data-col]').forEach((s) => s.value && (mapping[s.dataset.col] = s.value));
        const defaults = { source: m.querySelector('#d-source').value || 'import', tags: m.querySelector('#d-tags').value };
        if (m.querySelector('#d-type').value) defaults.lead_type = m.querySelector('#d-type').value;
        m.querySelector('#go').disabled = true;
        m.querySelector('#go').textContent = 'Importing…';
        const r = await act(() => api('/import', { method: 'POST', body: { csv, mapping, defaults } }));
        close();
        modal(`<h2>Import complete</h2><p>✅ ${r.created} new contacts · 🔁 ${r.merged} merged into existing · ⚠️ ${r.skipped} skipped</p>
          ${r.errors.length ? `<pre class="small">${esc(r.errors.join('\n'))}</pre>` : ''}<p class="muted">Every contact has been scored. Check your Daily Call List.</p>
          <div class="actions"><button class="primary" data-close>Done</button></div>`);
        done?.();
      };
    },
  });
}

/* ------------------------------ Contact detail ----------------------------- */

function sparkline(history) {
  if (history.length < 2) return '';
  const pts = history.slice(-30).map((h) => h.score);
  const w = 300, hgt = 48, step = w / (pts.length - 1);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(hgt - 4 - (p / 100) * (hgt - 8)).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${hgt}" preserveAspectRatio="none" aria-label="Score history"><path d="${path}" fill="none" stroke="var(--brand)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}

function activityItem(a) {
  const isMsg = ['sms', 'email'].includes(a.type);
  const label = { sms: 'Text', email: 'Email', call: 'Call', note: 'Note', stage_change: 'Stage', score_change: 'Score', ai: state.meta.settings.assistant_name, system: 'System', form: 'Form', campaign: 'Campaign', task: 'Task', voicemail: 'Voicemail' }[a.type] || a.type;
  const who = a.direction === 'in' ? 'from contact' : a.user_name ? `by ${a.user_name}` : a.meta?.source === 'ai' ? `by ${state.meta.settings.assistant_name}` : a.meta?.source === 'campaign' ? 'campaign' : '';
  const extra = [a.meta?.outcome && a.meta.outcome.replace(/_/g, ' '), a.meta?.simulated && 'simulated - no provider configured'].filter(Boolean).join(' · ');
  return `<li class="${a.direction || ''} ${isMsg ? 'msg' : ''}"><div class="ic">${ACT_ICON[a.type] || '•'}</div><div>
    <div class="meta"><strong>${esc(label)}</strong> ${a.direction === 'in' ? '⬅' : a.direction === 'out' ? '➡' : ''} ${esc(who)} · ${when(a.created_at)}${extra ? ` · <em>${esc(extra)}</em>` : ''}</div>
    ${a.subject ? `<div><strong>${esc(a.subject)}</strong></div>` : ''}${a.body ? `<div class="bubble">${esc(a.body)}</div>` : ''}</div></li>`;
}

views.contact = async (main, { id }) => {
  const d = await api(`/contacts/${id}`);
  const c = d.contact;
  const s = state.meta.settings;
  const ltv = c.property_value && c.loan_amount ? Math.round((c.loan_amount / c.property_value) * 100) : null;
  const gap = c.current_rate ? (c.current_rate - Number(s.market_rate_30yr)).toFixed(2) : null;
  main.innerHTML = `
  <div class="page-head"><a href="#/contacts" class="btn sm">←</a><div><h1>${name(c)} ${scoreChip(c.score)}</h1>
    <div class="sub">${esc(LEAD_TYPES[c.lead_type] || c.lead_type || '')} · ${esc(c.source || 'unknown source')} · added ${when(c.created_at)} · owner ${esc(d.owner?.name || 'unassigned')}</div></div>
    <span class="spacer"></span>
    <select id="stage" style="width:auto">${stageOptions(c.stage)}</select>
    <button id="edit">Edit</button></div>
  <div class="grid side">
    <div class="grid" style="align-content:start">
      <div class="card">
        <div class="tabs" id="ctabs"><button data-ch="sms" class="on">💬 Text</button><button data-ch="email">✉️ Email</button><button data-ch="call">📞 Call</button><button data-ch="note">📝 Note</button><button data-ch="inbound">⬅ Log reply</button><button data-ch="task">✅ Task</button></div>
        <div id="composer"></div>
      </div>
      ${d.drafts.map((dr) => draftCard(dr, false)).join('')}
      <div class="card"><h2>Timeline</h2><ul class="timeline">${d.activities.map(activityItem).join('') || '<li class="muted">No activity yet</li>'}</ul></div>
    </div>
    <div class="grid" style="align-content:start">
      <div class="card">
        <div class="card-head"><h2>Ready Score</h2><span class="spacer"></span>${scoreChip(c.score)}</div>
        ${sparkline(d.history)}
        <ul class="reasons">${c.score_reasons.map((r) => `<li><span class="pts ${r.pts ? '' : 'zero'}">${r.pts ? `+${r.pts}` : '•'}</span><span>${esc(r.why)}</span></li>`).join('') || '<li class="muted">No signals yet. Add loan details or engagement to score this contact.</li>'}</ul>
      </div>
      <div class="card">
        <div class="card-head"><h2>✨ ${esc(s.assistant_name)}</h2><span class="spacer"></span>
          <div class="pill-toggle"><button id="ai-on" class="${c.ai_paused ? '' : 'on'}">Active</button><button id="ai-off" class="${c.ai_paused ? 'on' : ''}">Paused</button></div></div>
        <p class="small muted" style="margin-top:0">${c.ai_paused ? 'You have taken over this conversation. The assistant will not reach out until you resume it.' : `Mode: <strong>${esc(s.assistant_mode)}</strong>. Sending a manual message automatically pauses the assistant.`}</p>
        <button id="ai-draft" class="sm">Draft a message now</button>
        ${c.facts.length ? `<h3 style="margin-top:14px">What we know</h3><ul class="small" style="margin:0;padding-left:18px">${c.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="card"><h2>Contact</h2>
        <div class="small" style="display:grid;gap:6px">
          <div>📱 ${c.phone_norm ? `<a href="tel:${esc(c.phone_norm)}">${esc(phoneFmt(c.phone_norm))}</a>` : '<span class="muted">no phone</span>'} ${c.opted_out_sms ? '<span class="badge red">STOP</span>' : ''}</div>
          <div>✉️ ${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : '<span class="muted">no email</span>'} ${c.opted_out_email ? '<span class="badge red">unsubscribed</span>' : ''}</div>
          ${c.address || c.city ? `<div>📍 ${esc([c.address, c.city, c.state, c.zip].filter(Boolean).join(', '))}</div>` : ''}
          ${c.dnc ? '<div><span class="badge red">DO NOT CONTACT</span></div>' : ''}
          ${c.tags.length ? `<div>${c.tags.map((t) => `<span class="badge gray">${esc(t)}</span>`).join(' ')}</div>` : ''}
          <div class="muted">Last outbound ${when(c.last_contacted_at) || 'never'} · last reply ${when(c.last_inbound_at) || 'never'}</div>
        </div></div>
      <div class="card"><h2>Loan</h2><div class="small" style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px">
        ${[['Loan type', c.loan_type], ['Property value', money(c.property_value)], ['Balance', money(c.loan_amount)], ['LTV', ltv != null ? `${ltv}%` : ''], ['Rate', c.current_rate ? `${c.current_rate}% ${gap > 0 ? `<span class="badge ${gap >= 0.75 ? 'green' : 'amber'}">+${gap} vs market</span>` : ''}` : ''], ['Funded', c.loan_close_date], ['Timeline', c.purchase_timeline], ['Credit', c.credit_band], ['Pre-approved', c.preapproved ? 'Yes' : ''], ['Veteran', c.is_veteran ? 'Yes' : ''], ['First-time buyer', c.first_time_buyer ? 'Yes' : '']]
          .filter(([, v]) => v).map(([k, v]) => `<span class="muted">${k}</span><span>${k === 'Rate' ? v : esc(v)}</span>`).join('') || '<span class="muted">No loan details yet</span>'}
      </div></div>
      ${propertyCard(c)}
      <div class="card"><h2>Tasks</h2><ul class="list">${d.tasks.map(taskRow).join('') || '<li class="muted small">No tasks</li>'}</ul></div>
      ${d.campaigns.length ? `<div class="card"><h2>Campaigns</h2><ul class="list small">${d.campaigns.map((cs) => `<li>${esc(cs.name)} <span class="badge gray">${esc(cs.channel)}</span> <span class="muted">${esc(cs.status)}${cs.opened_at ? ' · opened' : ''}${cs.clicked_at ? ' · clicked' : ''}${cs.replied_at ? ' · replied' : ''}</span></li>`).join('')}</ul></div>` : ''}
      ${isAdmin() ? '<button class="danger sm" id="del" style="justify-self:start">Delete contact</button>' : ''}
    </div>
  </div>`;

  const reload = () => views.contact(main, { id });
  wireTasks(main, reload);
  wireDrafts(main, reload);
  main.querySelector('#stage').onchange = async (e) => { await act(() => api(`/contacts/${id}/stage`, { method: 'POST', body: { stage: e.target.value } }), `Moved to ${stageLabel(e.target.value)}`); reload(); };
  main.querySelector('#edit').onclick = () => contactForm(c, reload);
  main.querySelector('#ai-on').onclick = async () => { await act(() => api(`/contacts/${id}`, { method: 'PATCH', body: { ai_paused: 0 } }), 'Assistant resumed'); reload(); };
  main.querySelector('#ai-off').onclick = async () => { await act(() => api(`/contacts/${id}`, { method: 'PATCH', body: { ai_paused: 1 } }), 'Assistant paused'); reload(); };
  main.querySelector('#ai-draft').onclick = async (e) => {
    e.target.disabled = true;
    e.target.textContent = 'Drafting…';
    try { await act(() => api(`/contacts/${id}/ai-draft`, { method: 'POST', body: {} }), s.assistant_mode === 'autonomous' ? 'Drafted and queued to send' : 'Draft ready for review'); } finally { reload(); }
  };
  main.querySelector('#del')?.addEventListener('click', async () => {
    if (!confirm('Delete this contact and all history? This cannot be undone.')) return;
    await act(() => api(`/contacts/${id}`, { method: 'DELETE' }), 'Deleted');
    location.hash = '#/contacts';
  });

  const composer = main.querySelector('#composer');
  const renderComposer = (ch) => {
    main.querySelectorAll('#ctabs button').forEach((b) => b.classList.toggle('on', b.dataset.ch === ch));
    if (ch === 'sms') composer.innerHTML = `<textarea id="body" rows="3" placeholder="Text ${esc(c.first_name || '')}…" ${c.opted_out_sms ? 'disabled' : ''}></textarea><div class="row" style="margin-top:8px"><span class="small muted" id="cnt">0 / 160</span><span class="spacer"></span><button class="primary" id="send" ${c.opted_out_sms || !c.phone_norm ? 'disabled' : ''}>Send text</button></div>${c.opted_out_sms ? '<p class="small" style="color:var(--hot)">This contact replied STOP. Texting is blocked.</p>' : ''}`;
    else if (ch === 'email') composer.innerHTML = `<input id="subject" placeholder="Subject"><textarea id="body" rows="5" placeholder="Write your email…" style="margin-top:8px"></textarea><div class="row" style="margin-top:8px"><span class="small muted">Signature, NMLS, and unsubscribe link are added automatically.</span><span class="spacer"></span><button class="primary" id="send" ${c.opted_out_email || !c.email_norm ? 'disabled' : ''}>Send email</button></div>`;
    else if (ch === 'call') composer.innerHTML = `<div class="row"><button class="primary" id="dial">📞 Call ${esc(phoneFmt(c.phone_norm) || '')}</button><button id="logcall">Log a call</button><span class="small muted">${state.meta.providers.voice === 'twilio' ? 'Click-to-call rings your phone, then connects from your business number.' : 'Calling uses your device. Connect Twilio in Settings for click-to-call from your business line.'}</span></div>
      <div class="row" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)"><strong class="small">📼 Voicemail drop</strong><select id="vm-drop" style="width:auto;min-width:200px"><option value="">Loading…</option></select><button id="vm-send" ${c.dnc || c.opted_out_sms || !c.phone_norm ? 'disabled' : ''}>Drop voicemail</button><span class="small muted">Leaves your recorded message if voicemail answers; connects to you if a person picks up.</span></div>`;
    else if (ch === 'note') composer.innerHTML = `<textarea id="body" rows="3" placeholder="Add a note…"></textarea><div class="row" style="margin-top:8px"><span class="spacer"></span><button class="primary" id="save-note">Save note</button></div>`;
    else if (ch === 'inbound') composer.innerHTML = `<p class="small muted" style="margin-top:0">Got a reply on another device? Log it here and ${esc(s.assistant_name)} will read it, learn from it, and draft the next step (or hand off to you if they're warm).</p><div class="row"><select id="ich" style="width:auto"><option value="sms">Text</option><option value="email">Email</option></select></div><textarea id="body" rows="3" placeholder="Paste what they said…" style="margin-top:8px"></textarea><div class="row" style="margin-top:8px"><span class="spacer"></span><button class="primary" id="log-in">Log reply</button></div>`;
    else if (ch === 'task') composer.innerHTML = `<div class="form-grid"><label class="f wide">Task<input id="ttitle" placeholder="e.g. Send pre-approval letter"></label><label class="f">Due<input id="tdue" type="datetime-local"></label>${isAdmin() ? `<label class="f">Assign to<select id="tuser">${userOptions(c.owner_id || state.user.id)}</select></label>` : ''}</div><div class="row" style="margin-top:8px"><span class="spacer"></span><button class="primary" id="add-task">Add task</button></div>`;

    const body = composer.querySelector('#body');
    if (body && composer.querySelector('#cnt')) body.oninput = () => (composer.querySelector('#cnt').textContent = `${body.value.length} / 160`);
    composer.querySelector('#send')?.addEventListener('click', async () => {
      const payload = { channel: ch, body: body.value, subject: composer.querySelector('#subject')?.value };
      const r = await act(() => api(`/contacts/${id}/messages`, { method: 'POST', body: payload }));
      toast(r.simulated ? 'Logged (simulated - connect a provider in Settings to actually send)' : 'Sent');
      reload();
    });
    composer.querySelector('#dial')?.addEventListener('click', async () => {
      const r = await act(() => api(`/contacts/${id}/call`, { method: 'POST' }));
      if (r.simulated) location.href = `tel:${r.dial}`;
      else toast('Calling your phone now…');
      setTimeout(() => logCallModal(Number(id), reload), 800);
    });
    composer.querySelector('#logcall')?.addEventListener('click', () => logCallModal(Number(id), reload));
    const vmSel = composer.querySelector('#vm-drop');
    if (vmSel) {
      api('/voicemail-drops').then((drops) => {
        vmSel.innerHTML = drops.length ? drops.map((dr) => `<option value="${dr.id}">${esc(dr.name)}</option>`).join('') : '<option value="">No voicemails yet - add one in Settings</option>';
        if (!drops.length) composer.querySelector('#vm-send').disabled = true;
      });
      composer.querySelector('#vm-send').onclick = async () => {
        const r = await act(() => api(`/contacts/${id}/voicemail`, { method: 'POST', body: { drop_id: Number(vmSel.value) } }));
        toast(r.simulated ? 'Logged (simulated - connect Twilio to place real calls)' : 'Calling - the voicemail will be left automatically');
        reload();
      };
    }
    composer.querySelector('#save-note')?.addEventListener('click', async () => { await act(() => api(`/contacts/${id}/notes`, { method: 'POST', body: { body: body.value } }), 'Note saved'); reload(); });
    composer.querySelector('#log-in')?.addEventListener('click', async (e) => {
      e.target.disabled = true;
      e.target.textContent = 'Analyzing…';
      try {
        const r = await act(() => api(`/contacts/${id}/inbound`, { method: 'POST', body: { channel: composer.querySelector('#ich').value, body: body.value } }));
        const intent = r.analysis?.intent;
        toast(intent === 'warm' ? '🔥 Warm! Handoff task created for you.' : intent === 'opt_out' ? 'Opted out - all automated outreach stopped.' : `Logged · intent: ${intent || 'n/a'}`);
      } finally { reload(); }
    });
    composer.querySelector('#add-task')?.addEventListener('click', async () => {
      await act(() => api(`/contacts/${id}/tasks`, { method: 'POST', body: { title: composer.querySelector('#ttitle').value, due_at: composer.querySelector('#tdue').value || null, user_id: composer.querySelector('#tuser')?.value } }), 'Task added');
      reload();
    });
  };
  main.querySelectorAll('#ctabs button').forEach((b) => (b.onclick = () => renderComposer(b.dataset.ch)));
  renderComposer(c.phone_norm && !c.opted_out_sms ? 'sms' : 'email');
};

/* -------------------------------- Pipeline --------------------------------- */

views.pipeline = async (main, { query }) => {
  const owner = query.owner_id || '';
  const { contacts } = await api(`/contacts?limit=500&sort=score${owner ? `&owner_id=${owner}` : ''}`);
  const byStage = Object.fromEntries(state.meta.stages.map((s) => [s.key, []]));
  for (const c of contacts) (byStage[c.stage] ||= []).push(c);
  main.innerHTML = `<div class="page-head"><h1>Pipeline</h1><span class="sub">Drag cards between stages. Replies, calls, and funded loans move cards automatically.</span><span class="spacer"></span>
    ${isAdmin() ? `<select id="owner" style="width:auto">${userOptions(owner, { blank: true })}</select>` : ''}</div>
    <div class="board">${state.meta.stages.map((s) => {
      const list = byStage[s.key];
      const vol = list.reduce((a, c) => a + (c.loan_amount || 0), 0);
      return `<div class="col" data-stage="${s.key}"><div class="col-head"><span>${esc(s.label)}</span><span class="muted small">${list.length}${vol ? ` · ${money(vol)}` : ''}</span></div>
        ${list.slice(0, 150).map((c) => `<div class="deal" draggable="true" data-id="${c.id}"><div class="row" style="flex-wrap:nowrap"><a class="nm" href="#/contacts/${c.id}">${name(c)}</a><span class="spacer"></span>${scoreChip(c.score)}</div>
          <div class="small muted">${esc(LEAD_TYPES[c.lead_type] || '')}${c.loan_amount ? ` · ${money(c.loan_amount)}` : ''}</div>
          <div class="small muted">${esc(c.owner_name || '')} · ${when(c.stage_changed_at)}</div></div>`).join('')}
        ${list.length > 150 ? `<div class="small muted">+${list.length - 150} more</div>` : ''}</div>`;
    }).join('')}</div>`;
  main.querySelector('#owner')?.addEventListener('change', (e) => (location.hash = `#/pipeline${e.target.value ? `?owner_id=${e.target.value}` : ''}`));
  let dragId = null;
  main.querySelectorAll('.deal').forEach((el) => {
    el.addEventListener('dragstart', (e) => { dragId = el.dataset.id; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
  });
  main.querySelectorAll('.col').forEach((col) => {
    col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drop'); });
    col.addEventListener('dragleave', () => col.classList.remove('drop'));
    col.addEventListener('drop', async (e) => {
      e.preventDefault();
      col.classList.remove('drop');
      const card = main.querySelector(`.deal[data-id="${dragId}"]`);
      if (!card || card.parentElement === col) return;
      col.insertBefore(card, col.children[1] || null);
      await act(() => api(`/contacts/${dragId}/stage`, { method: 'POST', body: { stage: col.dataset.stage } }), `Moved to ${stageLabel(col.dataset.stage)}`).catch(() => views.pipeline(main, { query }));
      main.querySelectorAll('.col').forEach((c) => (c.querySelector('.col-head .small').textContent = `${c.querySelectorAll('.deal').length}`));
    });
  });
};

/* -------------------------------- Assistant -------------------------------- */

function draftCard(d, showContact = true) {
  return `<div class="draft" data-draft="${d.id}">
    <div class="row"><strong>✨ ${d.channel === 'sms' ? '💬 Text' : '✉️ Email'} draft</strong>${showContact ? ` to <a href="#/contacts/${d.contact_id}">${name(d)}</a> ${scoreChip(d.score)}` : ''}<span class="spacer"></span><span class="small muted">${when(d.created_at)}</span></div>
    <div class="small muted" style="margin-top:4px">Why: ${esc(d.reason || '')}</div>
    ${d.channel === 'email' ? `<input class="d-subject" value="${esc(d.subject || '')}" style="margin-top:8px">` : ''}
    <textarea class="d-body">${esc(d.body)}</textarea>
    <div class="row" style="margin-top:8px"><span class="spacer"></span><button class="sm d-reject">Discard</button><button class="sm primary d-approve">Approve & send</button></div></div>`;
}
function wireDrafts(root, reload) {
  root.querySelectorAll('[data-draft]').forEach((el) => {
    const id = el.dataset.draft;
    el.querySelector('.d-approve').onclick = async () => {
      await act(() => api(`/ai/drafts/${id}/approve`, { method: 'POST', body: { body: el.querySelector('.d-body').value, subject: el.querySelector('.d-subject')?.value } }), 'Approved - queued to send');
      el.remove();
      reload?.();
    };
    el.querySelector('.d-reject').onclick = async () => {
      await act(() => api(`/ai/drafts/${id}/reject`, { method: 'POST' }), 'Discarded');
      el.remove();
      reload?.();
    };
  });
}

views.assistant = async (main) => {
  const s = state.meta.settings;
  const [drafts, status] = await Promise.all([api('/ai/drafts'), api('/ai/status')]);
  main.innerHTML = `<div class="page-head"><h1>✨ ${esc(s.assistant_name)}</h1><span class="sub">Your always-on follow-up assistant</span><span class="spacer"></span>${isAdmin() ? '<button id="scan">Scan database now</button>' : ''}</div>
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card kpi"><div class="l">Awaiting approval</div><div class="v">${drafts.length}</div></div>
    <div class="card kpi"><div class="l">Sent (7 days)</div><div class="v">${status.sent_7d}</div></div>
    <div class="card kpi"><div class="l">Warm handoffs (7 days)</div><div class="v" style="color:var(--hot)">${status.handoffs_7d}</div></div>
    <div class="card kpi"><div class="l">Queued to deliver</div><div class="v">${status.queued}</div><div class="small muted">texts wait for quiet hours to end</div></div>
  </div>
  <div class="grid side">
    <div><h2>Approval queue</h2><div id="drafts">${drafts.map((d) => draftCard(d)).join('') || '<div class="card empty">All caught up. New drafts appear when scores rise, leads come in, contacts go quiet, or someone replies.</div>'}</div></div>
    <div class="grid" style="align-content:start">
      <div class="card"><h2>How much runs on its own</h2>
        ${isAdmin() ? `<div class="pill-toggle" id="mode">${[['off', 'Off'], ['approval', 'Approve first'], ['autonomous', 'Autonomous']].map(([k, l]) => `<button data-mode="${k}" class="${s.assistant_mode === k ? 'on' : ''}">${l}</button>`).join('')}</div>` : `<strong>${esc(s.assistant_mode)}</strong>`}
        <p class="small muted">${s.assistant_mode === 'autonomous' ? 'Messages send automatically within quiet-hour rules.' : s.assistant_mode === 'approval' ? 'Every message waits for your OK before it goes out.' : 'The assistant is off. No drafts will be created.'}</p>
        <p class="small">AI engine: <strong>${status.enabled ? 'Claude' : 'Built-in templates'}</strong>${status.enabled ? '' : ' - set <code>ANTHROPIC_API_KEY</code> for personalized, context-aware messages.'}</p>
        <p class="small muted">${status.paused} contacts are paused (human takeover, handoff, or wrong number).</p></div>
      <div class="card"><h2>What it does</h2><ul class="small" style="padding-left:18px;margin:0;display:grid;gap:6px">
        <li><strong>Speed to lead:</strong> drafts a first touch for new leads nobody has contacted within ${esc(s.speed_to_lead_minutes)} minutes.</li>
        <li><strong>Finds who's ready:</strong> reaches out when a Ready Score jumps 10+ points (rate gap, equity, engagement).</li>
        <li><strong>Revives cold contacts:</strong> re-engages anyone untouched for ${esc(s.dormant_days)}+ days.</li>
        <li><strong>Learns:</strong> every reply is read for names, timelines, and life events, which shape future messages.</li>
        <li><strong>Hands off:</strong> warm replies create an urgent task for the owner and the assistant steps aside.</li>
        <li><strong>Stops:</strong> STOP / unsubscribe is honored instantly. No overrides.</li>
        <li><strong>Compliant by default:</strong> never quotes rates, APRs, or payments (Reg Z triggering terms).</li></ul></div>
    </div></div>`;
  wireDrafts(main, null);
  main.querySelector('#scan')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    e.target.textContent = 'Scanning…';
    await act(() => api('/ai/scan', { method: 'POST' }), (r) => `${r.proposed || 0} new drafts`).finally(() => views.assistant(main));
  });
  main.querySelectorAll('[data-mode]').forEach((b) => (b.onclick = async () => {
    await act(() => api('/settings', { method: 'PATCH', body: { assistant_mode: b.dataset.mode } }), 'Saved');
    await refreshMeta();
    views.assistant(main);
  }));
};

/* ---------------------------------- Tasks ---------------------------------- */

views.tasks = async (main, { query }) => {
  const scope = query.scope || 'mine';
  const status = query.status || 'open';
  const tasks = await api(`/tasks?scope=${scope}&status=${status === 'done' ? 'done' : 'open'}`);
  main.innerHTML = `<div class="page-head"><h1>Tasks</h1><span class="spacer"></span>
    <div class="pill-toggle">${[['open', 'Open'], ['done', 'Done']].map(([k, l]) => `<a class="btn ${status === k ? 'primary' : ''}" href="#/tasks?scope=${scope}&status=${k}">${l}</a>`).join('')}</div>
    ${isAdmin() ? `<div class="pill-toggle">${[['mine', 'Mine'], ['all', 'Team']].map(([k, l]) => `<a class="btn ${scope === k ? 'primary' : ''}" href="#/tasks?scope=${k}&status=${status}">${l}</a>`).join('')}</div>` : ''}
    <button class="primary" id="add">+ Task</button></div>
    <div class="card">${tasks.length ? `<ul class="list">${tasks.map(taskRow).join('')}</ul>` : '<div class="empty">No tasks here.</div>'}</div>`;
  wireTasks(main, () => views.tasks(main, { query }));
  main.querySelector('#add').onclick = () => modal(`<h2>New task</h2><div class="form-grid"><label class="f wide">Title<input id="t"></label><label class="f">Due<input id="d" type="datetime-local"></label></div><div class="actions"><button data-close>Cancel</button><button class="primary" id="s">Add</button></div>`, {
    onMount: (m, close) => (m.querySelector('#s').onclick = async () => { await act(() => api('/tasks', { method: 'POST', body: { title: m.querySelector('#t').value, due_at: m.querySelector('#d').value || null } }), 'Task added'); close(); views.tasks(main, { query }); }),
  });
};

/* -------------------------------- Campaigns -------------------------------- */

const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '-');

views.campaigns = async (main) => {
  const list = await api('/campaigns');
  main.innerHTML = `<div class="page-head"><h1>Campaigns</h1><span class="sub">Email + SMS from one builder, triggered by behavior</span><span class="spacer"></span>${isAdmin() ? '<a class="btn primary" href="#/campaigns/new">+ New campaign</a>' : ''}</div>
  <div class="card flush"><div class="table-wrap">${list.length ? `<table><thead><tr><th>Campaign</th><th>Trigger</th><th>Status</th><th>Sent</th><th>Opened</th><th>Clicked</th><th>Replied</th><th>Converted</th></tr></thead><tbody>
    ${list.map((c) => `<tr><td><a href="#/campaigns/${c.id}"><strong>${esc(c.name)}</strong></a><div class="small muted">${esc(c.channel === 'both' ? 'Email + SMS' : c.channel.toUpperCase())}</div></td>
      <td class="small">${esc(state.meta.triggers[c.trigger] || c.trigger)}</td>
      <td><span class="badge ${c.status === 'active' ? 'green' : c.status === 'paused' ? 'amber' : 'gray'}">${esc(c.status)}</span></td>
      <td>${c.stats.sent || 0}</td><td>${pct(c.stats.opened, c.stats.sent)}</td><td>${pct(c.stats.clicked, c.stats.sent)}</td><td>${pct(c.stats.replied, c.stats.sent)}</td><td>${c.stats.converted || 0}</td></tr>`).join('')}
  </tbody></table>` : '<div class="empty">No campaigns yet. Try a rate-drop alert for past clients or a welcome text for new leads.</div>'}</div></div>`;
};

views.campaign = async (main, { id }) => {
  const isNew = id === 'new';
  const c = isNew ? { name: '', channel: 'email', subject: '', email_body: '', sms_body: '', audience: {}, trigger: 'manual', trigger_config: {}, status: 'draft', stats: {}, sends: [] } : await api(`/campaigns/${id}`);
  const a = c.audience || {};
  const tc = c.trigger_config || {};
  const multi = (nm, opts, sel = []) => `<select name="${nm}" multiple size="4">${opts.map(([v, l]) => `<option value="${v}" ${sel.includes(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  const pages = await api('/landing-pages');
  main.innerHTML = `<div class="page-head"><a class="btn sm" href="#/campaigns">←</a><h1>${isNew ? 'New campaign' : esc(c.name)}</h1>${isNew ? '' : `<span class="badge ${c.status === 'active' ? 'green' : 'gray'}">${esc(c.status)}</span>`}<span class="spacer"></span>
    ${!isNew && isAdmin() ? `${c.status === 'active' ? '<button id="pause">Pause</button>' : ''}<button class="danger" id="del">Delete</button>` : ''}</div>
  <div class="grid side"><div class="grid" style="align-content:start">
    <div class="card"><form id="f" class="form-grid">
      <label class="f wide">Name<input name="name" value="${esc(c.name)}" placeholder="e.g. Spring rate-drop alert"></label>
      <label class="f">Channel<select name="channel">${[['email', 'Email'], ['sms', 'SMS'], ['both', 'Email + SMS']].map(([v, l]) => `<option value="${v}" ${c.channel === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="f">Trigger<select name="trigger">${Object.entries(state.meta.triggers).map(([v, l]) => `<option value="${v}" ${c.trigger === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      <label class="f" data-for="stage_entered">Stage<select name="tc_stage"><option value="">Any</option>${stageOptions(tc.stage)}</select></label>
      <label class="f" data-for="score_crossed">Score threshold<input name="tc_threshold" type="number" value="${esc(tc.threshold ?? 70)}"></label>
      <label class="f" data-for="rate_drop">Rate gap (%)<input name="tc_gap" type="number" step="0.125" value="${esc(tc.gap ?? 0.75)}"></label>
      <label class="f" data-for="dormant">Quiet for (days)<input name="tc_days" type="number" value="${esc(tc.days ?? state.meta.settings.dormant_days)}"></label>
      <label class="f" data-for="form_submitted">Landing page<select name="tc_landing_page_id"><option value="">Any</option>${pages.map((p) => `<option value="${p.id}" ${Number(tc.landing_page_id) === p.id ? 'selected' : ''}>${esc(p.title)}</option>`).join('')}</select></label>
      <div class="wide"><h3 style="margin:8px 0 0">Audience</h3><p class="small muted" style="margin:0">Leave blank to include everyone. Opt-outs and Do Not Contact are always excluded.</p></div>
      <label class="f">Stages${multi('stages', state.meta.stages.map((s) => [s.key, s.label]), a.stages)}</label>
      <label class="f">Lead types${multi('lead_types', Object.entries(LEAD_TYPES), a.lead_types)}</label>
      <label class="f">Loan types${multi('loan_types', ['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo'].map((x) => [x, x]), a.loan_types)}</label>
      <label class="f">Min score<input name="min_score" type="number" value="${esc(a.min_score ?? '')}"></label>
      <label class="f">Max score<input name="max_score" type="number" value="${esc(a.max_score ?? '')}"></label>
      <label class="f">Tags (comma)<input name="tags" value="${esc((a.tags || []).join(', '))}"></label>
      <label class="f">Min rate gap (%)<input name="min_rate_gap" type="number" step="0.125" value="${esc(a.min_rate_gap ?? '')}"></label>
      <label class="f">Untouched (days)<input name="dormant_days" type="number" value="${esc(a.dormant_days ?? '')}"></label>
      <div class="wide row"><span id="aud" class="small muted"></span></div>
      <div class="wide"><h3 style="margin:8px 0 0">Message</h3><p class="small muted" style="margin:0">Merge fields: <code>{{first_name}}</code> <code>{{lo_name}}</code> <code>{{company}}</code> <code>{{city}}</code> <code>{{phone}}</code>. Links in emails are click-tracked.</p></div>
      <div class="wide row"><input id="goal" placeholder="Describe the goal and let AI draft it, e.g. 'Let past clients know rates dropped and offer a free refi review'" style="flex:1"><button type="button" id="gen">✨ Draft with AI</button></div>
      <label class="f wide" data-ch="email">Email subject<input name="subject" value="${esc(c.subject || '')}"></label>
      <label class="f wide" data-ch="email">Email body<textarea name="email_body" rows="9">${esc(c.email_body || '')}</textarea></label>
      <label class="f wide" data-ch="sms">SMS<textarea name="sms_body" rows="3">${esc(c.sms_body || '')}</textarea><span class="small muted" id="smscount"></span></label>
    </form>
    ${isAdmin() ? `<div class="actions"><button id="save">Save draft</button><button class="primary" id="launch">${c.trigger === 'manual' ? 'Save & send now' : 'Save & activate'}</button></div>` : ''}</div>
    </div>
    <div class="grid" style="align-content:start">
      ${!isNew ? `<div class="card"><h2>Results</h2><div class="grid g2">
        ${[['Sent', c.stats.sent], ['Opened', c.stats.opened], ['Clicked', c.stats.clicked], ['Replied', c.stats.replied], ['Converted', c.stats.converted], ['Failed/blocked', c.stats.failed]].map(([l, v]) => `<div><div class="small muted">${l}</div><div style="font-size:20px;font-weight:800">${v || 0}</div></div>`).join('')}</div>
        <p class="small muted">Replies within 7 days and applications within 30 days of a send are attributed to the campaign.</p></div>
        <div class="card"><h2>Recent sends</h2><ul class="list small">${c.sends.slice(0, 30).map((s) => `<li><a href="#/contacts/${s.contact_id}">${name(s)}</a> · ${esc(s.channel)} · ${esc(s.status)}${s.opened_at ? ' · 👁' : ''}${s.clicked_at ? ' · 🔗' : ''}${s.replied_at ? ' · 💬' : ''}${s.converted_at ? ' · 🏆' : ''}</li>`).join('') || '<li class="muted">None yet</li>'}</ul></div>` : ''}
      <div class="card"><h2>Preview audience</h2><div id="sample" class="small muted">Adjust filters to preview.</div></div>
    </div></div>`;

  const f = main.querySelector('#f');
  const collect = () => {
    const d = formData(f);
    const audience = { stages: d.stages, lead_types: d.lead_types, loan_types: d.loan_types, min_score: d.min_score, max_score: d.max_score, min_rate_gap: d.min_rate_gap, dormant_days: d.dormant_days, tags: d.tags ? d.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
    const trigger_config = {};
    for (const k of ['stage', 'threshold', 'gap', 'days', 'landing_page_id']) if (d[`tc_${k}`]) trigger_config[k] = d[`tc_${k}`];
    return { name: d.name, channel: d.channel, trigger: d.trigger, subject: d.subject, email_body: d.email_body, sms_body: d.sms_body, audience, trigger_config };
  };
  const sync = () => {
    const ch = f.channel.value;
    f.querySelectorAll('[data-ch]').forEach((el) => (el.hidden = ch !== 'both' && el.dataset.ch !== ch));
    f.querySelectorAll('[data-for]').forEach((el) => (el.hidden = el.dataset.for !== f.trigger.value));
    main.querySelector('#smscount').textContent = `${f.sms_body.value.length} characters (opt-out text is added to the first text)`;
    const btn = main.querySelector('#launch');
    if (btn) btn.textContent = f.trigger.value === 'manual' ? 'Save & send now' : 'Save & activate';
  };
  let pt;
  const preview = () => { clearTimeout(pt); pt = setTimeout(async () => {
    const r = await api('/campaigns/preview-audience', { method: 'POST', body: { audience: collect().audience } });
    main.querySelector('#aud').textContent = `${r.count.toLocaleString()} contacts match right now`;
    main.querySelector('#sample').innerHTML = r.sample.map((s) => `<div class="row">${scoreChip(s.score)} <a href="#/contacts/${s.id}">${name(s)}</a> <span class="muted">${esc(stageLabel(s.stage))}</span></div>`).join('') || 'No matches';
  }, 300); };
  f.addEventListener('input', () => { sync(); preview(); });
  f.addEventListener('change', () => { sync(); preview(); });
  sync();
  preview();
  main.querySelector('#gen').onclick = async (e) => {
    const goal = main.querySelector('#goal').value.trim();
    if (!goal) return toast('Describe the goal first', true);
    e.target.disabled = true;
    e.target.textContent = 'Drafting…';
    try {
      const r = await act(() => api('/campaigns/generate', { method: 'POST', body: { goal, audience: JSON.stringify(collect().audience) } }));
      f.subject.value = r.subject;
      f.email_body.value = r.email_body;
      f.sms_body.value = r.sms_body;
      if (!f.name.value) f.name.value = goal.slice(0, 60);
      sync();
    } finally { e.target.disabled = false; e.target.textContent = '✨ Draft with AI'; }
  };
  const save = async () => {
    const body = collect();
    if (!body.name) throw new Error('Give the campaign a name');
    return isNew ? api('/campaigns', { method: 'POST', body }) : api(`/campaigns/${id}`, { method: 'PATCH', body });
  };
  main.querySelector('#save')?.addEventListener('click', async () => { const r = await act(save, 'Saved'); location.hash = `#/campaigns/${r.id}`; if (!isNew) views.campaign(main, { id }); });
  main.querySelector('#launch')?.addEventListener('click', async () => {
    const body = collect();
    if (body.trigger === 'manual' && !confirm('Send this campaign to the matching audience now?')) return;
    const r = await act(save);
    const l = await act(() => api(`/campaigns/${r.id}/launch`, { method: 'POST' }), (x) => (x.activated ? 'Campaign is live - it will fire on its trigger' : `Queued ${x.queued} messages to ${x.audience} contacts`));
    location.hash = `#/campaigns/${r.id}`;
    if (!isNew) views.campaign(main, { id });
    return l;
  });
  main.querySelector('#pause')?.addEventListener('click', async () => { await act(() => api(`/campaigns/${id}/pause`, { method: 'POST' }), 'Paused - queued messages cancelled'); views.campaign(main, { id }); });
  main.querySelector('#del')?.addEventListener('click', async () => { if (confirm('Delete this campaign?')) { await act(() => api(`/campaigns/${id}`, { method: 'DELETE' }), 'Deleted'); location.hash = '#/campaigns'; } });
};

/* ------------------------------ Landing pages ------------------------------ */

const LP_FIELDS = [['first_name', 'First name'], ['last_name', 'Last name'], ['email', 'Email'], ['phone', 'Phone'], ['zip', 'ZIP'], ['purchase_timeline', 'Purchase timeline'], ['credit_band', 'Credit'], ['loan_type', 'Loan type'], ['property_value', 'Home value'], ['loan_amount', 'Loan balance'], ['current_rate', 'Current rate'], ['is_veteran', 'Veteran checkbox'], ['first_time_buyer', 'First-time buyer checkbox'], ['message', 'Message']];

views.pages = async (main) => {
  const pages = await api('/landing-pages');
  main.innerHTML = `<div class="page-head"><h1>Landing Pages</h1><span class="sub">Branded lead capture that drops straight into your pipeline</span><span class="spacer"></span>${isAdmin() ? '<a class="btn primary" href="#/pages/new">+ New page</a>' : ''}</div>
  <div class="grid g3">${pages.map((p) => `<div class="card"><div class="row"><h2 style="margin:0">${esc(p.title)}</h2><span class="spacer"></span><span class="badge ${p.active ? 'green' : 'gray'}">${p.active ? 'live' : 'off'}</span></div>
    <p class="small muted">${esc(p.headline || '')}</p><div class="small"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a></div>
    <div class="row small" style="margin-top:10px"><span>👁 ${p.views} views</span><span>🧲 ${p.submissions} leads</span><span class="muted">${pct(p.submissions, p.views)} conversion</span><span class="spacer"></span>${isAdmin() ? `<a class="btn sm" href="#/pages/${p.id}">Edit</a>` : ''}<button class="sm" data-copy="${esc(p.url)}">Copy link</button></div></div>`).join('') || '<div class="card empty">No pages yet. Create a seller funnel, buyer pre-approval page, or open-house sign-in.</div>'}</div>`;
  main.querySelectorAll('[data-copy]').forEach((b) => (b.onclick = () => navigator.clipboard.writeText(b.dataset.copy).then(() => toast('Link copied'))));
};

views.page = async (main, { id }) => {
  const isNew = id === 'new';
  const p = isNew ? { title: '', slug: '', headline: '', subheadline: '', body: '', cta: 'Get Started', lead_type: 'purchase', fields: ['first_name', 'last_name', 'email', 'phone'], tags: '', thank_you: '', active: 1 } : (await api('/landing-pages')).find((x) => String(x.id) === id);
  if (!p) throw new Error('Page not found');
  main.innerHTML = `<div class="page-head"><a class="btn sm" href="#/pages">←</a><h1>${isNew ? 'New landing page' : esc(p.title)}</h1><span class="spacer"></span>${!isNew ? `<a class="btn" target="_blank" rel="noopener" href="${esc(p.url)}">View live ↗</a><button class="danger" id="del">Delete</button>` : ''}</div>
  <div class="card"><form id="f" class="form-grid">
    <label class="f">Internal title<input name="title" value="${esc(p.title)}" placeholder="Open house sign-in"></label>
    <label class="f">URL slug<input name="slug" value="${esc(p.slug)}" placeholder="open-house"></label>
    <label class="f">Lead type<select name="lead_type">${leadTypeOptions(p.lead_type)}</select></label>
    <label class="f">Tag submissions<input name="tags" value="${esc(p.tags || '')}" placeholder="open-house"></label>
    <label class="f wide">Headline<input name="headline" value="${esc(p.headline || '')}"></label>
    <label class="f wide">Subheadline<input name="subheadline" value="${esc(p.subheadline || '')}"></label>
    <label class="f wide">Body<textarea name="body" rows="4">${esc(p.body || '')}</textarea></label>
    <label class="f">Button text<input name="cta" value="${esc(p.cta || '')}"></label>
    <label class="f">Thank-you message<input name="thank_you" value="${esc(p.thank_you || '')}"></label>
    <label class="f row" style="font-weight:500"><input type="checkbox" name="active" ${p.active ? 'checked' : ''}> Live</label>
    <div class="wide"><h3>Form fields</h3><div class="row">${LP_FIELDS.map(([k, l]) => `<label class="row small" style="gap:4px;margin-right:10px"><input type="checkbox" data-field="${k}" ${p.fields.includes(k) ? 'checked' : ''}> ${l}</label>`).join('')}</div></div>
  </form><p class="small muted">Every submission becomes a contact (deduped), is scored, routed to a loan officer, triggers any "form submitted" or "new lead" campaigns, and gets an immediate first-touch draft from ${esc(state.meta.settings.assistant_name)}. The page includes TCPA consent language and your NMLS info from Settings.</p>
  <div class="actions"><button class="primary" id="save">Save</button></div></div>`;
  const f = main.querySelector('#f');
  f.title.oninput = () => { if (isNew) f.slug.value = f.title.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  main.querySelector('#save').onclick = async () => {
    const body = formData(f);
    body.fields = [...f.querySelectorAll('[data-field]:checked')].map((x) => x.dataset.field);
    for (const k of Object.keys(body)) if (k.startsWith('data')) delete body[k];
    const r = await act(() => (isNew ? api('/landing-pages', { method: 'POST', body }) : api(`/landing-pages/${id}`, { method: 'PATCH', body })), 'Saved');
    location.hash = `#/pages/${r.id}`;
  };
  main.querySelector('#del')?.addEventListener('click', async () => { if (confirm('Delete this page? Its link will stop working.')) { await act(() => api(`/landing-pages/${id}`, { method: 'DELETE' }), 'Deleted'); location.hash = '#/pages'; } });
};

/* --------------------------------- Reports --------------------------------- */

views.reports = async (main, { query }) => {
  const list = await api('/reports');
  const period = query.period || list[0]?.period;
  let r = null;
  if (period) r = await api(`/reports/${period}`).catch(() => null);
  const thisMonth = new Date().toISOString().slice(0, 7);
  main.innerHTML = `<div class="page-head"><h1>Monthly Intelligence Report</h1><span class="spacer"></span>
    <select id="period" style="width:auto">${list.map((x) => `<option ${x.period === period ? 'selected' : ''}>${x.period}</option>`).join('')}</select>
    <button id="build">Build ${thisMonth} to date</button></div>
    ${r ? reportBody(r) : '<div class="card empty">No reports yet. Reports build automatically on the 1st of each month, or build one now.</div>'}`;
  main.querySelector('#period').onchange = (e) => (location.hash = `#/reports?period=${e.target.value}`);
  main.querySelector('#build').onclick = async (e) => {
    e.target.disabled = true;
    e.target.textContent = 'Building…';
    await act(() => api(`/reports/${thisMonth}/build`, { method: 'POST' }), 'Report built');
    location.hash = `#/reports?period=${thisMonth}`;
    views.reports(main, { query: { period: thisMonth } });
  };
};

function reportBody(r) {
  const t = r.totals;
  const people = (list, fmt) => (list.length ? `<ul class="list small">${list.map(fmt).join('')}</ul>` : '<div class="muted small">None</div>');
  const maxFlow = Math.max(1, ...r.stage_flow.map((s) => s.entered));
  return `${r.briefing ? `<div class="callout" style="margin-bottom:16px"><strong>Briefing</strong><p style="margin:6px 0 0">${esc(r.briefing)}</p></div>` : ''}
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card kpi"><div class="l">New contacts</div><div class="v">${t.new_contacts}</div><div class="small muted">${t.contacts} total</div></div>
    <div class="card kpi"><div class="l">Funded</div><div class="v">${t.funded_loans}</div><div class="small muted">${money(t.funded_volume)}</div></div>
    <div class="card kpi"><div class="l">Assistant</div><div class="v">${t.ai_drafted}</div><div class="small muted">drafted · ${t.handoffs} handoffs</div></div>
    <div class="card kpi"><div class="l">Refi opportunities</div><div class="v">${t.rate_opportunities}</div><div class="small muted">rate ≥ 0.75% over market</div></div>
  </div>
  <div class="grid g3">
    <div class="card"><h2>⬆️ Moved up</h2>${people(r.moved_up, (p) => `<li><a href="#/contacts/${p.id}">${esc(p.name)}</a> ${p.from} → <strong>${p.to}</strong><div class="muted">${esc(p.why)}</div></li>`)}</div>
    <div class="card"><h2>🤫 Went quiet</h2>${people(r.went_quiet, (p) => `<li><a href="#/contacts/${p.id}">${esc(p.name)}</a> ${scoreChip(p.score)} <span class="muted">last reply ${when(p.last_reply)}</span></li>`)}</div>
    <div class="card"><h2>🎯 Focus next</h2>${people(r.focus_next, (p) => `<li>${scoreChip(p.score)} <a href="#/contacts/${p.id}">${esc(p.name)}</a><div class="muted">${esc(p.why)}</div></li>`)}</div>
    <div class="card"><h2>Pipeline flow</h2>${r.stage_flow.map((s) => `<div class="small row" style="flex-wrap:nowrap"><span style="width:110px">${esc(s.stage)}</span><div class="bar" style="flex:1"><span style="width:${(s.entered / maxFlow) * 100}%"></span></div><span style="width:28px;text-align:right">${s.entered}</span></div>`).join('')}</div>
    <div class="card"><h2>Lead sources</h2>${people(r.by_source, (s) => `<li class="row">${esc(s.source)}<span class="spacer"></span><strong>${s.n}</strong></li>`)}</div>
    <div class="card"><h2>Campaigns</h2>${people(r.campaigns, (c) => `<li><strong>${esc(c.name)}</strong><div class="muted">${c.sent} sent · ${pct(c.opened, c.sent)} opened · ${c.replied} replied · ${c.converted} converted</div></li>`)}</div>
  </div>`;
}

/* ---------------------------------- Team ----------------------------------- */

views.team = async (main) => {
  const users = await api('/users');
  const s = state.meta.settings;
  main.innerHTML = `<div class="page-head"><h1>Team</h1><span class="spacer"></span><button class="primary" id="add">+ Add teammate</button></div>
  <div class="card" style="margin-bottom:16px"><h2>Lead routing</h2><p class="small muted">How new leads from landing pages, imports without an owner, and inbound texts get assigned.</p>
    <div class="pill-toggle" id="routing">${[['round_robin', 'Round-robin'], ['weighted', 'Weighted'], ['manual', 'Everything to owner']].map(([k, l]) => `<button data-r="${k}" class="${s.routing_mode === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <p class="small muted">Weighted: a teammate with weight 3 gets three leads for every one a weight-1 teammate gets. Members only see their own contacts; owners and admins see the whole pipeline.</p></div>
  <div class="card flush"><div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Contacts</th><th>Gets leads</th><th>Weight</th><th>Status</th><th></th></tr></thead><tbody>
    ${users.map((u) => `<tr><td><strong>${esc(u.name)}</strong><div class="small muted">${esc(u.email)}${u.phone ? ` · ${esc(u.phone)}` : ''}</div></td><td><span class="badge ${u.role === 'member' ? 'gray' : ''}">${esc(u.role)}</span></td><td>${u.contacts}</td>
      <td><input type="checkbox" data-u="${u.id}" data-k="receives_leads" ${u.receives_leads ? 'checked' : ''}></td>
      <td><input type="number" min="1" max="10" value="${u.routing_weight}" data-u="${u.id}" data-k="routing_weight" style="width:70px"></td>
      <td>${u.active ? '<span class="badge green">active</span>' : '<span class="badge gray">deactivated</span>'}</td>
      <td style="text-align:right"><button class="sm" data-edit="${u.id}">Edit</button></td></tr>`).join('')}
  </tbody></table></div></div>`;
  main.querySelectorAll('[data-r]').forEach((b) => (b.onclick = async () => { await act(() => api('/settings', { method: 'PATCH', body: { routing_mode: b.dataset.r } }), 'Routing updated'); await refreshMeta(); views.team(main); }));
  main.querySelectorAll('[data-k]').forEach((el) => (el.onchange = () => act(() => api(`/users/${el.dataset.u}`, { method: 'PATCH', body: { [el.dataset.k]: el.type === 'checkbox' ? (el.checked ? 1 : 0) : Number(el.value) } }), 'Saved')));
  const userModal = (u) => modal(`<h2>${u ? 'Edit teammate' : 'Add teammate'}</h2><form id="f" class="form-grid">
      <label class="f">Name<input name="name" value="${esc(u?.name || '')}"></label>
      ${u ? '' : '<label class="f">Email<input name="email" type="email"></label>'}
      <label class="f">Mobile (for click-to-call)<input name="phone" value="${esc(u?.phone || '')}"></label>
      ${state.user.role === 'owner' ? `<label class="f">Role<select name="role">${['member', 'admin', 'owner'].map((r) => `<option ${u?.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>` : ''}
      <label class="f">${u ? 'New password (optional)' : 'Temporary password'}<input name="password" type="password" minlength="8"></label>
      ${u && u.id !== state.user.id ? `<label class="f row" style="font-weight:500"><input type="checkbox" name="active" ${u.active ? 'checked' : ''}> Active</label>` : ''}
    </form><div class="actions"><button data-close>Cancel</button><button class="primary" id="s">Save</button></div>`, {
    onMount: (m, close) => (m.querySelector('#s').onclick = async () => {
      const body = formData(m.querySelector('#f'));
      if (!body.password) delete body.password;
      await act(() => (u ? api(`/users/${u.id}`, { method: 'PATCH', body }) : api('/users', { method: 'POST', body })), 'Saved');
      close();
      await refreshMeta();
      views.team(main);
    }),
  });
  main.querySelector('#add').onclick = () => userModal(null);
  main.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => userModal(users.find((u) => u.id === Number(b.dataset.edit)))));
};

/* -------------------------------- Settings --------------------------------- */

views.settings = async (main, { query = {} } = {}) => {
  const { settings: s, providers: p } = await api('/settings');
  const field = (k, label, attrs = '') => `<label class="f">${label}<input name="${k}" value="${esc(s[k] ?? '')}" ${attrs}></label>`;
  const status = (v, ok) => `<span class="badge ${v === ok || (Array.isArray(ok) && ok.includes(v)) ? 'green' : 'amber'}">${esc(v)}</span>`;
  main.innerHTML = `<div class="page-head"><h1>Settings</h1><span class="spacer"></span><button class="primary" id="save">Save changes</button></div>
  <form id="f" class="grid">
    <div class="card"><h2>Branding & compliance</h2><div class="form-grid">
      ${field('company_name', 'Company name')}${field('company_nmls', 'Company NMLS #')}${field('loan_officer_name', 'Loan officer name')}${field('loan_officer_nmls', 'Loan officer NMLS #')}
      ${field('business_phone', 'Business phone')}${field('business_address', 'Business address (email footer)')}
      <label class="f">Brand color<input name="brand_color" type="color" value="${esc(s.brand_color)}" style="height:38px;padding:2px"></label>
      <label class="f">Timezone<select name="timezone">${['America/Los_Angeles', 'America/Denver', 'America/Phoenix', 'America/Chicago', 'America/New_York', 'America/Anchorage', 'Pacific/Honolulu'].map((z) => `<option ${z === s.timezone ? 'selected' : ''}>${z}</option>`).join('')}</select></label>
    </div></div>
    <div class="card"><h2>Market & scoring</h2><p class="small muted">Ready Scores compare every contact's rate to the market rate. Changing it rescores the database instantly and fires rate-drop campaigns.</p><div class="form-grid">
      ${field('market_rate_30yr', '30-yr market rate (%)', 'type="number" step="0.001"')}${field('market_rate_15yr', '15-yr market rate (%)', 'type="number" step="0.001"')}
      ${field('daily_call_list_size', 'Daily call list size', 'type="number" min="5" max="200"')}${field('dormant_days', 'Going cold after (days)', 'type="number"')}
      <label class="f row" style="font-weight:500"><input type="checkbox" name="auto_stage_rules" ${s.auto_stage_rules === '1' ? 'checked' : ''}> Automated stage transitions</label>
      <label class="f row" style="font-weight:500"><input type="checkbox" name="auto_enrich" ${s.auto_enrich === '1' ? 'checked' : ''}> Auto-enrich property data</label>
    </div><p class="small muted">Automated transitions: replies and connected calls move New/Nurture → Contacted; "not interested" moves to Nurture; Funded converts a lead to a past client and starts tracking their loan.</p></div>
    <div class="card"><h2>Assistant</h2><div class="form-grid">
      ${field('assistant_name', 'Assistant name')}
      <label class="f">Mode<select name="assistant_mode">${[['off', 'Off'], ['approval', 'Approve every message'], ['autonomous', 'Autonomous']].map(([k, l]) => `<option value="${k}" ${s.assistant_mode === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      ${field('speed_to_lead_minutes', 'Speed-to-lead window (minutes)', 'type="number" min="1"')}
      ${field('quiet_start', 'Quiet hours start', 'type="time"')}${field('quiet_end', 'Quiet hours end', 'type="time"')}
      <label class="f wide">Voice & tone<textarea name="assistant_voice" rows="2">${esc(s.assistant_voice)}</textarea></label>
    </div><p class="small muted">Automated texts never send during quiet hours (contact-facing TCPA best practice); they wait in the queue until morning.</p></div>
    <div class="card"><h2>Integrations</h2><p class="small muted">Configured with environment variables on the server (see README). Without them, messages are logged as "simulated" so you can try everything safely.</p>
      <div class="small" style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px">
        <span>Texting</span><span>${status(p.sms, 'twilio')} ${p.from_number ? esc(p.from_number) : '<code>TWILIO_ACCOUNT_SID</code> <code>TWILIO_AUTH_TOKEN</code> <code>TWILIO_FROM_NUMBER</code>'}</span>
        <span>Calling</span><span>${status(p.voice, 'twilio')}</span>
        <span>Email</span><span>${status(p.email, 'smtp')} ${p.from_email ? esc(p.from_email) : '<code>SMTP_HOST</code> <code>SMTP_USER</code> <code>SMTP_PASS</code> <code>SMTP_FROM</code>'}</span>
        <span>AI</span><span>${status(p.ai, 'claude')} ${p.ai === 'claude' ? '' : '<code>ANTHROPIC_API_KEY</code>'}</span>
        <span>Inbound texts</span><span>Point your Twilio number's messaging webhook to <code>${esc(state.meta.app_url)}/webhooks/twilio/sms</code></span>
      </div></div>
  </form>
  <div class="grid" style="margin-top:16px">
    <div class="card" id="sync"><h2>Data sync & lead intake</h2><div class="muted small">Loading…</div></div>
    <div class="card" id="vm"><h2>📼 Voicemail drops</h2><div class="muted small">Loading…</div></div>
  </div>`;
  if (query.google === 'connected') toast('Google Contacts connected - syncing now');
  if (query.google_error) toast(`Google: ${query.google_error}`, true);
  renderSync(main.querySelector('#sync'), s, query.google === 'connected');
  renderVoicemails(main.querySelector('#vm'));
  main.querySelector('#save').onclick = async () => {
    const body = formData(main.querySelector('#f'));
    body.auto_stage_rules = body.auto_stage_rules ? '1' : '0';
    body.auto_enrich = body.auto_enrich ? '1' : '0';
    const r = await act(() => api('/settings', { method: 'PATCH', body }), (x) => (x.changed.length ? `Saved ${x.changed.length} change(s)${x.changed.includes('market_rate_30yr') ? ' - database rescored' : ''}` : 'No changes'));
    await refreshMeta();
    if (r.changed.includes('company_name')) document.querySelector('#app').innerHTML = '';
    route();
  };
};

/* ------------------------- Property data (contact) ------------------------- */

function propertyCard(c) {
  const rows = [
    ['Est. value', c.avm_value ? `${money(c.avm_value)}${c.avm_low && c.avm_high ? ` <span class="muted">(${money(c.avm_low)}-${money(c.avm_high)})</span>` : ''}` : ''],
    ['Value as of', esc(c.avm_date || '')],
    ['Equity (est.)', c.avm_value && c.loan_amount ? `${money(c.avm_value - c.loan_amount)} <span class="muted">· ${Math.round((1 - c.loan_amount / c.avm_value) * 100)}%</span>` : ''],
    ['County', esc(c.county || '')],
    ['Home', esc([c.beds && `${c.beds} bd`, c.baths && `${c.baths} ba`, c.sqft && `${Number(c.sqft).toLocaleString()} sqft`, c.year_built && `built ${c.year_built}`].filter(Boolean).join(' · '))],
    ['Last sale', c.last_sale_date ? `${esc(c.last_sale_date)}${c.last_sale_price ? ` · ${money(c.last_sale_price)}` : ''}` : ''],
    ['Recorded lender', esc(c.lender_name || '')],
  ].filter(([, v]) => v);
  return `<div class="card"><div class="card-head"><h2>🏡 Property</h2>${c.address_verified ? '<span class="badge green" title="Standardized by the US Census geocoder">verified address</span>' : ''}<span class="spacer"></span><button class="sm" id="enrich" ${c.address ? '' : 'disabled title="Add a street address first"'}>Refresh</button></div>
    ${rows.length ? `<div class="small" style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px">${rows.map(([k, v]) => `<span class="muted">${k}</span><span>${v}</span>`).join('')}</div>` : `<div class="small muted">${c.address ? 'No property data yet.' : 'Add a street address to pull property data.'}</div>`}
    ${c.enrich_error ? `<div class="small" style="color:var(--warm);margin-top:6px">⚠ ${esc(c.enrich_error)}</div>` : ''}
    ${c.enriched_at ? `<div class="small muted" style="margin-top:6px">Updated ${when(c.enriched_at)}</div>` : ''}</div>`;
}

document.addEventListener('click', async (e) => {
  if (e.target?.id !== 'enrich') return;
  const id = location.hash.match(/contacts\/(\d+)/)?.[1];
  if (!id) return;
  e.target.disabled = true;
  e.target.textContent = 'Looking up…';
  try {
    const r = await act(() => api(`/contacts/${id}/enrich`, { method: 'POST' }));
    toast(r.updated.length ? `Updated: ${r.updated.join(', ')}` : r.error || 'No new property data');
  } finally {
    route();
  }
});

/* ---------------------------- Settings: sync ------------------------------- */

async function renderSync(el, s, autoSyncGoogle) {
  const i = await api('/integrations');
  const run = (src) => i.runs.find((r) => r.source === src);
  const runLine = (r) => (r ? `<span class="muted">Last sync ${when(r.finished_at || r.started_at)}: ${r.status === 'failed' ? `<span style="color:var(--hot)">failed - ${esc(r.error)}</span>` : `${r.created} new, ${r.merged} updated${r.skipped ? `, ${r.skipped} skipped` : ''}`}</span>` : '');
  const sample = `curl -X POST '${i.inbound.url}?source=Zillow' \\\n  -H 'X-API-Key: ${i.inbound.key}' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"first_name":"Pat","last_name":"Lee","email":"pat@example.com","phone":"9515550100","timeline":"1-3 months","message":"Looking in Temecula"}'`;
  el.innerHTML = `<h2>Data sync & lead intake</h2>
  <div class="grid g3">
    <div><h3>Google Contacts</h3>
      ${!i.google.configured ? '<p class="small muted">Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> on the server (README has the 5-minute setup).</p>'
        : i.google.connected ? `<p class="small">Connected${i.google.account ? ` as <strong>${esc(i.google.account)}</strong>` : ''}. Syncs daily; new and changed contacts merge into the CRM as Sphere.</p>
          <div class="row"><button class="sm primary" id="g-sync">Sync now</button><button class="sm" id="g-off">Disconnect</button></div>`
        : '<p class="small">Pull your phone and Gmail contacts into the CRM (read-only).</p><button class="sm primary" id="g-on">Connect Google</button>'}
      <div class="small" style="margin-top:6px">${runLine(run('google'))}</div></div>
    <div><h3>Follow Up Boss</h3>
      ${i.followupboss.connected ? `<p class="small">Connected. Syncs daily. People are matched by FUB id, email, or phone, so re-syncing never duplicates.</p><div class="row"><button class="sm primary" id="fub-sync">Sync now</button><button class="sm" id="fub-off">Disconnect</button></div>`
        : `<p class="small">Paste your API key (FUB → Admin → API) to import everyone, with stages and tags.</p><div class="row"><input id="fub-key" type="password" placeholder="API key" style="flex:1;min-width:140px"><button class="sm primary" id="fub-on">Connect & import</button></div>`}
      <div class="small" style="margin-top:6px">${runLine(run('followupboss'))}</div></div>
    <div><h3>Inbound lead webhook</h3>
      <p class="small">Send leads from Zapier, Make, Zillow, Realtor.com, your website, or any CRM. Field names are matched automatically. Each lead is scored, routed, and gets a speed-to-lead draft.</p>
      <div class="small"><code style="word-break:break-all">${esc(i.inbound.url)}</code></div>
      <div class="row small" style="margin-top:6px">Key: <code id="ikey" style="word-break:break-all">${esc(i.inbound.key)}</code><button class="sm" id="i-copy">Copy example</button><button class="sm" id="i-rot">Rotate key</button></div></div>
  </div>
  <h3 style="margin-top:16px">Property data</h3>
  <p class="small">Addresses are standardized with the free US Census geocoder (adds county and map coordinates). ${i.enrichment.property_data === 'attom' ? '<span class="badge green">ATTOM connected</span> Home values, property facts, last sale, and recorded mortgages are pulled automatically and refreshed every 90 days. Equity in the Ready Score uses the current estimated value.' : 'Add <code>ATTOM_API_KEY</code> on the server to also pull automated home values (AVM), property facts, last sale, and recorded mortgages. These feed equity in the Ready Score.'}</p>`;
  el.querySelector('#g-on')?.addEventListener('click', async () => { const r = await act(() => api('/integrations/google/connect', { method: 'POST' })); location.href = r.url; });
  const doSync = async (path, btn) => {
    if (btn) { btn.disabled = true; btn.textContent = 'Syncing…'; }
    await act(() => api(path, { method: 'POST' }), (r) => `Sync done: ${r.created} new, ${r.merged} updated`).catch(() => {});
    renderSync(el, s);
  };
  el.querySelector('#g-sync')?.addEventListener('click', (e) => doSync('/integrations/google/sync', e.target));
  el.querySelector('#g-off')?.addEventListener('click', async () => { if (confirm('Disconnect Google Contacts? Contacts already imported stay in the CRM.')) { await act(() => api('/integrations/google/disconnect', { method: 'POST' }), 'Disconnected'); renderSync(el, s); } });
  el.querySelector('#fub-on')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    e.target.textContent = 'Importing…';
    await act(() => api('/integrations/followupboss', { method: 'POST', body: { api_key: el.querySelector('#fub-key').value } }), (r) => `Imported: ${r.created} new, ${r.merged} updated`).catch(() => {});
    renderSync(el, s);
  });
  el.querySelector('#fub-sync')?.addEventListener('click', (e) => doSync('/integrations/followupboss', e.target));
  el.querySelector('#fub-off')?.addEventListener('click', async () => { await act(() => api('/integrations/followupboss', { method: 'POST', body: { disconnect: true } }), 'Disconnected'); renderSync(el, s); });
  el.querySelector('#i-copy').onclick = () => navigator.clipboard.writeText(sample).then(() => toast('Example request copied'));
  el.querySelector('#i-rot').onclick = async () => { if (confirm('Rotate the key? Anything using the old key will stop sending leads.')) { await act(() => api('/integrations/inbound/rotate', { method: 'POST' }), 'New key created'); renderSync(el, s); } };
  if (autoSyncGoogle && i.google.connected) doSync('/integrations/google/sync', el.querySelector('#g-sync'));
}

/* ------------------------- Settings: voicemail drops ------------------------ */

async function renderVoicemails(el) {
  const drops = await api('/voicemail-drops');
  el.innerHTML = `<div class="card-head"><h2>📼 Voicemail drops</h2><span class="spacer"></span><button class="sm primary" id="vm-add">+ New voicemail</button></div>
    <p class="small muted">Drop a pre-recorded voicemail from a contact's Call tab or to many contacts at once from the Contacts list. If a person answers instead, they're connected to the loan officer's phone. Use a recording (an https link to an MP3/WAV) or a script read in a natural voice. Merge fields work in scripts: <code>{{first_name}}</code> <code>{{lo_name}}</code> <code>{{company}}</code> <code>{{phone}}</code>.</p>
    ${drops.length ? `<ul class="list">${drops.map((d) => `<li class="row" style="flex-wrap:nowrap"><div style="flex:1;min-width:0"><strong>${esc(d.name)}</strong><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.audio_url ? `🎧 ${esc(d.audio_url)}` : `🗣 ${esc(d.script)}`}</div></div><button class="sm" data-vm-edit="${d.id}">Edit</button>${isAdmin() ? `<button class="sm danger" data-vm-del="${d.id}">Delete</button>` : ''}</li>`).join('')}</ul>` : '<div class="muted small">No voicemails yet.</div>'}`;
  const edit = (d) => modal(`<h2>${d ? 'Edit voicemail' : 'New voicemail'}</h2><div class="form-grid">
      <label class="f wide">Name<input id="n" value="${esc(d?.name || '')}" placeholder="e.g. Rate drop - past clients"></label>
      <label class="f wide">Script (read aloud)<textarea id="sc" rows="4" placeholder="Hi {{first_name}}, it's {{lo_name}} with {{company}}. Rates have moved since your loan closed and I wanted to see if a quick review makes sense. Call or text me back at {{phone}}. Talk soon!">${esc(d?.script || '')}</textarea></label>
      <label class="f wide">…or recording URL (overrides script)<input id="au" value="${esc(d?.audio_url || '')}" placeholder="https://…/voicemail.mp3"></label>
    </div><div class="actions"><button data-close>Cancel</button><button class="primary" id="s">Save</button></div>`, {
    onMount: (m, close) => (m.querySelector('#s').onclick = async () => {
      const body = { name: m.querySelector('#n').value, script: m.querySelector('#sc').value, audio_url: m.querySelector('#au').value };
      await act(() => (d ? api(`/voicemail-drops/${d.id}`, { method: 'PATCH', body }) : api('/voicemail-drops', { method: 'POST', body })), 'Saved');
      close();
      renderVoicemails(el);
    }),
  });
  el.querySelector('#vm-add').onclick = () => edit(null);
  el.querySelectorAll('[data-vm-edit]').forEach((b) => (b.onclick = () => edit(drops.find((d) => d.id === Number(b.dataset.vmEdit)))));
  el.querySelectorAll('[data-vm-del]').forEach((b) => (b.onclick = async () => { if (confirm('Delete this voicemail?')) { await act(() => api(`/voicemail-drops/${b.dataset.vmDel}`, { method: 'DELETE' }), 'Deleted'); renderVoicemails(el); } }));
}
