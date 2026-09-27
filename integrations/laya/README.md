# Laya — proposed router/gate hint (NOT installed on the Mac)

**Status: proposed, not installed.** No Mac is reachable from this cloud session and there is no
GPU or large-egress budget here to download a checkpoint, so this integration ships as an
importable, syntax-clean script and this doc only. `python3 -m py_compile
integrations/laya/laya_route.py` passes; it has never been run against a real Laya install.

## What Laya is

From its own README (`github.com/NandhaKishorM/laya`, package `laya` 0.3.21, Apache-2.0):
a **multilingual, non-autoregressive "System 1" decision engine** — typed `choice` / `score` /
`noul` (calibrated probability) answers over any state (text, email, ticket, JSON) in a single
forward pass, ~33 ms on a T4 GPU / ~200 ms CPU, no text generation so nothing to parse and nothing
to hallucinate. Three checkpoints (`english` 421M params, `multilingual` 322M params covering
100+ languages, `typed-decisions` 421M fine-tuned) behind a `Router` that auto-detects script/
language and picks the right one. Installed with `python -m pip install laya`; the MCP server is
an extra, `pip install "laya[mcp]"`.

## Why it fits principle 3 — deterministic/cheap before the model

`brain/`'s retrieval engine already commits to this order: keyword → INDEX.md score (no file
opens) → open one file → best section → one pointer hop → **call the model only once, last**.
Laya slots in *before* that last step, as a second cheap layer that is still not the frontier
model: a 33 ms/200 ms local forward pass that produces a structured hint (which wiki branch, or
context-vs-connection-vs-sensitive) with a calibrated confidence — cheaper than a model call,
more structured than a keyword score, but still probabilistic rather than deterministic. It never
replaces the deterministic INDEX.md scoring; it narrows or confirms it.

## Install on a Mac

```bash
python3 -m pip install "laya[mcp]"
```

**First-run checkpoint download size — not exactly stated in the README.** What is verifiable
from the source: the three checkpoints together are about **1.16B parameters**
(`laya/router.py`'s own docstring), and the Docker CPU quickstart doc (`docs/docker.md`)
recommends **8 GB RAM and 10 GB free disk** for the image plus first download (that figure covers
PyTorch itself, not weights alone, so it is an upper-bound proxy, not a weights-only number). The
MCP server preloads only `english` + `multilingual` by default (`LAYA_MODELS`, see
`laya/mcp/server.py`) and leaves `typed-decisions` lazy, so the first real download for this
integration's use case is two checkpoints, not three. Confirm the actual on-disk size the first
time it runs on the Mac and record it here — this doc does not claim a number that wasn't read
from the source.

## MCP server registration (Claude Code)

Real entrypoint, from `pyproject.toml`'s `[project.scripts]`:

```
laya-mcp-server = "laya.mcp.server:main"
```

Register it the same way as any stdio MCP server, e.g.:

```bash
claude mcp add laya -- laya-mcp-server
```

The server exposes `laya_status`, `laya_route`, `laya_predict`, `laya_predict_batch`,
`laya_route_batch`, `laya_shortlist`, `laya_preset`, `laya_decide` (`laya/mcp/server.py`). This
repo's `integrations/laya/laya_route.py` does not use the MCP server — it calls the Python SDK
(`from laya import Router; Router().predict(state, questions)`) directly as a CLI, which is the
simpler path for a one-shot hint and needs nothing registered with Claude Code at all. The MCP
registration above is for a future session that wants Laya as an interactive tool rather than a
one-shot script.

## Enabling it for the brain

Not wired into `brain/` yet — the engine currently treats any absent hint (Laya not installed) as
"ignore it," which is the honest state today. When Laya is installed on the Mac:

```bash
export BRAIN_ROUTER=laya
```

is the flag `brain/`'s engine should check (per the parallel `brain/` build) before shelling out
to `integrations/laya/laya_route.py --json "<question>"` for a route hint, or `--gate "<text>"`
before an ingest write.

## HALT caveats

- **Local model, so client text never leaves the Mac** — a real plus for PII versus routing
  through any API-based classifier. This is why the gate mode is safe to run over client-adjacent
  text at all: nothing is transmitted.
- **It is still probabilistic.** A `choice`/`noul` answer with a confidence score is a hint, never
  a decision. It only ever **boosts** the deterministic INDEX.md scoring already in `brain/`; it
  must never be the sole reason something is routed, ingested, or treated as safe. In particular,
  the gate's `sensitive` score (a calibrated probability, not a certainty) narrows the ingest
  decision toward "skip" — `laya_route.py` forces `ingest: false` once `sensitive` crosses
  `SENSITIVE_BLOCK_THRESHOLD` (0.5) — but it does **not** override CLAUDE.md's HALT list. Client
  PII, credentials, or anything else HALT already names must still be caught by the deterministic
  checks upstream of Laya; a low `sensitive` score from a probabilistic model is not permission to
  skip that check.
- Every checkpoint is "over-confident as shipped" per Laya's own README (its calibration section)
  — treat a raw confidence number as ordering, not as a guarantee the answer is correct.

## Files

- `laya_route.py` — the CLI described above. `--json "<question>"` for route hints,
  `--gate "<text>"` for the ingest/sensitivity gate. Exits 3 with a JSON error if `laya` is not
  importable (the current state on this Mac); the brain engine treats any non-zero exit as
  "ignore the hint."
