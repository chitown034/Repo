# NEEDS-STEVEN — R4 append (Voice Channel Engineer, 2026-09-23)

Append to `docs/NEEDS-STEVEN.md`. Three items. One is a decision that unlocks a channel on which
Vanessa can genuinely speak; one is a decision about a workaround that is worth much less; the third
is a correction to what you have been told about "voice on every platform", and it should reach you
before the runbook does.

Everything below was measured on 2026-09-23. **Nothing was sent on any channel** — no iMessage, no
SMS, no Discord, no WhatsApp, no email, not even as a test. The full evidence is
`docs/findings/findings-R4.json`; the design is `integrations/vanessa-voice-everywhere.md`.

---

## R4-1 — Email can carry her actual voice, and it is one missing task away

**F-R4-11, F-R4-12. A decision, and the highest-value one on this page.**

The search for a way to give Vanessa a voice off the dashboard has been about iMessage, Discord and
WhatsApp. **Email was never checked, and email is the answer nobody looked for.** It is the one other
channel on the Inkbox identity, it is already live (`jasmine@inkboxmail.com`, status active, sending
domain verified), and unlike Discord and WhatsApp **it takes attachments.**

That was proven, not assumed. `inkbox_email_attachment_upload` was handed real bytes from your
rendered clip as `audio/mpeg` and accepted them, returning a usable handle. The send shape is fully
determined by the tool schemas — nothing has to be guessed. The delivery amendment is written and
paste-ready as `integrations/mac-task-specs.md` §6c.

**What is yours, and why only you.** There is **no email inbox task.** `vanessa-imessage-inbox`,
`vanessa-discord-inbox` and `vanessa-whatsapp-inbox` exist. There is no `vanessa-email-inbox`, and
nothing anywhere in the repo reads that mailbox. So mail arriving for Vanessa is, as far as this
system is concerned, unread — and §6c stays inert until something writes an email queue item.
Creating a new Mac task that reads and answers a live mailbox is a new outbound write path on a
client-capable channel. That is yours, not an agent's.

**The exact action:** decide whether you want a `vanessa-email-inbox` task at all. If yes, say so and
it gets specified the way the other inbox tasks are — with the same allow-list rule that already
governs iMessage: **it may only answer you.** An agent should not be writing a task that replies to
whoever emails that address until you have said what it may and may not answer.

**If you do nothing:** §6c sits in the spec unused, iMessage voice still works after §6a/§6b, and
the mailbox stays unread as it is today.

---

## R4-2 — The link workaround exists, is weaker than it sounds, and needs one decision

**F-R4-01, F-R4-02, F-R4-03, F-R4-04, F-R4-05, F-R4-07. A decision, and a small one.**

You were told a link-based workaround was being tested for the channels that cannot carry audio. It
was tested. The result is a qualified yes, and the qualifications matter more than the yes.

- The artifact **asset store cannot host audio at all** — it accepts no audio type, and uploading the
  MP3 was refused outright. And what it returns for the types it does accept is a **relative path**,
  not a URL anyone could tap out of a message. Both of those are dead ends, independently.
- What does work: the clip rides **inside an artifact page**, and that page's URL can be texted. The
  full clip was embedded and published; the bytes are byte-identical to yours and the page is 0.94 %
  of the size cap.
- **The URL is private to you.** Two unauthenticated fetchers were pointed at it and both were
  refused — including a genuinely unrelated third-party server. That is correct for this use, since
  you are the only permitted recipient. **The price is that it only opens in a browser already signed
  in to your account** — the Claude app, or Safari with a live session. Signed out, you get a sign-in
  wall instead of your clip.
- **It is not her speaking on Discord.** It is a written reply with something to tap. Anyone who
  describes it as voice-on-Discord is overselling it, and the spec says so in those words.

**What is yours, and why only you.** A test artifact was created for this and is private
(`readable by only you`): `https://claude.ai/artifact/EJnetbUCFscnDsDWFdp9Ti`. Adopting the link path
means a Mac task writing clips into an artifact you own, on a schedule. **The exact action:** decide
whether you want §6d adopted at all, and if so whether that test artifact is the one to use or you
want a fresh one. Neither Discord nor WhatsApp is connected today, so there is **no hurry** — §6d
does nothing until one of them exists.

**Also, disclosed rather than tidied:** a 22-byte `probe.txt` was uploaded to that artifact's asset
store while testing what the store accepts, and left there. Nothing references it. Deleting an asset
is your call, so it was named here instead of removed.

**If you do nothing:** nothing happens. Discord and WhatsApp remain text-only, which is what they
are today anyway.

---

## R4-3 — A correction: "voice on every platform" is two channels, not four

**F-R4-06. Not a decision — a correction to what you asked for, so the runbook does not promise
more than it can do.**

You asked for Vanessa to speak whenever she replies to any written communication, on every platform.
That is **not achievable as spoken audio**, and no amount of further engineering will change it. The
honest shape, after today:

| Channel | Does she speak? |
|---|---|
| Command Deck | **Yes** — works today, unchanged. |
| iMessage | **Yes**, after the §6a/§6b pastes. Proven encoder, 97x size headroom. |
| Email | **Yes**, after §6c — but only once an email inbox task exists (R4-1). |
| Discord | **No, and never.** The only send tool available has no attachment parameter of any kind. |
| WhatsApp | **No, and never.** Its send is a `whatsapp://send?phone=…&text=…` URL. There is no parameter an MP3 can travel in. |
| SMS | **No channel at all.** No phone number is assigned to the identity. |

The reason Discord and WhatsApp are permanent is worth one line, because it is not a limitation
anyone can engineer around from here: on both channels the send mechanism itself has **no parameter
that accepts a file**. It is not a quota, a permission or a missing credential. There is nowhere to
put the audio.

**What changed today** is that the count went **up, not down**: the target was iMessage, and email
turned out to be a second real one. What did not change is that two of the four channels you named
will only ever carry text — and now, optionally, a link only you can open.

**The exact action:** none, beyond knowing it. If the runbook still says a link workaround is "being
tested", it can now say: tested, and it is a private link rather than a voice note; and the entry for
Discord and WhatsApp should read *never*, not *not yet*.
