import { db, getSetting } from './db.js';
import { getContact, logActivity } from './contacts.js';
import { rescoreContact } from './scoring.js';
import { titleCase } from './util.js';

/**
 * Property enrichment.
 *  1. Address standardization + county + coordinates from the free US Census geocoder (no key).
 *  2. Home value (AVM), property facts, last sale, and recorded mortgage from ATTOM when ATTOM_API_KEY is set.
 * Enrichment only fills blanks for fields you enter yourself (property value, loan amount, close date);
 * AVM and property facts are stored in their own columns and refreshed every 90 days.
 */

export function enrichmentStatus() {
  return { geocoder: 'census', property_data: process.env.ATTOM_API_KEY ? 'attom' : 'off' };
}

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const isoDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

async function getJSON(url, headers = {}, timeoutMs = 12_000) {
  const res = await fetch(url, { headers: { accept: 'application/json', ...headers }, signal: AbortSignal.timeout(timeoutMs) });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body?.status?.msg || body?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return body;
}

export async function geocode(oneLine) {
  const url = `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?address=${encodeURIComponent(oneLine)}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Counties&format=json`;
  const data = await getJSON(url);
  const m = data?.result?.addressMatches?.[0];
  if (!m) return null;
  const comp = m.addressComponents || {};
  // matchedAddress looks like "123 MAIN ST, TEMECULA, CA, 92591"
  const [street] = String(m.matchedAddress || '').split(',');
  return {
    address: titleCase(street?.trim()) || null,
    city: titleCase(comp.city) || null,
    state: comp.state || null,
    zip: comp.zip || null,
    county: m.geographies?.Counties?.[0]?.NAME || null,
    lat: m.coordinates?.y ?? null,
    lng: m.coordinates?.x ?? null,
  };
}

const ATTOM = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

