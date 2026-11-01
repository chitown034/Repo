# VEED.io API — status and how it connects (2026-11-01)

Steven, 2026-11-01: *"also veed.io connections API"*. Owner: Sofia (video) · Derek (connection) · Elena (key).

## What VEED offers (from VEED's public pages; the docs host `api.veed.io/docs` is not reachable from the cloud sandbox)

| Product | What it does | How it is called |
|---|---|---|
| **VEED API** (`api.veed.io`) | Video generation and editing for apps: Fabric 1.0 (a talking video from one photo + one audio clip), Lipsync 2.0, generation and render jobs | One **workspace API key**, sent as `Authorization: Bearer <key>`; every job is asynchronous — POST the job (the launch example is `POST /v1/fabric-1.0`), read `data.job_id`, poll until `COMPLETED`, download the output |
| Fabric / Lipsync on **fal.ai** | The same models hosted by fal | A different key (`FAL_KEY`), fal's own endpoints — not used here |
| VEED editor (veed.io) | The web app Steven already uses | No API needed |

Unverified from here: the exact `/v1/me` key-check path, the job-poll path (`/v1/jobs/{id}` assumed), rate limits and the
credit price per second. The first live call must be made where `api.veed.io` is reachable (the Mac) and the result
written back into this table.

## What is in the repo

- `veed_client.py` — stdlib client: `whoami`, `fabric`, `job`; `--dry-run` prints the exact request with the key
  redacted; any call that spends credits (`fabric`) is **refused without --dry-run** until Steven says yes (HALT: spend).
- `tests/test_veed_client.py` — 5 tests (header, body, redaction, dry-run without a key, spend refusal).

## Where it fits

VEED is a second render path beside **OpenMontage** (`integrations/openmontage/`, local, free) and the AI Replica Studio
plan (`integrations/ai-replica-studio/PLAN.md`): Sofia writes the brief, Alexandra reads the script, Steven approves
every video, and nothing is posted by a machine. VEED's Fabric is the fastest way to a talking-avatar clip from one
photo and one voice note; the voice note is Steven's own recording (his consent is on file for his own avatar only).

## Steven's two steps (HALT items)

1. **Key.** VEED workspace → API settings → create a key → on the Mac: `mkdir -p ~/.config/veed && chmod 700 ~/.config/veed`,
   then `VEED_API_KEY=…` in `~/.config/veed/.env` (`chmod 600`). Never paste the key into chat, a prompt or a dashboard.
2. **Plan and price.** Read the API pricing page once and say the monthly cap you accept; until then every call stays
   `--dry-run`. Then `python3 integrations/veed/veed_client.py whoami` proves the key.
