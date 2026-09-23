# Vanessa speaks on every channel, not only at the dashboard

**Written 2026-09-22.** Owner: Integration Engineer (under CTO Innovator).
Status: **spec written; the Mac side is still not changed.** Steven pastes the prompt amendments.
**Verified 2026-09-22 (P5):** the iMessage half of this design was measured against the live store
and against Inkbox without sending anything — see *Measured on 2026-09-22* below. The encoder's
output is accepted by `inkbox_media_stage` and is ~1 % of the attachment cap. Discord and WhatsApp
were specified and both came back **no send path**.
**Extended 2026-09-23 (R4):** the link workaround was tested and the answer is nuanced — the
artifact **asset store cannot hold audio at all**, and what it hands back is not a link anyway;
the clip has to ride inside an artifact **page**, whose URL is **private to Steven**. And the
channel nobody had checked turned out to be the best result of the day: **email takes an audio
attachment**, so it is a second channel where Vanessa can actually speak. Nothing was sent.

## Per-channel: what she does today, what she does after Steven's steps, what she cannot do

| Channel | Today | After Steven's steps | Genuinely impossible, and why |
|---|---|---|---|
| **Command Deck** | **Speaks.** The page writes `voiceReplyQueue`, `voice-reply-render` renders, the deck plays her own audio with the face moving. | Unchanged. Every other channel is additive to this one. | — |
| **iMessage** | Answers in **text, silently**. | **Her actual voice**, as a voice note on the same thread, ~1 poll after the text. §6a + §6b. | — Nothing. `inkbox_media_stage` accepts this exact encoder and the clip is 1.03 % of the 10 MiB cap. |
| **Email** | Answers in text. Active identity, verified sending domain. | **Her actual voice**, as an MP3 attached to the reply. §6c. | — Nothing. `inkbox_email_attachment_upload` accepted `audio/mpeg` and returned a handle on 2026-09-23. |
| **Discord** | Nothing — the channel is not connected. | **Text, plus a link Steven can tap.** Not audio. | **Native audio.** `DISCORDBOT_CREATE_MESSAGE` is the only send tool available and has no file, attachment or audio parameter. Nothing in this system can attach a file to a Discord message. |
| **WhatsApp** | Nothing — not installed. | **Text, plus a link Steven can tap**, once the channel exists at all. Not audio. | **Native audio.** `message send` is `whatsapp://send?phone=…&text=…` driven through System Events. That URL carries a phone number and a text string. There is no parameter an MP3 can travel in. |
| **SMS** | Unavailable. | Unavailable. | **The whole channel.** `phone.assigned: false` and `sms_available: false` — the `jasmine` identity has no number. Not a fallback for anything. |

Two things that table is saying, said plainly. **Vanessa speaks on two channels, not four** — iMessage and
email — and on both it is a real audio file, her own rendered voice. **On Discord and WhatsApp she will
never speak**, because neither has any way to carry an audio file; the best available there is a written
reply with a link, and that link only opens for Steven, signed in (see *The link path* below).

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
| `speakDiag` | 24 events, all `prime` / `clip-playing` / `clip-done` of the banked opener clip — none of them this queue item | **2026-09-22** (re-read; doc version 225, newest event 18:03:41Z) |

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
  channel:  "deck" | "imessage" | "email" | "discord" | "whatsapp",   // default "deck"
  deliver:  null | "imessage" | "email" | "discord" | "whatsapp",     // null = render only, deck plays it
  replyTo:  "<conversation_id, message_id or thread id>" | null }     // where the audio goes back
