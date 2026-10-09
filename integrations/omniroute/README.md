# OmniRoute as the brain's model router — local tier (Bonsai 27B); research left it 2026-10-05

**Written 2026-09-28 · design + scripts, proved against stubs in this sandbox · not yet installed on the
Mac.** Owner: Integration Engineer. Answers Steven's request, verbatim: *"configure omni route Setup orca /
Local LLM and token optimization Omniroute / PrismML's Bonsai 27B: with Perplexity and [top-tier model] md"* (md: masterminds).

**This extends `integrations/omniroute-failover/` — it does not replace or duplicate it.** That directory
already owns the subscription↔free-fallback switch, the PII gate, and the two-Mac task lease; read it first.
This directory adds the two routes it left as placeholders: a **local** route (`OMNIROUTE_LOCAL_MODEL`, a
placeholder there today) and a **research** route, and documents token optimization honestly. Nothing here
changes `omniroute-failover`'s subscription or free-fallback behavior.

**Updated 2026-10-05 — the research route is withdrawn.** Steven removed Perplexity (`context/decisions.md`,
2026-10-05). Research is now Claude web research — Sonnet 5 with WebSearch/WebFetch on Steven's Claude
subscription — and, like every other Claude tier, it runs direct and never through OmniRoute (§Hard rule).
The Perplexity provider and the `research` combo are gone from `configure-omniroute.sh` and `route-map.json`;
this directory now owns the `local` route only.

## The routing map — one table

