# Google Drive → the second brain — SPEC, nothing is installed

**Written 2026-09-22 by V1 (Build/Release) as part of the install reconciliation. Status: NEVER
ADDRESSED — this is the first document in the repo that treats Drive as a thing to build.**
Owner on acceptance: Integration Engineer (under CTO Innovator). Security lens: Elena / ECC.

## Why this file exists

Steven asked for "Orca/Jarvis/Ruflo 2nd brain with **Notion + Drive**/Graphify/Obsidian/RAG/ECC as
one self-improving Vanessa". Notion was wired — it is the record, `brain-deck-sync` fills it, the
Health Log lives there. **Drive was never wired, and nobody said so.** What exists instead is worse
than nothing:

| Claim in the stack | Where | Reality |
|---|---|---|
| `brain-learn-daily` "distills … his personal Google Drive 'Second Brain' folder" | `always-on/README.md`, `docs/inventory/mac-task-descriptions.md` | No Drive credential, connector or client exists for it to use |
| `openjarvis` "indexes the Obsidian vault + redacted Drive brain folder" | `docs/inventory/mac-task-descriptions.md` | Same |
| Knowledge-fabric tile counts a "Drive folder" store | `wiki/dashboard-ops/index.md`, `fabric-deck-sync` | Reads **0 files**, every sample |
| `OPTIMIZATION.md` resolves the stores into one recall path | `OPTIMIZATION.md` | Its component table lists seven components. Drive is not one of them. Neither was Notion |

So the deck advertises a store that nothing can reach, and `recall-cache.md` already lists "a store
the fabric count says is at 0 — e.g. the Drive folder" as an **alert** condition. It has been firing.

## The decision Steven owes, before any of this is built

**Either wire it, or drop it from the counts.** A 0-file store on the deck is a false green: it
implies a feed that does not exist. Dropping it is a legitimate, cheap answer — the vault already
holds 831 notes and Jarvis 1,760 documents, and Drive may simply be where Steven keeps files he
never intended an agent to read. Do not build this because it was on a list.

## If it is wired — the shape that fits the rules

Drive is an **L2 source that feeds Jarvis and the vault**. It is not a sixth store to query, and
nothing in the routing table should ever send a question to Drive. One direction only:

```
Drive "Second Brain" folder ──(read-only, redacted)──► local file mirror ──► Jarvis index ──► recall level 4
                                                                        └──► vault 60-Knowledge (human-readable)
```

Three candidate paths, cheapest first. None is installed; none was evaluated against the live
account, because nothing in this sandbox can reach Steven's Drive.

| Path | What it needs | Verdict to test |
|---|---|---|
| **A. Google Drive for Desktop** (already how most Macs mount Drive) | Nothing new — the folder is already on disk at `~/Library/CloudStorage/GoogleDrive-<account>/…`. Point the existing indexer at that path | **Try this first.** No API, no key, no OAuth scope, no new egress surface. If the folder is already syncing, this is a one-line path change and the whole problem is a configuration bug, not an integration |
| **B. `rclone` read-only remote** | `brew install rclone`, one OAuth grant, `rclone.conf` (a credential file — HALT) | Only if A is unavailable. Gives a scriptable `rclone lsjson`/`copy` with `--drive-scope=drive.readonly` |
| **C. A Drive MCP / Composio toolkit** | A new OAuth grant against Steven's Google account (HALT), and it adds a cloud hop | Last. Composio already carries googledocs/googlesheets/googletasks — adding googledrive widens what an agent can reach on that account |

**Credential location if B or C is chosen:** `~/.config/gdrive/.env`, `chmod 600`, variable NAMES
only, created by `MAC-SETUP.sh` the same way every other key file is. No value ever enters this repo.

## Hard rules this path inherits (not negotiable, not new)

1. **Read-only.** Nothing writes to Drive. Ever. It is a client-facing surface for anything shared.
2. **Redaction before indexing.** `openjarvis`'s own description already says "**redacted** Drive brain
   folder" — that redaction step does not exist yet and must be built before the first index run.
3. **No client PII into the vector index or the knowledge graph** (CLAUDE.md HALT). Drive is exactly
   where a signed disclosure or a borrower's document is most likely to be sitting. Assume the folder
   is contaminated until a human has looked at it.
4. **Scope the grant to one folder**, never the whole Drive, whichever path is taken.
5. **The Sunday review gate** applies to anything Drive contributes, like every other learned item.

## Acceptance test — what "wired" has to mean

Not "the connector says connected". Three things, in order:

1. `fabric-deck-sync` reports a **non-zero** Drive file count that matches what Steven sees in the
   folder, with a fresh `syncedAt`.
2. `brain-learn-daily` completes and writes at least one Second Brain row whose source is a Drive
   file — proving the hop it has always claimed actually happened. (It has recorded no completion
   since 2026-09-15 for unrelated reasons; fix that first, `MAC-INSTALL.md` step 5.)
3. A question whose answer only exists in a Drive file is answered at recall **level 4** (Jarvis),
   not by a five-store sweep.

Until all three pass, the honest deck state is "not connected", and the Drive line should be removed
from the fabric counts rather than shown at 0.