```

An item with `deliver: null` is exactly today's behaviour. `channel` is for the deck's status card
and for telling one source's items from another; `deliver` is what makes the renderer send.

**2. `voice-reply-render` gains a delivery step.** After it writes `voiceReplyStatus[id].status =
"ready"`, if the item carries `deliver`, it sends the audio back on that channel. For iMessage that
is Inkbox, which accepts **MP3/WAV up to 10 MiB** for `purpose: "imessage"`:

- `inkbox_media_stage` with `source_type: "base64"`, `purpose: "imessage"`, `content_type: "audio/mpeg"` → returns `{handle, content_hash, content_type, size_bytes, expires_at}`
- `inkbox_imessage_send` with `recipient`, the `conversation_id` from `replyTo`, and `media: [{handle, content_hash}]`

Two things about that staging call were measured on 2026-09-22 and both will break a first run if
they are not honoured:

- **Strip the data URI first.** The store holds the audio as
  `audio: "data:audio/mpeg;base64,…"` — a data URI, not bare base64. Staging the field as it is
  stored is rejected: the same 956 bytes were accepted as plain base64 and refused with the prefix
  attached, verbatim `invalid_base64: Invalid source.data base64. Remove the data URI prefix;
  supply only the base64-encoded file bytes.` Pass everything after the comma and nothing before it.
- **A handle expires in about 45 minutes** (`expires_at` came back 45 min out on both staging calls).
  Stage and send inside the same run; a handle cannot be carried to the next poll.
- **`content_hash` is not a checksum you can verify.** It matched none of sha256, sha3-256,
  sha512-256, blake2b-256 or blake2s of the bytes, nor sha256 of the base64 — it is an opaque
  server token. The field to check against your own file is **`size_bytes`**, which came back equal
  to the byte count sent on both calls. If it differs, the upload is not your clip; do not send it.

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

## Measured on 2026-09-22 — what the encoder produces and what Inkbox does with it

Read from the live store and from `inkbox_media_stage` on 2026-09-22. Every number below is a
measurement of the one real Seed Audio clip in the store (`voiceReply_teststeve01_0`, written
2026-09-12), not an estimate.

**The clip.** The document is `{v:{audio, durationSec, id, of, part, who}}`, `of: 1`, `part: 0`,
`durationSec: 26.93`, and `voiceReplyStatus.items.teststeve01.parts` is `1` — so a ~27 s reply is
**one part, not many**. `audio` is a 144,403-character data URI. Decoded it is **108,284 bytes**
(105.7 KiB): an ID3v2.4 tag of 188 bytes (`TSSE: Lavf63.1.101`, plus a `TXXX:AIGC` label frame)
followed by 1,125 **MPEG-2 Layer III** frames, **24 kHz, mono, 32.0 kbps average**, 27.00 s of
audio by frame count, no trailing bytes. sha256 `747f8f5b…08bbf4be0d62`.

**Against the 10 MiB cap.** 108,284 bytes is **1.03 %** of the 10,485,760-byte `imessage` cap — a
headroom of about 97x. The clip runs at **4,010 bytes per second of speech**, so the cap is not
reached until roughly **43 minutes** of audio. This clip spoke 279 characters in 27.00 s (≈10.3
characters per second), so the spec's own 700-character ceiling lands near **67 s ≈ 270 KB ≈ 2.6 %
of the cap**. The size limit is not a constraint on this design at any reply length the rules allow;
`"clip too large for imessage"` should be treated as a bug, not an expected outcome.

**Inkbox accepts this encoder.** `inkbox_media_stage` was called with real bytes from this clip —
`source_type: "base64"`, `purpose: "imessage"`, `content_type: "audio/mpeg"` — and returned

```
{"handle":"bcd3d4ca-…","content_hash":"10a90267…","content_type":"audio/mpeg",
 "size_bytes":12284,"expires_at":"2026-09-23T00:18:35Z"}
```

`size_bytes` came back equal to the bytes sent, so the file arrived intact. Nothing was sent:
`inkbox_imessage_send` was not called.

**What that call did not cover.** The payload staged was a **frame-aligned 12,284-byte, 3.02 s
prefix** of the clip (and a second 956-byte slice for the data-URI test) — byte-identical encoder
output, same ID3v2.4 container, same MPEG-2 Layer III frames, same MIME type, but not the whole
108,284 bytes. The full clip could not be staged from a cloud session: the tool takes the bytes
inline as base64 and the 144,380-character string cannot be reproduced faithfully through the
session's own output path. So the **encoding** is proven accepted and the **size** is proven far
inside the cap by measurement, but a stage of the complete clip has not been executed. The first
real run is what closes that last inch, and it is a cheap one to watch.

**Channel readiness, same date.** `inkbox_channel_status_get`: the connected identity is the agent
handle `jasmine`; `imessage.enabled: true` and `inkbox_imessage_onboarding_get` reports
`ready: true` with no recipient awaiting an inbound. Email is active. **`phone.assigned: false` and
`sms_available: false`** — there is no Inkbox phone number on this identity, so the `sms` purpose
(and its much smaller 600,000-byte cap) is not a fallback if iMessage ever fails; the fallback is
text on the same thread, which is what already happens.

## What is still unverified, and how you would know

- Whether a **multi-part** reply should go as several voice notes or one concatenated clip is a
  design decision, not a measurement, and it stands as written: **one clip per reply,
  concatenated** — a thread of six voice notes is worse than one. Note that the only real reply in
  the store came back as a single part at 27 s, so the multi-part path may be rarer than the spec
  assumes; the 700-character ceiling caps a reply near 67 s either way.
- Whether `inkbox_imessage_send` accepts a staged audio handle **as the only content, with no
  text**, has not been tested — testing it means sending, which is a HALT. The first real run
  answers it.
- Whether the full 108,284-byte payload stages (see above). Arithmetic says yes with 97x to spare;
  it has not been executed. **Narrowed 2026-09-23:** the reason is now known precisely and it is
  not a tool limit. `inkbox_media_stage`'s `data` accepts up to 27,962,034 characters and the
  binding constraint is "the whole MCP request must stay under 1 MiB"; the clip's base64 is
  ~141 KiB, inside both. P5's failure was **that session's own output path**, not the tool.
  `voice-reply-render` on the Mac holds the bytes locally and never retypes them, so it does not
  have that limit. Still unexecuted, still not claimed.
- Whether `replyTo` — the `conversation_id` the inbox task replied on — is the same identifier
  `inkbox_imessage_send` wants. The two tasks have never been run against each other.
- **(R4)** Whether a sent email arrives with a playable attachment. Staging is proven; sending is a
  HALT. Same for whether a full-clip email attachment stages — the tested payload was a 1,532-byte
  prefix.
- **(R4)** Whether a signed-in browser actually plays the relay page. No browser was available, so
  the bytes were proven present, correct and private, and nothing beyond that.
- **(R4)** Whether a `#<queue id>` fragment reaches the relay page as `location.hash`. The page
  contract says a plain anchor does; it was not watched happen, which is why the page falls back to
  `clip/newest` and then to its built-in clip.

