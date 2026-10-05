import { views } from './views.js';
import './views-pro.js';

/* ------------------------------- Core helpers ------------------------------- */

export const state = { meta: null, user: null };

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  if (res.status === 401 && !path.startsWith('/login') && !path.startsWith('/setup')) {
    state.user = null;
    location.hash = '#/login';
    throw new Error('Please sign in');
  }
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

let toastTimer;
export function toast(msg, isErr = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show${isErr ? ' err' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = ''), isErr ? 5000 : 2800);
}

/** Run an async action from a button, with error toasts. */
export async function act(fn, okMsg) {
  try {
    const r = await fn();
    if (okMsg) toast(typeof okMsg === 'function' ? okMsg(r) : okMsg);
    return r;
  } catch (e) {
    toast(e.message, true);
    throw e;
  }
}

export function modal(html, { onMount, wide = false } = {}) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" style="${wide ? 'width:min(980px,100%)' : ''}">${html}</div>`;
  const close = () => {
    bg.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => e.key === 'Escape' && close();
  bg.addEventListener('mousedown', (e) => e.target === bg && close());
  document.addEventListener('keydown', onKey);
  document.body.appendChild(bg);
  bg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  onMount?.(bg.querySelector('.modal'), close);
  bg.querySelector('input,select,textarea')?.focus();
  return close;
}

export function formData(root) {
  const out = {};
  root.querySelectorAll('[name]').forEach((el) => {
    if (el.type === 'checkbox') out[el.name] = el.checked ? 1 : 0;
    else if (el.multiple) out[el.name] = [...el.selectedOptions].map((o) => o.value);
    else out[el.name] = el.value;
  });
  return out;
}

