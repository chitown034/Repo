# Laya — the zero-token System-1 hop in front of Vanessa

**Status 2026-09-28: package proven installable and its routing logic proven correct in this
sandbox. The model itself has never run here — Hugging Face is blocked from this sandbox (see
"Sandbox proof" below). Not installed on the Mac. Do not call this "installed", "connected" or
"running" anywhere else in the repo until a Mac session proves the checkpoint download too.**

Superseded evaluation: `MAC-INSTALL-tooling.md` §17 evaluated `laya` 0.3.6 on 2026-09-22 as "not
now — local PII-safe triage classifier only after fine-tuning." This package is 0.3.21. The
verdict below is narrower and different: not a fine-tuning candidate, but the always-on first hop
in front of every request Vanessa would otherwise see.

## What it is

[`laya`](https://github.com/NandhaKishorM/laya) 0.3.21, Apache-2.0, Convai Innovations. A local,
non-autoregressive "System 1" decision engine: typed decisions (`choice`, `score`, `noul`) with
calibrated probabilities in **one forward pass, about 33 ms**, cloned at `$S/r11/laya` for this
round. No text generation, so nothing to parse and nothing to hallucinate. The model downloads
from Hugging Face `convaiinnovations/laya` on first use; after that it runs fully offline.

## Where it sits

```
request ──► Laya (this dir, ~33 ms, zero tokens, on-device) ──► confident? ──► ROUTE
                                                             └─► not confident? ──► ESCALATE ──► Vanessa
                                                                                      (full recall order,
                                                                                       CLAUDE.md levels 1-5)
```

It is the **first hop**, not a replacement for Vanessa or for `CLAUDE.md`'s recall order. For every
request it answers five typed questions, defined in [`router-questions.json`](router-questions.json)
to mirror `CLAUDE.md`'s routing table and model-tiering table row for row:

| Question | Answers |
|---|---|
| `brain_route` | Which of the 16 router-table classes this is, and therefore which leaf file |
| `lane` | Which AI-team seat owns it, per `wiki/ai-team/index.md` |
| `tier` | orchestrator / executive / worker / research — **tier only, never a model name** |
| `pii_gate` | Does this contain client personal data? (`noul`, calibrated probability) |
| `urgency` | not urgent / soon / blocking |

`laya_route.py` prints the decision and its probability, or `ESCALATE` when `brain_route`'s
confidence is below `--threshold` (default 0.60 — an unvalidated starting point; the Laya weekly
accuracy check in `always-on/README.md` is what should move it). **`pii_gate` overrides
`brain_route`**: at or above `--pii-threshold` (default 0.50) the decision is forced to the local
client path regardless of what `brain_route` said, and the request text is withheld from the
printed output. A client question phrased unusually is exactly the case a classifier is least sure
of, so this gate does not wait on `brain_route`'s own confidence to protect it.

## What it never does

- **Never decides a licensed matter.** Routing is not a rate quote, an eligibility call, a
  negotiation or a send — the HALT list in `CLAUDE.md` applies to what happens after Laya routes,
  unchanged.
- **Never sends client data off the machine.** That is the whole point of `pii_gate`: a
  client-shaped request is forced to the local vault path, never to a cloud model, the vector
  index or the knowledge graph.
- **Never writes to a live system.** It reads a request and prints a decision. Nothing else.
- **Never overrides Vanessa above its own uncertainty.** Below `--threshold` it says `ESCALATE`
  and gets out of the way — it does not guess to avoid admitting low confidence.
- **Never calls a cloud model or a web search itself.** Research-tier requests are *routed*
  toward research (Claude web research on Steven's subscription); Laya does not perform research.
- **Is never "running" by virtue of existing in this repo.** A package in `integrations/laya/` is
  not a Mac task, an MCP registration, or a proof — see the Needs-Steven row this round hands to
  the integrator.

## Files here

| File | What |
|---|---|
| `install.sh` | `uv venv ~/laya-venv`, `pip install "laya[mcp]==0.3.21"`, a Hugging Face reachability probe, then the one-time checkpoint download |
| `router-questions.json` | The five typed question sets, mirroring `CLAUDE.md` exactly, plus the `brain_route` → leaf-file map |
| `laya_route.py` | Reads one request (or a JSONL batch), prints the decision, or `ESCALATE` below threshold. `--engine real\|stub\|auto` — see below |
| `sample-requests.jsonl` | 20 non-PII sample requests spanning all 16 `brain_route` classes, each tagged with its intended class. This is the holdout the proposed Laya weekly accuracy check (`always-on/README.md`) should run |

## Install

```bash
./install.sh                 # uv venv ~/laya-venv, laya[mcp]==0.3.21, checkpoint download
```

Needs `uv` on `PATH`. Stops with an honest message (exit 2) instead of hanging if Hugging Face is
not reachable — the package and venv are still correctly installed in that case, only the
checkpoint download is blocked.

## MCP registration for Claude Code

Laya's own docs (`README.md` → "MCP Server (Optional)") ship the optional `laya[mcp]` extra, a
`laya-mcp-server` console script, and a generic stdio client config:

```json
{ "mcpServers": { "laya": { "command": "laya-mcp-server", "env": { "LAYA_DEVICE": "cpu" } } } }
```

That JSON form is Claude Desktop's shape, not Claude Code's. The equivalent registration in Claude
Code's own CLI form (`claude mcp add <name> [-e KEY=VAL...] -- <command>`), pointed at the venv
`install.sh` creates so it does not depend on shell `PATH`:

```bash
claude mcp add laya --env LAYA_DEVICE=cpu -- ~/laya-venv/bin/laya-mcp-server
```

This registers the server; it does not run it automatically and does not download the checkpoint.
Do this only after `install.sh` has completed on the Mac, and confirm with `claude mcp list` before
calling it "connected" anywhere.

## Sandbox proof — 2026-09-28, this round's worktree

Run from `$S/r11/work` (outside the repo — a venv is not a repository artifact):

```bash
uv venv --python 3.11 laya-venv
uv pip install --python laya-venv/bin/python "laya[mcp]==0.3.21"
```

**Install: real, and it works.** `uv` resolved and installed cleanly from PyPI (`pypi.org` needs
no proxy in this sandbox) in under a minute. `laya-venv/bin/python -I -c "import laya; print(laya.__version__)"`
printed `laya 0.3.21` — package import proven, matching Laya's own recommended check.

**Hugging Face: blocked, and it is a fast, explicit failure, not a hang.**

```
$ curl -sS -o /dev/null -w '%{http_code}\n' https://huggingface.co
curl: (56) CONNECT tunnel failed, response 403
[agent-proxy] huggingface.co:443 — connect_rejected (organization policy)

$ laya-venv/bin/laya "..." --predict --json
httpcore.ProxyError: 403 Forbidden

$ laya_route.py --engine real "What is the VA entitlement restoration process?"
httpx.ProxyError: 403 Forbidden

$ laya_route.py --engine real --batch sample-requests.jsonl
httpx.ProxyError: 403 Forbidden        # first request fails, batch aborts — fail-fast, not a hang
```

Both the raw network probe and Laya's own `--predict` path fail the same way: `403 Forbidden` at
this sandbox's egress proxy, on organization policy, in under a second — never a timeout. Laya's
routing-only mode (language/script detection, no checkpoint) is genuinely offline as documented:
`laya "..."` with no `--predict` answered in **90 ms with zero network calls**. `--predict` is what
`laya_route.py` needs for `brain_route`/`lane`/`tier`/`pii_gate`/`urgency`, and that is exactly the
path Hugging Face blocks.

**So: package logic proven against the stub, per the brief.** `laya_route.py --engine stub` uses a
deterministic, offline, bag-of-words matcher — no model weights, no network — that exists only to
exercise this script's own plumbing: does `router-questions.json` parse, does every `brain_route`
key resolve to the leaf `CLAUDE.md` names, does the confidence/`ESCALATE` branch fire, does
`pii_gate` correctly force the local-only override. **This is a proof of the harness, not of
Laya's accuracy — no claim here is a claim about the model**, which has never run in this sandbox.

```
$ laya_route.py --engine stub --batch sample-requests.jsonl
```

20 requests, all 16 `brain_route` classes covered (4 classes doubled), 2 deliberately client-shaped
(synthetic names, no real PII) to exercise `pii_gate`:

| Metric | Result |
|---|---|
| Requests | 20 |
| Routed (confidence ≥ 0.60) | **15 of 20** |
| Routed AND matched the row's own intended class | **14 of 15** (1 miss: a "why did we decide X" question was routed to `live_number` because it shared the word "lead" — a bag-of-words confound, not a plumbing bug) |
| `ESCALATE` (confidence below 0.60) | **5 of 20** — 3 of those 5 had the *correct* class as their top guess, just under threshold; 1 was a genuine wrong guess at moderate confidence; 1 was near-uniform (no real signal). Every one of these is exactly the case `ESCALATE` exists for |
| `pii_gate` fired | **2 of 20 — precisely the 2 rows (id 8, id 19) built to be client-shaped.** 0 false positives among the other 18 |
| Mean latency | **0.33 ms.** This is a bag-of-words dict lookup, not a neural forward pass — it is not Laya's 33 ms and must never be quoted as though it were |

`--engine real` was run against the same single request and against the full batch: both failed
identically to the probe above, immediately, on the first request — `httpx.ProxyError: 403
Forbidden`. The batch aborts on that first failure by design (fail-fast, not a silent partial
run); every request would fail the same way, since the block is on the checkpoint download, not
on any property of a particular request. `--engine auto` was also run: it attempted the real
call, printed the same 403 to stderr as a visible warning, and fell back to the stub rather than
failing silently or hanging — the intended behavior when this script eventually runs unattended.

**What this proves and what it does not.** Proven: the package installs cleanly, imports
correctly, and `laya_route.py`'s own routing/threshold/PII-override logic is correct end to end.
**Not proven, and not claimed:** Laya's real classification accuracy, its real 33 ms latency, or
that anything here runs on the Mac. That proof needs a Mac session where `huggingface.co` is
reachable — `install.sh` is written to make that the only remaining step.

## `route` field (R12-OMNI, 2026-09-28)

Every decision now also carries `route`: `subscription` (top/executive/worker tier — plain `claude`,
direct, never through OmniRoute; since 2026-10-05 the research tier too — Claude web research on
Steven's subscription, capped at 4 web-research sub-agents per wave; Perplexity removed and OmniRoute's
`research` combo withdrawn), or `local` (OmniRoute's `local` combo → Bonsai 27B on the Mac,
fail-closed, no cloud fallback ever). The mapping lives in `integrations/omniroute/route-map.json`,
not in this script — `laya_route.py --route-map <path>` overrides it, and a missing file degrades to
`subscription`/`local` only (never crashes; see `load_route_map`/`route_for`). **The one invariant
tested explicitly:** `pii_gate` firing forces `route=local` regardless of `tier` — re-run against
the same 2-of-20 client-shaped rows above (id 8, id 19: both `tier=orchestrator`, both now print
`route=local`) plus the full tier×pii_gate matrix, in `integrations/tests/test_laya_route.py`
(`python3 integrations/tests/test_laya_route.py` — 19 assertions, no network, no model weights).
Full design: `integrations/omniroute/README.md`.
