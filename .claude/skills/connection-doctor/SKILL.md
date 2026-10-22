---
name: connection-doctor
description: "Answer 'what is not connected?' and 'what do I paste?' without burning tokens: run bin/brain toolkit for every connector's live status and fix, bin/brain owner for who keeps a panel alive, then hand Steven the one Terminal paste (connect-all.sh) plus the short list only he can do. Use when Steven asks what is broken, not connected, stale, or what he has to do; also the first step of any 'fix everything' request."
---
# Connection doctor

Zero-token first, model second. Everything below reads the tree or the deck's own status documents.

1. `bin/brain toolkit` — counts per seat and the **needs attention** list (each row: state, name, fix, who).
   The states come from `integrations/CONNECTIONS.md` § "Connection status — checked live …"; when a check is
   older than a week, re-check live (ListConnectors for claude.ai connectors, Composio `list`, ArtifactData
   `runnerStatus.v.syncedAt` for the Mac, `whatsappKapso` for Kapso) and append a new dated status section —
   the register reads the newest one.
2. `bin/brain owner "<panel>"` — who keeps a Command Deck panel alive and what stays Steven's (the 80/20 map).
3. Split the fixes: **cloud can do** (routine prompts, deck documents, docs) → do them now; **a script may do on
   the Mac** → it is already in `connect-all.sh` (runner restart, Kapso plugin+MCP+keys, Inkbox voice SDK, Jarvis,
   key files, health check); **only Steven** (sign-ins, permission ticks, the Kapso sign-in, Inkbox reconnect,
   money, anything on the HALT list) → say exactly where to click.
4. The answer to Steven is always the same shape, short, no jargon: a table of what is not connected with the
   fix and who; then **the one paste**
   `cd ~/Repo && git fetch origin && git checkout claude/stoic-cori-pvn3f8 && git pull && bash connect-all.sh`;
   then the numbered "only you" list. Update the Action Desk step 0 and `docs/STEVEN-STEPS.md` "Start here" when
   the list changes (the `/paste` mod reads that section).
5. Never run `runnerctl login` / `save-token`, never sign in, never print a key, never send anything.