Ruled out on 2026-09-23, so nobody spends a session on it again: `inkbox_media_stage`'s
`source_type: "url"` looks like a way to hand Inkbox a hosted clip instead of inlining base64. It
is not. That mode requires a URL "publicly reachable without credentials", and artifact URLs are
not — proven by the fetch that failed. Inline base64 stays the only staging route.

The first run tells you the rest: `voiceReplyStatus.items[<id>].delivered.ok`, and whether a voice
note appears on the thread.

## Discord and WhatsApp — specified, and the answer is no send path

These two were "sketched, not specified". They are specified now, and for both the honest answer is
that **this system has no proven way to send audio on them today**. Writing a plausible-looking
delivery step for either would be worse than saying so.

**What `deliver` means, for all four values.** `deliver` names the channel the rendered clip is
**sent back on**, and it is not the same field as `channel`, which only says where the item came
from. `deliver: null` (or absent) is today's behaviour and the default: render only, the dashboard
plays it, nothing leaves the machine. `deliver: "imessage"` is the one implemented path and is
specified in `mac-task-specs.md` §6b. `deliver: "discord"` and `deliver: "whatsapp"` are **not
implemented and must not be implemented by guessing**; `voice-reply-render` records
`delivered: {channel: <value>, ok: false, error: "channel not implemented"}` and moves on, which is
already what §6b says and is the correct behaviour until one of the two paragraphs below is closed.

**Amended 2026-09-23 (R4).** Two changes to that paragraph and nothing else in this section.
`deliver: "email"` joins `"imessage"` as a channel that carries **real audio**, specified in §6c.
`deliver: "discord"` and `deliver: "whatsapp"` remain **not implemented as audio and never will
be** — the two findings below were re-read and stand exactly as written. §6d adds an optional
**link** for them: the renderer writes the clip to the relay artifact and the inbox task puts a URL
in its text reply. That is a different thing from speaking, it is worth having only because the
alternative on those channels is nothing at all, and it works only for Steven signed in.

**Discord — no media send path (checked 2026-09-22).**

- Inkbox exposes no Discord tool at all, and `inkbox_channel_status_get` reports only email, phone,
  iMessage and calling. `integrations/CONNECTIONS.md` describing the Inkbox row as carrying
  "iMessage … and Discord #vanessa" is not supported by the Inkbox tool surface.
- Composio's only Discord message-sending tool is `DISCORDBOT_CREATE_MESSAGE`, and its schema takes
  `content`, `embeds`, `sticker_ids`, `components`, `allowed_mentions` and `message_reference` —
  **there is no file, attachment or audio parameter**. `DISCORDBOT_UPDATE_MESSAGE` has an
  `attachments` array, but only to keep or edit metadata on attachments that already exist; it
  cannot create one. The `discordbot` toolkit also reports `has_active_connection: false`.
- `REMOTE-ACCESS.md` routes Discord through a **local bot on the Mac**, which a cloud session cannot
  reach or test. Whether that bot can upload a file is unknown from here and was not assumed.