| Laya tier (`router-questions.json`) | Route | Path | Ever through OmniRoute? |
|---|---|---|---|
| `orchestrator` — Vanessa, council chair, final synthesis | **subscription** | plain `claude`, OAuth, no proxy env (`omniroute-failover/claude-auto.sh`, unchanged) | **Never.** See §Hard rule below |
| `executive` — a C-suite lane owns it outright | **subscription** | same as above | **Never** |
| `worker` — report/bench/execution-only seat | **subscription** | same as above | **Never** |
| `research` — research heavy lifting | **subscription** | Claude web research — Sonnet 5 with WebSearch/WebFetch on Steven's Claude subscription (Perplexity removed 2026-10-05); plain `claude`, same as above; **≤4 web-research sub-agents per wave** (`CLAUDE.md` sub-agent dispatch cap) | **Never** — the `research` combo was withdrawn 2026-10-05 |
| `pii_gate` fires — **overrides every tier above, unconditionally** | **local** | OmniRoute `local` combo → **Bonsai 27B**, served on the Mac's own loopback, no cloud fallback, **ever** | Yes — the only cloud-shaped hop is `127.0.0.1`, i.e. none |
| (unchanged, not this directory's concern) | **free-fallback** | OmniRoute free combo, subscription-limited only, PII gate closed by default | Yes — see `omniroute-failover/README.md` |
| (tier 3, 2026-10-09, OFF by default) | **paid-backup** | OpenRouter direct (never via OmniRoute), only after the subscription is limited **and** OmniRoute is down/exhausted; capped; same PII gate as free-fallback | No — see `omniroute-failover/README.md` §Three-tier failover |

`integrations/laya/laya_route.py` prints this as a `route` field per request (R12-OMNI); the mapping itself
lives in `route-map.json` in this directory, not hardcoded in the script. **The one invariant that matters
most:** a PII-fired request routes `local` whatever tier Laya also guessed — tested in
`integrations/tests/test_laya_route.py` across the full tier × pii_gate matrix.

## Hard rule — the Claude subscription never goes through OmniRoute

**Finding, primary source:** `code.claude.com/docs/en/legal-and-compliance` → **"Authentication and
credential use"** (read 2026-09-28):

> OAuth authentication is intended exclusively for purchasers of Claude Free, Pro, Max, Team, and Enterprise
> subscription plans and is designed to support ordinary use of Claude Code and other native Anthropic
> applications... Developers building products or services that interact with Claude's capabilities...
> should use API key authentication... Anthropic does not permit third-party developers to offer Claude.ai
> login into their own applications, or to route requests through Free, Pro, or Max plan credentials on
> behalf of their users... Anthropic reserves the right to take measures to enforce these restrictions and
> may do so without prior notice.

OmniRoute is exactly the shape of tool this describes — a third-party product that would sit between
Steven's OAuth session and Anthropic's servers. Sending the subscription's OAuth token through OmniRoute's
gateway (even self-hosted, even loopback-only) is "an other product, tool, or service" in the sense this
policy means, and risks the account. This is **why** `omniroute-failover/claude-auto.sh`'s `subscription`
mode already unsets `ANTHROPIC_BASE_URL`/`ANTHROPIC_AUTH_TOKEN` and runs plain `claude` with no proxy env at
all (`omniroute-failover/README.md` §Switch-over) — this round found the rule that design already assumed.

**If the top tier (masterminds) must ever go through OmniRoute** — e.g. to add a non-Anthropic fallback
model behind the same seat — that requires a **pay-per-token Anthropic API key**, issued from the Console,
never OAuth. An API key spends money per the account's own billing. Per `CLAUDE.md`'s HALT list ("Anything
irreversible, or anything that spends money" / "Anything needing a credential, an API permission or an
account change"), that is a **HALT**, not a config change this round makes — see the `needs-steven` row in
the integrator's sandbox notes (kept outside the repo).

## The `local` combo — how it fails closed, never open

Three independent layers, each fails toward "nothing runs," never toward "runs somewhere else":

1. **The combo itself has one target and no fallback member.** OmniRoute's combo shape is `{name, strategy,
   targets:[...]}` (`POST /api/combos`, `docs/routing/AUTO-COMBO.md`); `local`'s `targets` list holds exactly
   the one local provider. There is nothing else in the list for a "priority" strategy to fall through to —
   this is a property of the combo's *definition*, not a flag that could be misconfigured on or off.
2. **`claude-auto.sh`'s own health check.** `route_omni()` (`omniroute-failover/claude-auto.sh`) curls
   `$OMNI_BASE/healthz` before ever calling `claude`; unreachable → logged, `exit 75`, no request sent, no
   other base URL ever tried (unchanged by this round — see §What `claude-auto.sh` changed below).
3. **The PII gate upstream of both.** A client-shaped task on any route but `local` is deferred (`exit 75`)
   before it reaches OmniRoute at all (`omniroute-failover/README.md` §PII policy) — the `local` combo is
   the *only* place a PII-fired request is ever allowed to run, and if it can't reach Bonsai there, it does
   not run, full stop. It never "escalates" to free-fallback or subscription — those routes are for
   non-client data by construction.

**Proved against stubs, this sandbox, 2026-09-28** — see the integrator's sandbox notes (kept outside the repo) and §3 of the hand-back:
(a) a request to a registered `local` combo reaches a stub Bonsai server; (b) killing that stub, the same
request fails — the gateway stub returns an upstream error and *never* attempts a second target, confirming
the single-target-combo shape holds; independently, pointing `claude-auto.sh` at a dead gateway confirms its
own `exit 75`/no-fallback path is unchanged. Real OmniRoute did not run in this sandbox (§Honest status).

### Prove it on the Mac before any client-data task uses `local`

Until this passes on the Mac, **leave `OMNIROUTE_LOCAL_MODEL` unset** — client-data tasks then defer
(`exit 75`), exactly as they do today. Layer 1 above was proven only against a stand-in gateway; real
OmniRoute also advertises quota-aware auto-fallback, and whether any global fallback setting can reach past a
single-target combo is unverified. The proof, on the Mac, with **non-client** test text only:

1. `integrations/omniroute/setup-local-llm.sh`, then `integrations/omniroute/configure-omniroute.sh`.
2. Send one test request to the `local` combo — it must answer (Bonsai is up).
3. Stop the Bonsai server, send the same request again — it must **fail**, and OmniRoute's request log must
   show **no other provider** tried.
4. Only then add `OMNIROUTE_LOCAL_MODEL=local` to `~/.config/omniroute/.env`. `docs/NEEDS-STEVEN.md` item 75.

## Token optimization — what is and is not touched

| Traffic | Compressed? | How |
|---|---|---|
| `local` combo (Bonsai) | Yes, if configured | OmniRoute's RTK→Caveman pipeline runs on anything proxied through `:20128` before it reaches the upstream provider (`docs/compression/COMPRESSION_GUIDE.md`: "runs proactively before requests hit upstream providers") — it is Steven's own loopback traffic either way, so compressing it only saves *Bonsai's* context window, not any metered cost |
| `research` combo | **Withdrawn 2026-10-05** | Perplexity removed; research is `subscription` traffic now (last row) |
| free-fallback combo | Yes, unchanged | Already OmniRoute's default behavior per `omniroute-failover/` |
| **`subscription` route (top/executive/worker/research tier)** | **No.** | **This traffic never touches OmniRoute at all** (§Hard rule) — nothing in this repo compresses it today |

**Per-route control, real OmniRoute** (`docs/compression/COMPRESSION_GUIDE.md`, read 2026-09-28): a global
default at `PUT /api/settings/compression` (`{"defaultMode":"stacked", ...}`), a per-combo override via
`PUT /api/combos/{id}` (`compressionMode`: `Default`/`Off`/`Lite`/`Standard`/`Aggressive`/`Ultra`), and a
per-request `x-omniroute-compression` header (`off` / `default` / `engine:rtk` / a named compression combo),
echoed back in the `X-OmniRoute-Compression` response header. `configure-omniroute.sh` sets the `local`
combo's `compressionMode` explicitly (§Files below; the `research` combo was withdrawn 2026-10-05); it never
touches `defaultMode` globally.

**Proved, this sandbox:** a stub gateway implementing that same header contract measurably shrinks forwarded
bytes on 5 non-PII sample prompts with compression on vs `x-omniroute-compression: off` — numbers in the
hand-back. This proves the *contract* claude-auto.sh and configure-omniroute.sh rely on, not OmniRoute's
real RTK/Caveman algorithm, which this sandbox never ran (§Honest status).

**A local-only measure for the subscription route itself — declined, not built.** The brief allows one: "RTK
as a Claude Code hook — only if its source proves it runs locally and sends nothing anywhere; opt-in flag,
off by default." Investigated: RTK is described in OmniRoute's own docs (`docs/compression/RTK_COMPRESSION.md`)
as "upstream software" OmniRoute integrates, with API surface only inside the gateway
(`/api/context/rtk/config`, `/api/context/rtk/test`) — **no standalone install, CLI, or local-hook usage was
found**, and no link to RTK's own upstream repo was found either, in the time this round had. Per `CLAUDE.md`
("Never 'installed/connected/running/configured' for anything not proven") this is **not built**. It is a
`needs-integrator`/future-research row, not a config — see the hand-back.

## Files here

| File | Role | Status |
|---|---|---|
| `route-map.json` | Laya `tier`/`pii_gate` → `route`. Read by `laya_route.py --route-map` (default path) | **Built, tested** — `integrations/tests/test_laya_route.py`, 19/19 |
| `setup-local-llm.sh` | macOS, bash 3.2-safe, idempotent, `--dry-run`. Installs Bonsai 27B's runtime, downloads the model, serves it on loopback, prints the `OMNIROUTE_LOCAL_MODEL` value to use | **Built. Proved against a stub only** — real install needs a Mac (§Honest status) |
| `configure-omniroute.sh` | Idempotent, `--dry-run`. Registers the local provider, the `local` combo and its `compressionMode`, via OmniRoute's REST API on `:20128` (the Perplexity provider and `research` combo were removed 2026-10-05) | **Built. Proved against a stub gateway only** — real OmniRoute did not run in this sandbox (§Honest status) |
| `orca.md` | How Orca launches agents, and how to route an Orca-launched agent through these gates | **Researched, partially verified** — see the file; no live Orca session to test against |
| `route-map.json`, `laya_route.py` change | see `integrations/laya/README.md` §`route` field | **Built, tested** |

## What this never does

- Never puts the Claude subscription (OAuth) behind OmniRoute, at any tier. See §Hard rule.
- Never lets the `local` combo fall back to a cloud provider. See §The `local` combo.
- Never reads, prints, or stores a provider key — the one provider it registers, the loopback Bonsai server,
  has none. (The Perplexity key path, `--set-perplexity-key`, was removed 2026-10-05.)
- Never routes research. Since 2026-10-05 research is Claude web research on the subscription, direct —
  `CLAUDE.md`'s ≤4 web-research sub-agents per wave cap is enforced by whatever agent dispatches them, not
  by this directory.
- Never exceeds `CLAUDE.md`'s sub-agent caps (≤8 parallel, ≤4 web-research sub-agents per wave) — this
  directory does not dispatch agents at all, it only wires the route they'd use.
- Never edits `omniroute-failover/claude-auto.sh`'s lease gate, PII gate, or probe/switch-back logic — only
  the comment and default naming around `OMNIROUTE_LOCAL_MODEL` (§What `claude-auto.sh` changed).
- Never edits `CLAUDE.md`, `OPTIMIZATION.md`, `MAC-SETUP.sh`, `docs/NEEDS-STEVEN.md`, or
  `context/decisions.md` directly — those are the integrator's; exact row text is in
  the integrator's sandbox notes (kept outside the repo).

## What `claude-auto.sh` changed

One thing: the comment above `LOCAL_MODEL="${OMNIROUTE_LOCAL_MODEL:-}"` and the file header referred to "the
local Jarvis model" — a placeholder name from before any local model was chosen. **`Jarvis` (OpenJarvis) is
a separate, already-documented system** (`OPTIMIZATION.md`: local vault index + on-device voice, 1,760
docs) — distinct from the model this round wires behind `OMNIROUTE_LOCAL_MODEL`. The comment now names
Bonsai 27B instead, so it stops pointing at the wrong system. `OMNIROUTE_LOCAL_MODEL` itself was already a
generic env var with no hardcoded value (`empty = no local route`) — nothing structural changed, every gate
in `omniroute-failover/README.md` (lease, PII, probe) is untouched, and `lease-tests.sh` still passes
unmodified (§Honest status).

## Honest status of every piece (2026-09-28)

- **OmniRoute itself: did not run in this sandbox.** `npm --prefix <scratch> install omniroute` was
  attempted; it pulled ~2.1 GB of `node_modules` in under 90 s but did not finish producing a `bin/omniroute`
  before this shared sandbox's disk hit its own limit (`/` at 98% used, host-wide, not this session alone);
  the partial install was removed to give the space back rather than retried, since a second attempt risked
  the same failure for no new information. Its CLI/REST surface below is therefore **researched from its
  GitHub README, wiki and `docs/` tree (fetched 2026-09-28), not executed here** — treat exact flag names as
  reasonably confident, not proven, until run for real on the Mac.
- **The local provider and OmniRoute gateway are both stand-ins in this sandbox.** A 30-line Python
  OpenAI-compatible server stands in for Bonsai; a small Python stand-in gateway stands in for OmniRoute
  itself (`/healthz`, `/api/providers`, `/api/combos`, `/api/settings/compression`, the compression-header
  contract) — this is the same pattern `omniroute-failover/README.md` used for its own sandbox proof ("a
  dead `:20128`, a live stand-in `/healthz`"), extended here to a full round trip. **Both are labeled stubs
  everywhere they appear; nothing here claims real OmniRoute or real Bonsai ran.**
- **Bonsai 27B: license and runtime verified against PrismML's own demo repo** (`github.com/PrismML-Eng/
  Bonsai-demo`, fetched 2026-09-28 — Hugging Face itself returned 403 in this sandbox, as the brief expected,
  and was not fought). See `setup-local-llm.sh`'s header for the full citation; summary in the hand-back.
- **Orca: partially verified.** GitHub README, issues and PRs (not a single settings doc) — see `orca.md`.
- **Anthropic's terms: verified against the primary `code.claude.com` page**, quoted in full above.
- Nothing in this directory has run on Steven's Mac. Every "works" claim below is scoped to this sandbox.