export const stageLabel = (k) => state.meta?.stages.find((s) => s.key === k)?.label || k;
export const scoreClass = (s) => (s >= 70 ? 's-hot' : s >= 45 ? 's-warm' : s >= 20 ? 's-cool' : 's-cold');
export const scoreChip = (s) => `<span class="score ${scoreClass(s)}" title="Ready Score">${s ?? 0}</span>`;
export const name = (c) => esc([c.first_name, c.last_name].filter(Boolean).join(' ') || c.email || c.phone || `#${c.id}`);
export const money = (n) => (n == null || n === '' ? '' : `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
export const isAdmin = () => ['owner', 'admin'].includes(state.user?.role);

export function when(ts) {
  if (!ts) return '';
  const d = new Date(ts.includes('T') ? ts : `${ts.replace(' ', 'T')}Z`);
  if (Number.isNaN(d.getTime())) return ts;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60 && diff > -60) return 'just now';
  if (diff > 0 && diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff > 0 && diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff > 0 && diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}

export function phoneFmt(p) {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(p || '');
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : p || '';
}

export function stageOptions(selected) {
  return state.meta.stages.map((s) => `<option value="${s.key}" ${s.key === selected ? 'selected' : ''}>${esc(s.label)}</option>`).join('');
}
export function userOptions(selected, { blank = false } = {}) {
  return `${blank ? '<option value="">Anyone</option>' : ''}${state.meta.users.filter((u) => u.active).map((u) => `<option value="${u.id}" ${Number(selected) === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}`;
}

/* --------------------------------- Router ---------------------------------- */

const NAV = [
  ['', '☀️', 'Today'],
  ['contacts', '👥', 'Contacts'],
  ['pipeline', '📊', 'Pipeline'],
  ['partners', '🤝', 'Partners'],
  ['tasks', '✅', 'Tasks'],
  ['-', '', 'AI & Automation'],
  ['copilot', '🧠', 'Copilot'],
  ['assistant', '✨', 'Assistant', 'drafts'],
  ['workflows', '🔁', 'Workflows'],
  ['-', '', 'Marketing'],
  ['campaigns', '📣', 'Campaigns'],
  ['studio', '🎨', 'Content Studio'],
  ['pages', '🧲', 'Landing Pages'],
  ['-', '', 'Insights'],
  ['analytics', '📈', 'Analytics'],
  ['reports', '🗓️', 'Monthly Report'],
];
const ADMIN_NAV = [
  ['-', '', 'Admin'],
  ['hub', '🔌', 'Integrations'],
  ['team', '🧑‍🤝‍🧑', 'Team'],
  ['settings', '⚙️', 'Settings'],
];

function parseHash() {
  const parts = location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(location.hash.split('?')[1] || ''));
  return { parts, query };
}

async function shell(active) {
  const app = document.getElementById('app');
  if (!app.querySelector('.shell')) {
    app.innerHTML = `<div class="mobile-bar"><button class="ghost" id="menu" style="color:#fff">☰</button><strong>${esc(state.meta.settings.company_name)}</strong></div>
<div class="shell"><nav class="side-nav" id="nav"></nav><main id="main"></main></div><a href="#/copilot" class="fab" title="Ask Copilot" aria-label="Ask Copilot">🧠</a>`;
    app.querySelector('#menu').onclick = () => app.querySelector('#nav').classList.toggle('open');
  }
  const nav = app.querySelector('#nav');
  const items = [...NAV, ...(isAdmin() ? ADMIN_NAV : [])];
  nav.innerHTML = `<div class="brand"><span class="logo">🏠</span>${esc(state.meta.settings.company_name)}</div>
${items.map(([k, ic, label, badge]) => (k === '-' ? `<div class="nav-group">${label}</div>` : `<a href="#/${k}" class="${k === active ? 'active' : ''}"><span>${ic}</span>${label}${badge ? `<span class="badge" id="badge-${badge}" hidden></span>` : ''}</a>`)).join('')}
<div class="sep"></div><div class="who">${esc(state.user.name)} · ${esc(state.user.role)}<br><a href="#" id="logout" style="color:var(--nav-ink)">Sign out</a></div>`;
  nav.querySelector('#logout').onclick = async (e) => {
    e.preventDefault();
    await api('/logout', { method: 'POST' });
    state.user = null;
    location.hash = '#/login';
    route();
  };
  nav.classList.remove('open');
  api('/ai/drafts').then((d) => {
    const b = document.getElementById('badge-drafts');
    if (b && d.length) { b.hidden = false; b.textContent = d.length; }
  }).catch(() => {});
  return app.querySelector('#main');
}

export async function refreshMeta() {
  state.meta = await api('/meta');
  state.user = state.meta.user;
  document.documentElement.style.setProperty('--brand', state.meta.settings.brand_color || '#0e7490');
}

export async function route() {
  const { parts, query } = parseHash();
  const app = document.getElementById('app');
  if (parts[0] === 'login' || !state.user) {
    try {
      if (!state.user) await refreshMeta();
      if (parts[0] === 'login') { location.hash = '#/'; return; }
    } catch {
      app.innerHTML = '';
      return views.auth(app);
    }
  }
  const key = parts[0] || '';
  const viewName = {
    '': 'today', contacts: parts[1] ? 'contact' : 'contacts', pipeline: 'pipeline', assistant: 'assistant', tasks: 'tasks',
    campaigns: parts[1] ? 'campaign' : 'campaigns', pages: parts[1] ? 'page' : 'pages', reports: 'reports', team: 'team', settings: 'settings',
    analytics: 'analytics', workflows: parts[1] ? 'workflow' : 'workflows', partners: parts[1] ? 'partner' : 'partners', copilot: 'copilot', studio: 'studio', hub: 'hub',
  }[key];
  const main = await shell(key);
  if (!viewName) { main.innerHTML = '<div class="empty">Page not found</div>'; return; }
  main.innerHTML = '<div class="empty">Loading…</div>';
  try {
    await views[viewName](main, { id: parts[1], query });
  } catch (e) {
    if (e.message !== 'Please sign in') main.innerHTML = `<div class="card empty">⚠️ ${esc(e.message)}</div>`;
  }
  main.scrollTop = 0;
}

window.addEventListener('hashchange', route);
route();