- **What would make it possible:** Discord's own API does support it — `POST
  /channels/{channel_id}/messages` as `multipart/form-data` with a `files[0]` part and a
  `payload_json` part, under a bot token with SEND_MESSAGES and ATTACH_FILES on that channel. That
  is a new outbound write path and a new credential, so it is a **HALT**: it needs Steven, not an
  agent. Until then `deliver: "discord"` must stay unimplemented.

**WhatsApp — no send path for media, and no channel at all yet (checked 2026-09-22).**

- The channel itself is not live: `whatsapp-cli` (marcelrgberger) is **spec written 2026-09-22, Mac
  install pending**, and needs a dedicated number, the desktop app logged in, Full Disk Access and
  Accessibility. `normen/whatscli` was evaluated and rejected — by its own README it does no
  sending from the shell, and it emulates a linked device.
- More to the point, **`whatsapp-cli` has no attachment verb even once installed.** Its verbs are
  `monitor`, `message get`, `message send`, `chat find`, `chat list`, `session status`, and
  `message send` is implemented by opening `whatsapp://send?phone=…&text=…` in the desktop app and
  pressing Return through System Events. That URL scheme carries a phone number and a text string
  and nothing else. **There is no parameter in which an MP3 could travel.**
- **What would make it possible:** a GUI automation step that attaches a file in the desktop app
  (System Events driving the paperclip, or a paste of a file reference), which needs a GUI session,
  Accessibility, and a new outward verb on a client-capable app — a **HALT** on both the credential
  and the client-facing-system rules, and fragile besides. The better answer is to leave WhatsApp
  text-only: Steven already gets the answer in text there, and voice is additive by design.

## Email — the channel nobody checked, and it speaks (measured 2026-09-23)

Email was in front of us the whole time. P5 recorded "Email is active" as background and moved on.
It is the only other channel on the Inkbox identity, it is the one Steven already gets written
answers on, and — unlike Discord and WhatsApp — **it has an attachment parameter.**

`inkbox_email_attachment_upload` was called with real bytes out of the clip, `content_type:
"audio/mpeg"`, and it accepted them:

```
{"media_handle":"fc00c3c3-94e6-49a1-b7d0-c15d6d499e50","filename":"vanessa-reply.mp3",
 "content_hash":"b858ecbe0a03cfd7138e4e6c11cd46cc47b75dc33c94d6ce69c98bf0528cb3bb",
 "content_type":"audio/mpeg","size_bytes":1532,"expires_at":"2026-09-23T03:53:29Z"}
```

`size_bytes` equals the bytes sent. Nothing was sent — `inkbox_email_send` and
`inkbox_email_reply` were never called; the upload call copies and validates into staging *for a
later send*, which is the same kind of read-only step `inkbox_media_stage` is on the iMessage side.

Three details that matter for the implementation:

- **`content_hash` here is a real SHA-256 of the file bytes.** It matched the digest computed
  locally before the call, exactly. This is the opposite of the iMessage path, where P5 established
  that `inkbox_media_stage`'s `content_hash` matches no common digest and is an opaque token. So on
  email the renderer **can** verify the staged file is its own clip; on iMessage it still cannot,
  and `size_bytes` remains the only check there.
- **The send shape is fully determined.** `inkbox_email_reply` wants `message_id`,
  `approved_recipients` and `attachments: [{media_handle, filename, content_hash, content_type}]` —
  and all four attachment fields are returned by the upload call. Nothing has to be guessed.
- **Inline base64 is capped by "the whole MCP request must stay under 1 MiB."** The full clip's
  base64 is ~141 KiB, well inside. A `url` source would allow 25 MiB but demands a *public* HTTPS
  URL, which nothing in this system has (see below).

What is **not** proven: a full-clip stage (the payload was a frame-aligned 1,532-byte prefix, for
the same retyping reason P5 hit), and that a sent email arrives with a playable attachment —
sending is a HALT and the first real run answers it.

## The link path — tested 2026-09-23, and it is not what it looked like

The idea was sound: if audio cannot be attached, a text reply can carry a URL to a clip that plays
in a browser, and every channel carries text. It was tested against the artifact asset store. **The
asset store cannot do this job**, for two independent reasons, either of which alone is fatal.

**1. The asset store accepts no audio type at all.** Uploading the real decoded MP3 was refused
outright:

```
unsupported asset type ".mp3": publish with `asset: true` takes png, jpg, jpeg, gif, webp, svg,
mp4, webm, pdf, woff2, woff, ttf, otf, csv, md, markdown, json, txt, ts, css, js, mjs, cjs.
```

No mp3, no m4a, no wav, no ogg. Remuxing into an accepted container was **not** attempted and must
not be assumed to work: there is no `ffmpeg` in the cloud container, and whether a browser would
play a hand-built audio-only MP4 could not be tested from here.

