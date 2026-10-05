import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.DB_PATH || path.resolve('data', 'crm.db');
if (DB_PATH !== ':memory:') fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  routing_weight INTEGER NOT NULL DEFAULT 1,
  receives_leads INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  email_norm TEXT,
  phone TEXT,
  phone_norm TEXT,
  address TEXT, city TEXT, state TEXT, zip TEXT,
  source TEXT,
  stage TEXT NOT NULL DEFAULT 'new',
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  lead_type TEXT DEFAULT 'purchase',
  loan_type TEXT,
  loan_purpose TEXT,
  credit_band TEXT,
  property_value REAL,
  loan_amount REAL,
  current_rate REAL,
  loan_close_date TEXT,
  purchase_timeline TEXT,
  preapproved INTEGER DEFAULT 0,
  is_veteran INTEGER DEFAULT 0,
  first_time_buyer INTEGER DEFAULT 0,
  annual_income REAL,
  tags TEXT DEFAULT '',
  facts TEXT DEFAULT '[]',
  score INTEGER DEFAULT 0,
  score_prev INTEGER DEFAULT 0,
  score_reasons TEXT DEFAULT '[]',
  score_updated_at TEXT,
  ai_scan_score INTEGER,
  opted_out_sms INTEGER DEFAULT 0,
  opted_out_email INTEGER DEFAULT 0,
  dnc INTEGER DEFAULT 0,
  ai_paused INTEGER DEFAULT 0,
  last_contacted_at TEXT,
  last_inbound_at TEXT,
  last_ai_at TEXT,
  stage_changed_at TEXT DEFAULT (datetime('now')),
  landing_page_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email_norm);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone_norm);
CREATE INDEX IF NOT EXISTS idx_contacts_stage ON contacts(stage);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_score ON contacts(score DESC);

CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  direction TEXT,
  subject TEXT,
  body TEXT,
  meta TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id, created_at DESC);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  kind TEXT DEFAULT 'todo',
  due_at TEXT,
  done INTEGER DEFAULT 0,
  done_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS score_history (
  id INTEGER PRIMARY KEY,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_score_history ON score_history(contact_id, created_at);

CREATE TABLE IF NOT EXISTS ai_drafts (
  id INTEGER PRIMARY KEY,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at TEXT,
  decided_by INTEGER
);

CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id INTEGER,
  channel TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  source TEXT NOT NULL,
  ref_id INTEGER,
  send_after TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'queued',
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT,
  email_body TEXT,
  sms_body TEXT,
  audience TEXT DEFAULT '{}',
  trigger TEXT NOT NULL DEFAULT 'manual',
  trigger_config TEXT DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_run_at TEXT
);

CREATE TABLE IF NOT EXISTS campaign_sends (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'queued',
  sent_at TEXT, opened_at TEXT, clicked_at TEXT, replied_at TEXT, converted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_campaign_sends ON campaign_sends(campaign_id, contact_id);

CREATE TABLE IF NOT EXISTS landing_pages (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  headline TEXT,
  subheadline TEXT,
  body TEXT,
  cta TEXT DEFAULT 'Get Started',
  lead_type TEXT DEFAULT 'purchase',
  fields TEXT DEFAULT '["first_name","last_name","email","phone"]',
  tags TEXT DEFAULT '',
  thank_you TEXT,
  active INTEGER DEFAULT 1,
  views INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY,
  period TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Additive migrations for databases created by earlier versions.
const contactCols = new Set(db.prepare('PRAGMA table_info(contacts)').all().map((c) => c.name));
for (const [col, type] of [
  ['county', 'TEXT'], ['lat', 'REAL'], ['lng', 'REAL'], ['address_verified', 'INTEGER DEFAULT 0'],
  ['avm_value', 'REAL'], ['avm_low', 'REAL'], ['avm_high', 'REAL'], ['avm_date', 'TEXT'],
  ['last_sale_date', 'TEXT'], ['last_sale_price', 'REAL'], ['year_built', 'INTEGER'], ['sqft', 'INTEGER'],
  ['beds', 'REAL'], ['baths', 'REAL'], ['lender_name', 'TEXT'], ['enriched_at', 'TEXT'], ['enrich_error', 'TEXT'],
  ['external_source', 'TEXT'], ['external_id', 'TEXT'],
]) {
  if (!contactCols.has(col)) db.exec(`ALTER TABLE contacts ADD COLUMN ${col} ${type}`);
}
db.exec(`
CREATE INDEX IF NOT EXISTS idx_contacts_external ON contacts(external_source, external_id);

CREATE TABLE IF NOT EXISTS voicemail_drops (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  script TEXT,
  audio_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS voicemail_calls (
  id INTEGER PRIMARY KEY,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  drop_id INTEGER REFERENCES voicemail_drops(id) ON DELETE SET NULL,
  user_id INTEGER,
  call_sid TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  answered_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  created INTEGER DEFAULT 0,
  merged INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  error TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT
);
`);

export const STAGES = [
  { key: 'new', label: 'New Lead' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'nurture', label: 'Nurture' },
  { key: 'prequalified', label: 'Pre-Qualified' },
  { key: 'application', label: 'Application' },
  { key: 'processing', label: 'Processing' },
  { key: 'underwriting', label: 'Underwriting' },
  { key: 'clear_to_close', label: 'Clear to Close' },
  { key: 'funded', label: 'Funded' },
  { key: 'lost', label: 'Lost' },
];
export const STAGE_KEYS = STAGES.map((s) => s.key);
export const ACTIVE_LOAN_STAGES = ['application', 'processing', 'underwriting', 'clear_to_close'];

const DEFAULT_SETTINGS = {
  company_name: 'My Mortgage Co.',
  company_nmls: '',
  loan_officer_name: '',
  loan_officer_nmls: '',
  brand_color: '#0e7490',
  business_phone: '',
  business_address: '',
  timezone: 'America/Los_Angeles',
  market_rate_30yr: '6.25',
  market_rate_15yr: '5.50',
  assistant_name: 'Ava',
  assistant_mode: 'approval',
  assistant_voice: 'Warm, concise, and professional. Sounds like a real local loan officer, never salesy.',
  routing_mode: 'round_robin',
  routing_cursor: '0',
  quiet_start: '20:00',
  quiet_end: '08:00',
  daily_call_list_size: '25',
  dormant_days: '90',
  speed_to_lead_minutes: '5',
  auto_stage_rules: '1',
  last_market_rate_30yr: '',
  auto_enrich: '1',
  google_sync_enabled: '1',
  fub_sync_enabled: '1',
  inbound_api_key: '',
};

for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function getSetting(key) {
  return db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value ?? DEFAULT_SETTINGS[key];
}

export function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(
    key,
    value == null ? null : String(value),
  );
}

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS).filter((k) => k !== 'inbound_api_key');

const SECRET_SETTINGS = ['app_secret', 'google_tokens', 'google_sync_token', 'fub_api_key', 'inbound_api_key'];
/** Settings safe to send to the browser. */
export function publicSettings() {
  const s = getSettings();
  for (const k of SECRET_SETTINGS) delete s[k];
  return s;
}

export function tx(fn) {
  db.exec('BEGIN');
  try {
    const out = fn();
    db.exec('COMMIT');
    return out;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function json(value, fallback) {
  if (value == null || value === '') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
