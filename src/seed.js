/**
 * Demo data: a realistic mortgage database so you can explore every feature.
 *   npm run seed            (adds demo data; creates demo@example.com / demo1234 if no users exist)
 */
import { db, setSetting } from './db.js';
import { hashPassword } from './auth.js';
import { upsertContact, logActivity, changeStage } from './contacts.js';
import { rescoreAll } from './scoring.js';

const FIRST = ['James', 'Maria', 'Robert', 'Linda', 'Michael', 'Jennifer', 'David', 'Patricia', 'Daniel', 'Elizabeth', 'Carlos', 'Aisha', 'Kevin', 'Sarah', 'Thomas', 'Nicole', 'Brian', 'Jessica', 'Marcus', 'Emily', 'Anthony', 'Ashley', 'Ryan', 'Amanda', 'Jason', 'Megan', 'Eric', 'Rachel', 'Steven', 'Lauren'];
const LAST = ['Johnson', 'Garcia', 'Smith', 'Martinez', 'Brown', 'Nguyen', 'Davis', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Lee', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall'];
const CITIES = [['Temecula', 'CA', '92591'], ['Murrieta', 'CA', '92562'], ['San Diego', 'CA', '92128'], ['Oceanside', 'CA', '92056'], ['Escondido', 'CA', '92027'], ['Carlsbad', 'CA', '92009'], ['Menifee', 'CA', '92584']];
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const between = (lo, hi) => lo + Math.random() * (hi - lo);
const daysAgo = (d) => new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
const tsAgo = (d) => new Date(Date.now() - d * 86_400_000).toISOString().replace('T', ' ').slice(0, 19);

