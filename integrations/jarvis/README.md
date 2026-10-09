# Jarvis, Laya and Vanessa's voice — set up and verified on the Mac

**Honest status 2026-10-09:** Jarvis (OpenJarvis `memory.db`), the real Laya model and Vanessa's recorded
voice all live on the Mac. The cloud cannot see them, so nothing here is "installed" until
`jarvis-setup.sh --verify` passes there. The brain shows Jarvis as **unverified** until that file exists,
and **stale** after 36 hours.

## Run on the Mac (from the Repo folder)

```bash
git pull
bash integrations/jarvis/jarvis-setup.sh --verify     # read-only; writes brain/state/jarvis-status.json
bash integrations/jarvis/jarvis-setup.sh --apply      # also writes ~/.config/jarvis/vanessa-voice.json
bin/brain orgcheck                                   # org seats + the Jarvis state
```

`--verify` checks: macOS · OpenJarvis `memory.db` row count (rows only, no content read) · the vault ·
the real Laya engine answers (not the keyword stand-in) · Vanessa's voice clips exist · the voice profile
copy · `bin/brain doctor`. Every failing row says the one thing to do.

## Laya

Routing logic is proven (`python3 integrations/tests/test_laya_route.py` → 19 ok) on the stand-in engine.
The real model needs `bash integrations/laya/install.sh` on the Mac (one-time Hugging Face download).
Until then `laya_route.py` falls back to the stub and says so. `BRAIN_ROUTER=laya` makes `bin/brain recall`
ask Laya for a path hint; a failure or a wait over 2 s is ignored.

## Vanessa's voice

`vanessa-voice-profile.json` is the one definition. Jarvis plays or renders from **the same recorded set**
the Command Deck and `voice-reply-render` already use (Magica Seed Audio, 8 clips). It never substitutes a
system voice and never claims to be her voice when the clips are missing — the verify row fails instead.
No reference clip or voice id is stored in this repo, so a **new cloned voice** is a separate decision
(provider and consent are Steven's) and is not made here. Set `VANESSA_VOICE_DIR` if the clips live
somewhere other than `~/.cache/vanessa-voice` or `~/Applications/team-avatars/voices`.

## What this never does

Edit a skill, an MCP server, a runner task or a live prompt; log in; read client documents; send anything.
Those are Steven's approvals, one at a time. Offline tests: `bash integrations/jarvis/jarvis-tests.sh`.
