import { db, getSettings } from './db.js';
import { getContact, logActivity } from './contacts.js';
import { twilio, providerStatus, signId, APP_URL, SendBlocked } from './messaging.js';
import { mergeVars } from './campaigns.js';
import { escapeHtml, render, inQuietHours } from './util.js';

/**
 * Voicemail drops: Twilio places the call with answering-machine detection.
 *  - Voicemail picks up → wait for the beep, play your recording (or read your script), hang up.
 *  - A person picks up → "connecting you now" and bridge them to the loan officer's phone.
 * Calls are blocked during quiet hours and for opted-out / Do Not Contact contacts.
 */

export function listDrops() {
  return db.prepare('SELECT * FROM voicemail_drops ORDER BY id DESC').all();
}

export function saveDrop({ id, name, script, audio_url }) {
  if (!name?.trim()) throw new SendBlocked('Give the voicemail a name');
  if (!script?.trim() && !audio_url?.trim()) throw new SendBlocked('Add a script or an audio file URL');
  if (audio_url && !/^https:\/\//i.test(audio_url.trim())) throw new SendBlocked('Audio URL must start with https://');
  if (id) {
    db.prepare('UPDATE voicemail_drops SET name = ?, script = ?, audio_url = ? WHERE id = ?').run(name.trim(), script || null, audio_url?.trim() || null, id);
    return id;
  }
  return Number(db.prepare('INSERT INTO voicemail_drops (name, script, audio_url) VALUES (?, ?, ?)').run(name.trim(), script || null, audio_url?.trim() || null).lastInsertRowid);
}

export function deleteDrop(id) {
  db.prepare('DELETE FROM voicemail_drops WHERE id = ?').run(id);
}

/** Drop one voicemail. Returns { simulated, callId }. */
export async function dropVoicemail(contactId, dropId, user) {
  const contact = getContact(contactId);
  const drop = db.prepare('SELECT * FROM voicemail_drops WHERE id = ?').get(dropId);
  const s = getSettings();
  if (!contact) throw new SendBlocked('Contact not found');
  if (!drop) throw new SendBlocked('Voicemail not found');
  if (contact.dnc) throw new SendBlocked('Contact is marked Do Not Contact');
  if (contact.opted_out_sms) throw new SendBlocked('Contact opted out (STOP) - no prerecorded calls');
  if (!contact.phone_norm) throw new SendBlocked('Contact has no valid phone number');
  if (inQuietHours(s.timezone, s.quiet_start, s.quiet_end)) throw new SendBlocked('Quiet hours - voicemail drops are paused until morning');

  const callId = Number(
    db.prepare('INSERT INTO voicemail_calls (contact_id, drop_id, user_id) VALUES (?, ?, ?)').run(contactId, dropId, user?.id ?? null).lastInsertRowid,
  );
  if (providerStatus().voice !== 'twilio') {
    db.prepare(`UPDATE voicemail_calls SET status = 'completed', answered_by = 'simulated', updated_at = datetime('now') WHERE id = ?`).run(callId);
    logActivity(contactId, { type: 'voicemail', direction: 'out', subject: drop.name, body: renderScript(drop, contact), userId: user?.id ?? null, meta: { simulated: true, drop_id: dropId } });
    return { simulated: true, callId };
  }
  const sig = signId('vm', callId);
  const r = await twilio('Calls.json', {
    To: contact.phone_norm,
    From: process.env.TWILIO_FROM_NUMBER,
    Url: `${APP_URL}/webhooks/twilio/vm/${callId}/${sig}`,
    Method: 'POST',
    MachineDetection: 'DetectMessageEnd',
    MachineDetectionTimeout: '30',
    StatusCallback: `${APP_URL}/webhooks/twilio/vm-status/${callId}/${sig}`,
    StatusCallbackMethod: 'POST',
  });
  db.prepare(`UPDATE voicemail_calls SET call_sid = ?, status = 'calling', updated_at = datetime('now') WHERE id = ?`).run(r.sid, callId);
  return { simulated: false, callId };
}

/** Drop the same voicemail to many contacts. Skips anyone blocked; never throws for one bad contact. */
export async function dropMany(contactIds, dropId, user) {
  const out = { queued: 0, skipped: [] };
  for (const id of contactIds.slice(0, 200)) {
    try {
      await dropVoicemail(id, dropId, user);
      out.queued++;
    } catch (err) {
      out.skipped.push({ id, reason: err.message });
      if (/Quiet hours/.test(err.message)) break;
    }
  }
  return out;
}

function renderScript(drop, contact) {
  return render(drop.script || '', mergeVars(contact));
}

/** TwiML for the call once Twilio knows who (or what) answered. */
export function voicemailTwiml(callId, answeredBy) {
  const call = db.prepare('SELECT * FROM voicemail_calls WHERE id = ?').get(callId);
  if (!call) return '<Response><Hangup/></Response>';
  const contact = getContact(call.contact_id);
  const drop = db.prepare('SELECT * FROM voicemail_drops WHERE id = ?').get(call.drop_id);
  db.prepare(`UPDATE voicemail_calls SET answered_by = ?, updated_at = datetime('now') WHERE id = ?`).run(answeredBy || 'unknown', callId);
  if (!contact || !drop) return '<Response><Hangup/></Response>';

  if (String(answeredBy).startsWith('machine') || answeredBy === 'unknown') {
    const msg = drop.audio_url ? `<Play>${escapeHtml(drop.audio_url)}</Play>` : `<Say voice="Polly.Joanna">${escapeHtml(renderScript(drop, contact))}</Say>`;
    return `<Response><Pause length="1"/>${msg}<Hangup/></Response>`;
  }
  if (answeredBy === 'fax') return '<Response><Hangup/></Response>';
  // A live person answered: connect them to the loan officer.
  const lo = db.prepare('SELECT * FROM users WHERE id = ?').get(call.user_id || contact.owner_id);
  const s = getSettings();
  if (lo?.phone) {
    return `<Response><Say voice="Polly.Joanna">Hi ${escapeHtml(contact.first_name || 'there')}, this is a call from ${escapeHtml(s.company_name)}. Connecting you with ${escapeHtml(lo.name)} now.</Say><Dial callerId="${escapeHtml(process.env.TWILIO_FROM_NUMBER || '')}" timeout="20">${escapeHtml(lo.phone)}</Dial></Response>`;
  }
  return `<Response><Say voice="Polly.Joanna">Hi ${escapeHtml(contact.first_name || 'there')}, this is ${escapeHtml(s.company_name)}. We'll give you a call back shortly. Thanks!</Say><Hangup/></Response>`;
}

/** Final call status from Twilio: log the outcome on the contact timeline. */
export function voicemailStatus(callId, { CallStatus, AnsweredBy, CallDuration }) {
  const call = db.prepare('SELECT * FROM voicemail_calls WHERE id = ?').get(callId);
  if (!call) return;
  const answered = AnsweredBy || call.answered_by;
  db.prepare(`UPDATE voicemail_calls SET status = ?, answered_by = COALESCE(?, answered_by), updated_at = datetime('now') WHERE id = ?`).run(CallStatus || 'completed', AnsweredBy || null, callId);
  if (!['completed', 'busy', 'no-answer', 'failed', 'canceled'].includes(CallStatus)) return;
  const drop = db.prepare('SELECT name FROM voicemail_drops WHERE id = ?').get(call.drop_id);
  let body;
  if (CallStatus !== 'completed') body = `Voicemail drop not delivered (${CallStatus})`;
  else if (String(answered).startsWith('machine') || answered === 'unknown') body = `Voicemail left: "${drop?.name || 'voicemail'}"`;
  else if (answered === 'human') body = `Answered live during voicemail drop - connected to loan officer (${CallDuration || 0}s)`;
  else body = `Voicemail drop ended (${answered || 'unknown'})`;
  logActivity(call.contact_id, { type: 'voicemail', direction: 'out', subject: drop?.name, body, userId: call.user_id, meta: { answered_by: answered, status: CallStatus, duration: Number(CallDuration) || null } });
}