async function attom(path, c) {
  const params = new URLSearchParams({ address1: c.address, address2: [c.city, [c.state, c.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ') });
  try {
    const data = await getJSON(`${ATTOM}/${path}?${params}`, { apikey: process.env.ATTOM_API_KEY });
    return data?.property?.[0] || null;
  } catch (err) {
    // ATTOM answers 400 "SuccessWithoutResult" when it has no record for the address.
    if (err.status === 400 || err.status === 404) return null;
    throw err;
  }
}

export async function propertyData(c) {
  if (!process.env.ATTOM_API_KEY || !c.address) return null;
  const [avmP, mortP] = await Promise.all([attom('attomavm/detail', c), attom('property/detailmortgage', c)]);
  if (!avmP && !mortP) return null;
  const p = avmP || mortP;
  const avm = avmP?.avm || {};
  const bldg = p.building || {};
  const sale = avmP?.sale || mortP?.sale || {};
  const mort = mortP?.mortgage?.FirstConcurrent || mortP?.mortgage?.firstConcurrent || {};
  return {
    avm_value: num(avm.amount?.value),
    avm_low: num(avm.amount?.low),
    avm_high: num(avm.amount?.high),
    avm_date: isoDate(avm.eventDate),
    year_built: num(p.summary?.yearbuilt),
    sqft: num(bldg.size?.livingsize ?? bldg.size?.universalsize),
    beds: num(bldg.rooms?.beds),
    baths: num(bldg.rooms?.bathstotal),
    last_sale_date: isoDate(sale.saleTransDate || sale.amount?.salerecdate || sale.salesearchdate),
    last_sale_price: num(sale.amount?.saleamt),
    mortgage_amount: num(mort.amount),
    mortgage_date: isoDate(mort.date),
    lender_name: [mort.lenderFirstName, mort.lenderLastName].filter(Boolean).join(' ').trim() || null,
  };
}

/** Enrich one contact. Returns a summary of what changed. */
export async function enrichContact(id, { force = false } = {}) {
  const c = getContact(id);
  if (!c) throw new Error('Contact not found');
  if (!c.address || !(c.zip || (c.city && c.state))) {
    db.prepare(`UPDATE contacts SET enriched_at = datetime('now'), enrich_error = ? WHERE id = ?`).run('Needs a street address plus ZIP or city/state', id);
    return { updated: [], error: 'Needs a street address plus ZIP or city/state' };
  }
  if (!force && c.enriched_at && !c.enrich_error) {
    const age = (Date.now() - new Date(`${c.enriched_at.replace(' ', 'T')}Z`).getTime()) / 86_400_000;
    if (age < 90) return { updated: [], skipped: 'Enriched recently' };
  }

  const patch = {};
  let error = null;
  try {
    const g = await geocode([c.address, c.city, c.state, c.zip].filter(Boolean).join(', '));
    if (g) {
      Object.assign(patch, { address: g.address || c.address, city: g.city || c.city, state: g.state || c.state, zip: g.zip || c.zip, county: g.county, lat: g.lat, lng: g.lng, address_verified: 1 });
    } else {
      patch.address_verified = 0;
      error = 'Address not found by the Census geocoder';
    }
  } catch (err) {
    error = `Geocoder: ${err.message}`;
  }

  try {
    const p = await propertyData({ ...c, ...patch });
    if (p) {
      for (const k of ['avm_value', 'avm_low', 'avm_high', 'avm_date', 'year_built', 'sqft', 'beds', 'baths', 'last_sale_date', 'last_sale_price', 'lender_name']) if (p[k] != null) patch[k] = p[k];
      // Fill blanks only - never overwrite numbers the loan officer entered.
      if (!c.property_value && p.avm_value) patch.property_value = p.avm_value;
      if (!c.loan_amount && p.mortgage_amount) patch.loan_amount = p.mortgage_amount;
      if (!c.loan_close_date && p.mortgage_date) patch.loan_close_date = p.mortgage_date;
      error = null;
    } else if (process.env.ATTOM_API_KEY && !error) {
      error = 'No property record found';
    }
  } catch (err) {
    error = `Property data: ${err.message}`;
  }

  const before = c;
  const changed = Object.keys(patch).filter((k) => patch[k] != null && String(patch[k]) !== String(before[k] ?? ''));
  const cols = Object.keys(patch).filter((k) => patch[k] !== undefined);
  db.prepare(`UPDATE contacts SET ${[...cols.map((k) => `${k} = ?`), `enriched_at = datetime('now')`, 'enrich_error = ?'].join(', ')} WHERE id = ?`).run(
    ...cols.map((k) => patch[k]),
    error,
    id,
  );
  const visible = changed.filter((k) => !['lat', 'lng', 'address_verified'].includes(k));
  if (visible.length) {
    const bits = [];
    if (patch.avm_value) bits.push(`est. value $${Math.round(patch.avm_value).toLocaleString()}`);
    if (patch.county) bits.push(`${patch.county}`);
    if (changed.includes('loan_amount')) bits.push(`recorded loan $${Math.round(patch.loan_amount).toLocaleString()}`);
    logActivity(id, { type: 'system', body: `Property data updated${bits.length ? `: ${bits.join(' · ')}` : ''}`, meta: { enrichment: visible } });
    rescoreContact(id);
  }
  return { updated: visible, error };
}

/** Background queue: enrich contacts with addresses that were never enriched or are 90+ days stale. */
export async function enrichPending(limit = 15) {
  if (getSetting('auto_enrich') !== '1') return { enriched: 0 };
  const rows = db
    .prepare(
      `SELECT id FROM contacts WHERE address IS NOT NULL AND address <> '' AND (zip IS NOT NULL OR (city IS NOT NULL AND state IS NOT NULL))
       AND (enriched_at IS NULL OR enriched_at <= datetime('now','-90 days')) ORDER BY enriched_at IS NOT NULL, id LIMIT ?`,
    )
    .all(limit);
  let enriched = 0;
  for (const { id } of rows) {
    try {
      const r = await enrichContact(id, { force: true });
      if (r.updated.length) enriched++;
    } catch (err) {
      console.error(`[enrich] contact ${id}:`, err.message);
    }
  }
  return { enriched, attempted: rows.length };
}