let owner = db.prepare(`SELECT id FROM users WHERE role = 'owner' ORDER BY id LIMIT 1`).get();
if (!owner) {
  const r = db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES ('Demo Loan Officer', 'demo@example.com', ?, 'owner')`).run(hashPassword('demo1234'));
  owner = { id: Number(r.lastInsertRowid) };
  setSetting('loan_officer_name', 'Demo Loan Officer');
  console.log('Created owner login: demo@example.com / demo1234');
}
if (!db.prepare(`SELECT id FROM users WHERE email = 'alex@example.com'`).get()) {
  db.prepare(`INSERT INTO users (name, email, password_hash, role, routing_weight) VALUES ('Alex Rivera', 'alex@example.com', ?, 'member', 2)`).run(hashPassword('demo1234'));
}
setSetting('company_name', db.prepare(`SELECT value FROM settings WHERE key='company_name'`).get().value || 'My Mortgage Co.');
setSetting('market_rate_30yr', '6.25');

let n = 0;
const make = (data, ageDays) => {
  const { contact } = upsertContact(data, { source: data.source, emitEvents: false });
  db.prepare('UPDATE contacts SET created_at = ?, stage_changed_at = ? WHERE id = ?').run(tsAgo(ageDays), tsAgo(ageDays), contact.id);
  n++;
  return contact;
};
const person = (i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 7) % LAST.length];
  const [city, state, zip] = rand(CITIES);
  return { address: `${100 + i * 7} ${rand(['Oak', 'Maple', 'Vista', 'Ridge', 'Canyon'])} ${rand(['St', 'Ave', 'Dr', 'Ct'])}`, first_name: first, last_name: last, email: `${first}.${last}${i}@example.com`.toLowerCase(), phone: `(951) 555-${String(1000 + i).slice(-4)}`, city, state, zip };
};

// Past clients - the refinance goldmine. Mix of 2023-2024 high-rate loans and 2020-2021 low-rate loans.
for (let i = 0; i < 28; i++) {
  const highRate = i % 3 !== 0;
  const value = Math.round(between(550, 1100)) * 1000;
  const c = make(
    {
      ...person(i),
      source: rand(['Past client', 'Past client', 'Referral']),
      lead_type: 'past_client',
      stage: 'funded',
      loan_type: rand(['Conventional', 'Conventional', 'FHA', 'VA', 'Jumbo']),
      property_value: value,
      loan_amount: Math.round(value * between(0.45, 0.88) / 1000) * 1000,
      current_rate: highRate ? +between(6.9, 7.9).toFixed(3) : +between(2.75, 3.6).toFixed(3),
      loan_close_date: highRate ? daysAgo(between(300, 900)) : daysAgo(between(1500, 2300)),
      tags: 'past-client',
    },
    between(400, 2000),
  );
  logActivity(c.id, { type: 'note', body: 'Closed loan. Great clients - asked to be kept in the loop on rates.' });
  db.prepare('UPDATE contacts SET last_contacted_at = ? WHERE id = ?').run(tsAgo(between(60, 400)), c.id);
}

// Purchase leads at various stages.
const timelines = ['ASAP', '1-3 months', '3-6 months', '6-12 months', 'Just exploring'];
const stages = ['new', 'new', 'contacted', 'nurture', 'nurture', 'prequalified', 'application', 'processing', 'underwriting', 'clear_to_close', 'lost'];
for (let i = 28; i < 62; i++) {
  const stage = rand(stages);
  const c = make(
    {
      ...person(i),
      source: rand(['Zillow', 'Website', 'Realtor referral', 'Open house', 'Facebook ad']),
      lead_type: 'purchase',
      purchase_timeline: rand(timelines),
      credit_band: rand(['Excellent (740+)', 'Good (700-739)', 'Fair (640-699)']),
      loan_type: rand(['Conventional', 'FHA', 'VA', 'Not sure']),
      preapproved: Math.random() < 0.2,
      first_time_buyer: Math.random() < 0.4,
      is_veteran: Math.random() < 0.15,
      property_value: Math.round(between(450, 900)) * 1000,
    },
    stage === 'new' ? between(0, 2) : between(5, 240),
  );
  if (stage !== 'new') changeStage(c.id, stage, { reason: 'seed' });
  if (['contacted', 'prequalified', 'application', 'processing'].includes(stage)) {
    logActivity(c.id, { type: 'call', direction: 'out', body: 'Discussed budget and timeline.', meta: { outcome: 'connected' } });
    if (Math.random() < 0.5) logActivity(c.id, { type: 'sms', direction: 'in', body: rand(['Thanks! We found a place we like in Murrieta.', 'Can you send me the pre-approval letter?', 'We are hoping to buy in the spring.']) });
  }
  if (stage === 'nurture') db.prepare('UPDATE contacts SET last_contacted_at = ? WHERE id = ?').run(tsAgo(between(95, 200)), c.id);
}

// Refinance inquiries.
for (let i = 62; i < 70; i++) {
  const value = Math.round(between(600, 950)) * 1000;
  make(
    {
      ...person(i),
      source: rand(['Website', 'Facebook ad']),
      lead_type: 'refinance',
      property_value: value,
      loan_amount: Math.round(value * between(0.5, 0.8) / 1000) * 1000,
      current_rate: +between(6.8, 7.6).toFixed(3),
      loan_type: rand(['Conventional', 'FHA']),
      loan_close_date: daysAgo(between(400, 800)),
    },
    between(1, 30),
  );
}

// Landing pages and campaigns.
const lp = db.prepare(`INSERT OR IGNORE INTO landing_pages (slug, title, headline, subheadline, body, cta, lead_type, fields, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
lp.run('refi-check', 'Free Refinance Check', 'Is your rate still working for you?', 'Find out in 2 minutes whether a refinance could lower your payment or free up cash.', 'No credit pull. No obligation. Just a straight answer from a local loan officer.', 'Check My Options', 'refinance', JSON.stringify(['first_name', 'last_name', 'email', 'phone', 'property_value', 'loan_amount', 'current_rate']), 'refi-funnel');
lp.run('buy-a-home', 'Home Buyer Pre-Approval', 'Shop for homes with confidence', 'Get pre-approved by a local lender who answers the phone.', 'Know your numbers before you fall in love with a house.', 'Start My Pre-Approval', 'purchase', JSON.stringify(['first_name', 'last_name', 'email', 'phone', 'purchase_timeline', 'credit_band', 'is_veteran', 'first_time_buyer']), 'buyer-funnel');

const camp = db.prepare(`INSERT INTO campaigns (name, channel, subject, email_body, sms_body, audience, trigger, trigger_config, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
if (!db.prepare('SELECT COUNT(*) n FROM campaigns').get().n) {
  camp.run('Rate drop alert - past clients', 'both', 'Rates have moved, {{first_name}}', "Hi {{first_name}},\n\nRates have shifted since you closed on your loan, and for some of my clients that's opened up a real chance to lower their payment.\n\nWant me to run a no-pressure comparison for you? Just reply to this email.\n\n{{lo_name}}\n{{company}}", 'Hi {{first_name}}, {{lo_name}} here. Rates have moved since your loan closed - want me to run a quick comparison for you?', JSON.stringify({ lead_types: ['past_client', 'refinance'] }), 'rate_drop', JSON.stringify({ gap: 0.75 }), 'active');
  camp.run('Loan anniversary check-in', 'email', 'Happy home-iversary, {{first_name}}!', "Hi {{first_name}},\n\nIt's been another year since we closed on your home - congratulations! I like to do a quick annual mortgage review with my clients to make sure your loan still fits your goals.\n\nReply and let me know a good time to chat.\n\n{{lo_name}}", '', JSON.stringify({ lead_types: ['past_client'] }), 'loan_anniversary', '{}', 'active');
  camp.run('New buyer welcome', 'sms', '', '', "Hi {{first_name}}, it's {{lo_name}} with {{company}}. Thanks for reaching out! Are you already looking at homes or still figuring out your budget?", JSON.stringify({ lead_types: ['purchase'] }), 'new_lead', '{}', 'draft');
}

if (!db.prepare('SELECT COUNT(*) n FROM voicemail_drops').get().n) {
  db.prepare('INSERT INTO voicemail_drops (name, script) VALUES (?, ?)').run(
    'Rate review - past clients',
    "Hi {{first_name}}, it's {{lo_name}} with {{company}}. Rates have moved since your loan closed, and I wanted to see if a quick no-pressure review makes sense for you. Give me a call or text back when you have a minute. Talk soon!",
  );
  db.prepare('INSERT INTO voicemail_drops (name, script) VALUES (?, ?)').run(
    'New lead - first touch',
    "Hi {{first_name}}, this is {{lo_name}} with {{company}}. Thanks for reaching out about a home loan! I'd love to learn a little about what you're looking for. Call or text me back at this number anytime.",
  );
}

const r = rescoreAll();
console.log(`Seeded ${n} contacts; scored ${r.scored}.`);