**2. What the store hands back is not a link.** A 22-byte probe file with an accepted type uploaded
fine and returned the path `/_blob/<id>` — *relative*, with no scheme and no host, meaningful only
"in every view of the artifact". There is nothing there to paste into a message.

So any link must be **the artifact page URL**, with the clip carried inside the page. That part
works, and was executed: the full 108,284 bytes were embedded as base64 in a page and published
privately. The built page is 158,484 bytes — **0.94 % of the 16 MiB page cap** — and the embedded
base64 decodes back to sha256 `747f8f5b…4be0d62`, byte-identical to the clip in the store, so
nothing is re-encoded. The page decodes it to a same-origin `blob:` URL, falls back to a `data:`
URI, and says so in its own status line if both fail. The test page is
`https://claude.ai/artifact/EJnetbUCFscnDsDWFdp9Ti` — newly created for this, private, and no
existing artifact was touched.

**Who can open it — the decisive question, and it was established, not assumed.** Four lines agree:

- Every publish of the page reported **"readable by only you"** and "only its owner and the people
  the owner has given access can open the link."
- A page declaring a capability is **organization-internal and never public** — the platform's own
  rule, not an inference.
- An **unauthenticated fetch** carrying no artifact credential was refused for both the page URL and
  the `/_blob/` path: HTTP **403**, a Cloudflare interstitial, no artifact content.
- Strongest, because it is a genuinely unrelated third-party server: `inkbox_media_stage` with
  `source_type: "url"` — a mode whose schema **requires** a URL "publicly reachable without
  credentials" — was pointed at the page and came back **`url_fetch_failed: URL media could not be
  fetched safely`**. Inkbox cannot see it.

**A link therefore plays for Steven and for nobody else.** For this design that is correct: the only
permitted recipient of a voice reply is Steven. But two consequences must be said out loud rather
than discovered later:

- **It only opens in a browser already signed in to that account.** On the phone that means the
  Claude app, or Safari with a live session. A signed-out tap gets a sign-in wall, not the clip.
- **It is not "Vanessa speaking on Discord."** It is a written reply with something to tap. Anyone
  describing it as voice-on-Discord is overselling it.

**Not proven:** that a signed-in browser plays the page. No browser was available in this session,
so only the presence, integrity and privacy of the bytes were verified — never a page load and
never audio coming out.

**The per-reply write path, and retention.** The renderer does **not** need to learn to republish a
web page. A clip document of 144,825 bytes — the full base64 in one field — was written to the
relay artifact's database and read back **byte-identical**, and read back identical again at the
access level of an ordinary viewer rather than the owner. That is the same kind of operation
`voice-reply-render` already performs every ten minutes on the Command Deck store, against a
different artifact. Scheme: `clip/<queue id>` holds the clip, `clip/newest` holds `{v:{id, ts}}`.
The page resolves a `#<queue id>` fragment first so an old text keeps playing *its* clip, and falls
back to `clip/newest`, and below that to the clip built into the page — so it plays something at
every level of failure. (That the fragment reaches the page is documented but was not watched
happen; the fallbacks exist because of that.)

Retention is capped by design, not by a cleanup job: **keep the newest 10 clip documents and prune
the rest in the same run**, matching the cap `voiceReplyQueue` already uses, so a clip lives exactly
as long as the queue item that made it. About 145 KB per document, ~1.45 MB at rest, against a
reported ceiling of 5,000 documents. One artifact, written often — never a new artifact per reply,
which would leave an unbounded gallery of private pages that no agent is permitted to prune, because
deleting an artifact is Steven's call.

## What Steven does

1. Paste the prompt amendments in `integrations/mac-task-specs.md` §6 into `voice-reply-render`
   and `vanessa-imessage-inbox` on the Mac — §6a and §6b are the iMessage path and are the whole
   of the original design and come first. **§6c (email) is the one to paste next** — it is the only
   other amendment that makes her actually speak. **§6d (link) is last and optional**; it buys
   Discord and WhatsApp a tappable URL and nothing more, and neither channel is connected today.
2. Text Vanessa something that takes more than a sentence to answer.
3. Within ~20 minutes: a text reply, then her voice on the same thread.
4. For email (§6c), send her an email that takes more than a sentence to answer, and expect the
   same shape: a written reply, with `vanessa-reply.mp3` attached.
5. Nothing to do for Discord or WhatsApp. Neither channel is connected, and neither will ever carry
   her voice. If they are connected later, §6d gives them a link and nothing more.

If the text arrives and the voice does not, read `voiceReplyStatus` — `status` says whether it
rendered, `delivered` says whether it sent, and `error` says which of the two failed.
