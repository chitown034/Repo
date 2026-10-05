import { db, getSettings, getSetting, setSetting } from './db.js';
import { bus } from './events.js';
import { fireTrigger, runScheduledTriggers, attributeReply, attributeConversion } from './campaigns.js';
import { scanForOutreach, proposeOutreach } from './assistant.js';
import { processOutbox } from './messaging.js';
import { rescoreAll } from './scoring.js';
import { buildMonthlyReport, previousPeriod } from './reports.js';
import { localMinutes } from './util.js';
import { enrichContact, enrichPending } from './enrichment.js';
import { syncGoogle, syncFollowUpBoss, googleStatus } from './integrations.js';

/** Wire behavioral automation to core events. */
export function registerAutomation() {
  bus.on('contact.created', async ({ contact }) => {
    fireTrigger('new_lead', contact);
    if (getSetting('auto_enrich') === '1' && contact.address) await enrichContact(contact.id).catch((e) => console.error('[enrich]', e.message));
  });

  bus.on('form.submitted', async ({ contact, landingPageId }) => {
    fireTrigger('form_submitted', contact, { landingPageId });
    // Speed to lead: draft the first touch immediately instead of waiting for the next scan.
    if (getSetting('assistant_mode') !== 'off') await proposeOutreach(contact.id, 'New lead from a landing page form');
  });

  bus.on('stage.changed', ({ contact, from, to }) => {
    fireTrigger('stage_entered', contact, { from, to });
    if (['application', 'processing', 'underwriting', 'clear_to_close', 'funded'].includes(to)) attributeConversion(contact.id);
    if (['application', 'processing', 'underwriting', 'clear_to_close'].includes(to)) {
      // Active loans are handled by the LO and processor; keep automated outreach out of the way.
      db.prepare(`UPDATE ai_drafts SET status = 'rejected', decided_at = datetime('now') WHERE contact_id = ? AND status = 'pending'`).run(contact.id);
    }
  });

  bus.on('contact.replied', ({ contact }) => {
    attributeReply(contact.id);
    fireTrigger('replied', contact);
  });

  bus.on('score.changed', ({ contact, before, after }) => {
    fireTrigger('score_crossed', contact, { before, after });
  });

  bus.on('settings.changed', ({ changed }) => {
    if ('market_rate_30yr' in changed) {
      const rescored = rescoreAll();
      console.log(`[automation] market rate changed; rescored ${rescored.scored} contacts`);
      runScheduledTriggers();
    }
  });
}

let running = false;
async function guarded(name, fn) {
  try {
    return await fn();
  } catch (err) {
    console.error(`[scheduler] ${name} failed:`, err);
  }
}

/**
 * Background jobs:
 *  - every minute: deliver queued messages (outside quiet hours for SMS)
 *  - every 15 minutes: assistant scan + time-based campaign triggers
 *  - nightly (2am local): rescore the whole database
 *  - 1st of the month: build the Monthly Intelligence Report
 */
export function startScheduler() {
  let tick = 0;
  const loop = async () => {
    if (running) return;
    running = true;
    try {
      const s = getSettings();
      await guarded('outbox', () => processOutbox());
      if (tick % 15 === 0) {
        await guarded('triggers', () => runScheduledTriggers());
        await guarded('assistant scan', () => scanForOutreach());
        await guarded('enrichment', () => enrichPending());
      }
      if (tick % 60 === 0) {
        const stale = (iso) => !iso || Date.now() - new Date(iso).getTime() > 24 * 3600_000;
        if (s.google_sync_enabled === '1' && googleStatus().connected && stale(s.google_last_sync)) await guarded('google sync', () => syncGoogle());
        if (s.fub_sync_enabled === '1' && s.fub_api_key && stale(s.fub_last_sync)) await guarded('follow up boss sync', () => syncFollowUpBoss());
      }
      const today = new Date().toLocaleDateString('en-CA', { timeZone: s.timezone });
      const mins = localMinutes(s.timezone);
      if (mins >= 120 && s.last_nightly_run !== today) {
        setSetting('last_nightly_run', today);
        await guarded('nightly rescore', () => {
          const r = rescoreAll();
          console.log(`[scheduler] nightly rescore: ${r.scored} contacts, ${r.moved} moved`);
        });
      }
      const period = previousPeriod();
      if (s.last_report_period !== period) {
        setSetting('last_report_period', period);
        await guarded('monthly report', () => buildMonthlyReport(period));
      }
    } finally {
      running = false;
      tick++;
    }
  };
  setTimeout(loop, 3000);
  return setInterval(loop, 60_000);
}
