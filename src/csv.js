/** RFC 4180 CSV parsing/serialization (quoted fields, embedded commas/newlines, BOM). */
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const s = String(text).replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((v) => v !== '')) rows.push(row);
  if (!rows.length) return { headers: [], records: [] };
  const headers = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
  return { headers, records };
}

export function toCSV(rows, columns) {
  const esc = (v) => {
    if (v == null) return '';
    const str = String(v);
    // Neutralize spreadsheet formula injection.
    const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [columns.join(','), ...rows.map((r) => columns.map((c) => esc(r[c])).join(','))].join('\r\n');
}

/**
 * Map arbitrary CSV headers (Google Contacts, Outlook, other CRMs, LOS exports) to CRM fields.
 */
const ALIASES = {
  first_name: ['first name', 'firstname', 'first', 'given name', 'borrower first name', 'fname'],
  last_name: ['last name', 'lastname', 'last', 'family name', 'surname', 'borrower last name', 'lname'],
  name: ['name', 'full name', 'contact name', 'borrower name', 'borrower'],
  email: ['email', 'e-mail', 'email address', 'e-mail 1 - value', 'e-mail address', 'primary email', 'borrower email'],
  phone: ['phone', 'phone number', 'mobile', 'mobile phone', 'cell', 'cell phone', 'phone 1 - value', 'primary phone', 'home phone', 'borrower phone'],
  address: ['address', 'street', 'street address', 'property address', 'address 1 - street', 'subject property address'],
  city: ['city', 'address 1 - city', 'property city'],
  state: ['state', 'address 1 - region', 'province', 'property state'],
  zip: ['zip', 'zip code', 'postal code', 'zipcode', 'address 1 - postal code', 'property zip'],
  source: ['source', 'lead source'],
  lead_type: ['lead type', 'type', 'contact type'],
  loan_type: ['loan type', 'loan program', 'program', 'product'],
  loan_purpose: ['loan purpose', 'purpose'],
  credit_band: ['credit', 'credit score', 'fico', 'credit band', 'credit rating'],
  property_value: ['property value', 'home value', 'value', 'appraised value', 'estimated value', 'purchase price'],
  loan_amount: ['loan amount', 'loan balance', 'balance', 'mortgage balance', 'base loan amount'],
  current_rate: ['rate', 'interest rate', 'note rate', 'current rate'],
  loan_close_date: ['close date', 'closing date', 'funded date', 'funding date', 'closed date', 'loan close date'],
  purchase_timeline: ['timeline', 'timeframe', 'purchase timeline', 'time frame'],
  tags: ['tags', 'labels', 'groups', 'group membership'],
  stage: ['stage', 'status'],
  is_veteran: ['veteran', 'va eligible', 'military'],
  first_time_buyer: ['first time buyer', 'first-time buyer', 'ftb'],
  preapproved: ['preapproved', 'pre-approved', 'pre approved'],
};

export function autoMap(headers) {
  const map = {};
  for (const h of headers) {
    const key = h.toLowerCase().replace(/[_]+/g, ' ').trim();
    for (const [field, aliases] of Object.entries(ALIASES)) {
      if (key === field.replace(/_/g, ' ') || aliases.includes(key)) {
        if (!Object.values(map).includes(field)) map[h] = field;
        break;
      }
    }
  }
  return map;
}
