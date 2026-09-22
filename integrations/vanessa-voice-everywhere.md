# Vanessa speaks on every channel, not only at the dashboard

**Written 2026-09-22.** Owner: Integration Engineer (under CTO Innovator).
Status: **spec written — the Mac side is not changed yet.** Steven pastes two prompt amendments.

## The gap, stated exactly

Vanessa and Steve already have real voices. The machinery works, it has been used, and the deck
plays their own rendered audio with the face moving — no `speechSynthesis`, no catalog voice.

But it only ever fires when Steven is **sitting at the dashboard**. The comment in the page says why,
in one line:

```
page -> voiceReplyQueue {items:[{id, who, text, ts}]}          (only the page writes it)
```

`voiceReplyQueue` is written by the Command Deck page and by nothing else. So when Steven texts
Vanessa on iMessage — the channel he actually uses when he is away from the Mac — she answers in
**text, silently**. Same for Discord, and the same would be true of WhatsApp once it is installed.

The evidence that this has been dormant, read from the live store on 2026-09-22:

| Document | What it holds | Age |
|---|---|---|
| `voiceReplyQueue` | one item, `id teststeve01`, `who: "Steve"` | **2026-09-12** |
| `voiceReplyStatus` | `{teststeve01: {status: "ready", parts: 1}}` | 2026-09-12 |
| `voiceReply_teststeve01_0` | the rendered audio, 144 KB | 2026-09-12 |
| `speakDiag` | newest event `clip-playing` / `prime` | 2026-09-16 |

`voice-reply-render` itself is healthy — `*/10 * * * *`, `lastStatus ok`. It has simply had nothing
to render since the 12th, because the only writer is a browser tab.

## The chain, after this change

```
Steven texts Vanessa on iMessage
  └─ vanessa-imessage-inbox (Mac, */10) answers as Vanessa
       ├─ 1. replies in TEXT on the thread          ← unchanged, and always first
       └─ 2. appends {id, who, text, ts, channel, deliver, replyTo} to voiceReplyQueue
            └─ voice-reply-render (Mac, */10) renders it in her own voice (Seed Audio)
                 ├─ writes voiceReply_<id>_<n> + voiceReplyStatus   ← unchanged; the deck still plays it
                 └─ if deliver is set: stages the MP3 and sends it back on the SAME thread
                      └─ Steven gets Vanessa's actual voice as a voice note, ~1 poll later
```

Nothing about the deck's playback changes. The queue gains three optional fields and a second
consumer; an item without them behaves exactly as today.

## The three changes

**1. The queue contract widens — any channel may write it, not only the page.**

```js
{ id, who, text, ts,                     // unchanged, still required
  channel:  "deck" | "imessage" | "discord" | "whatsapp",   // default "deck"
  deliver:  null | "imessage" | "discord" | "whatsapp",     // null = render only, deck plays it
  replyTo:  "<conversation_id or thread id>" | null }       // where the audio goes back
```

An item with `deliver: null` is exactly today's behaviour. `channel` is for the deck's status card
and for telling one source's items from another; `deliver` is what makes the renderer send.

**2. `voice-reply-render` gains a delivery step.** After it writes `voiceReplyStatus[id].status =
"ready"`, if the item carries `deliver`, it sends the audio back on that channel. For iMessage that
is Inkbox, which accepts **MP3/WAV up to 10 MiB** for `purpose: "imessage"`:

- `inkbox_media_stage` with `source_type: "base64"`, `purpose: "imessage"`, `content_type: "audio/mpeg"` → returns `{handle, content_hash}`
- `inkbox_imessage_send` with `recipient`, the `conversation_id` from `replyTo`, and `media: [{handle, content_hash}]`

Then set `voiceReplyStatus[id].delivered = {channel, at, ok, error}` so the deck can show whether
the voice note actually went, rather than only whether the audio rendered.

**3. The inbox tasks enqueue after they reply.** `vanessa-imessage-inbox`, the Discord inbox and
(when it exists) `vanessa-whatsapp-inbox` each append one queue item after their text reply lands.

## Rules this must not break

- **Text first, always.** The text reply goes out before anything is queued, and a voice failure
  never blocks, delays or replaces it. If Seed Audio is down, Steven still got his answer ten
  minutes ago. Voice is additive.
- **One voice note per reply, and only when it is worth hearing.** Queue a reply for voice when the
  spoken text is **40–700 characters**. Below 40 it is an acknowledgement and a text bubble is
  better. Above 700 it becomes a multi-minute voice note nobody plays — send the text and have her
  speak a short lead-in instead (`text` carries the lead-in, not the whole answer).
- **Never voice a HALT answer.** A Needs-Steven packet, a rate quote, an eligibility call or
  anything on the HALT list stays text — it needs to be read and kept, not heard once.
- **Never voice client PII.** If the reply names a client, an address, a loan amount or an account,
  queue nothing and log why. The text reply already carries it; audio of it travelling through a
  third-party messaging API is a disclosure the text is not.
- **Only Steven's own number.** `deliver` may only target a thread Steven himself is on. Never a
  client, never a group, never an unrecognised number — the allow-list lives with the inbox task,
  not in the queue item.
- **Cap the queue.** The page keeps the newest 10; the Mac writers keep that cap. Audio pieces are
  up to 256 KB per document and the store has a ~5 MB working budget.

## What is unverified here, and how you would know

Nothing in this document has run. Specifically:

- Whether Seed Audio's output is small enough for a 10 MiB iMessage attachment at a normal reply
  length — likely yes at ~30 s a piece, but it has never been measured.
- Whether Inkbox accepts the renderer's exact MP3 encoding. `inkbox_media_stage` documents MP3 and
  WAV; the encoder Seed Audio produces has not been round-tripped through it.
- Whether a multi-part reply should go as several voice notes or one concatenated clip. The spec
  says **one clip per reply, concatenated** — a thread of six voice notes is worse than one.
- The Discord and WhatsApp delivery paths are sketched, not specified. iMessage is the one Steven
  asked for and the only one with a proven media API in this system.

The first run tells you all of it: `voiceReplyStatus[id].delivered.ok`, and whether a voice note
appears on the thread.

## What Steven does

1. Paste the two prompt amendments in `integrations/mac-task-specs.md` §6 into
   `voice-reply-render` and `vanessa-imessage-inbox` on the Mac.
2. Text Vanessa something that takes more than a sentence to answer.
3. Within ~20 minutes: a text reply, then her voice on the same thread.

If the text arrives and the voice does not, read `voiceReplyStatus` — `status` says whether it
rendered, `delivered` says whether it sent, and `error` says which of the two failed.
