# MAC-INSTALL — laying this tree onto the Mac

Goal: the same brain on the Mac, where the vault, Jarvis, Graphify, Ruflo and `claude-runner` live.
Run these yourself; **nothing here can be installed from the cloud sandbox.**

## 0. Decide the home

Two homes, one tree. Pick one and symlink the other — never keep two copies.

| Option | Path | Best when |
|---|---|---|
| **A — inside the vault** (recommended) | `~/Shearrill-Vault/00-Brain/` | You want Obsidian to render it and Jarvis to index it for free |
| B — a Claude Code project | `~/Projects/second-brain/` | You want it under git, separate from the vault |

With A, point Claude Code at the vault folder as the project. With B, symlink it in:
`ln -s ~/Projects/second-brain ~/Shearrill-Vault/00-Brain`

## 1. Copy the tree

```bash
VAULT=~/Shearrill-Vault
mkdir -p "$VAULT/00-Brain"
cp -R <this>/brain/ "$VAULT/00-Brain/"
cd "$VAULT/00-Brain" && git init && git add -A && git commit -m "Second Brain: initial tree"
```

Then confirm the tree: `CLAUDE.md AGENTS.md context/ projects/ wiki/ references/ memory.md
vector-index/ knowledge-graph/ always-on/ recall-cache.md REMOTE-ACCESS.md OPTIMIZATION.md`.

## 2. Turn on auto-memory

In Claude Code, from the project root:

```
/memory on
```

`memory.md` is the store. It starts empty on purpose. Confirm Claude appends to it after the first
session rather than creating a second memory file somewhere else.

## 3. Duplicate AGENTS.md wherever a non-Claude agent starts

`AGENTS.md` is the Codex-facing mirror. Copy it to the root of **every** directory another agent is
launched from — Codex reads the nearest one, and a missing copy means that agent gets no router, no
token rules and no HALT list.

```bash
cp AGENTS.md ~/Projects/<other-repo>/AGENTS.md   # repeat per repo
```

## 4. Open the vault in Obsidian

Obsidian → Open folder as vault → `~/Shearrill-Vault`. The brain then sits next to the existing
folders (`50-AI-Team`, `60-Knowledge`, `70-Briefs`). Obsidian is the **visual layer** and Jarvis's
index source — it is not a second store, and nothing is authored twice.

## 5. Fix the write that is currently refused

`steve-twin-sweep` last **refused**: a Bash write to `~/Shearrill-Vault` is not on the runner's
allow-list. Until that path is allow-listed in the runner config, no task can write into the vault —
which means `ops-knowledge-graph` and the twin cannot populate the brain even once they run.
Do this before expecting anything in `always-on/README.md` to fill the tree.

## 6. Point the always-on tasks at it

No new tasks are needed. The five L5 tasks already exist (`always-on/README.md`). What they need:

- `brain-deck-sync` — already ok, hourly.
- `brain-learn-daily` — daily cron, **no completion recorded since 2026-09-15**. Run it once by hand
  to prove it.
- `brain-weekly-verify` — the Sunday gate. Confirm its review list lands somewhere Steven reads.
- `ops-knowledge-graph` — **never run**. Needs step 5 first.
- `fabric-deck-sync` — last completion **error**. Fix before trusting the store counts.

**Run each one manually once to prove it** before believing its schedule.

## 7. Verify

```bash
# every file present, none over 200 lines
find . -name '*.md' | wc -l
for f in $(find . -name '*.md'); do n=$(wc -l < "$f"); [ "$n" -gt 200 ] && echo "TOO LONG: $f ($n)"; done

# no secrets, no account numbers, no client names
grep -rniE 'api[_-]?key|secret|token|password|bearer ' --include='*.md' . | grep -v 'keychain\|\.env\|never'
```

Both should come back clean. Then ask Claude one question from each routing-table row and check it
opened exactly one leaf file.

## 8. Optional tooling (not required for the brain)

Every third-party tool Steven asked about — Headroom, Graphify, CodeBurn, Strix, Agent Reach, the plugins and
the nine vendored skills — has its own verified runbook: `MAC-INSTALL-tooling.md`. Do it after step 7, not before.

## 9. Run it — `MAC-SETUP.sh`, then `mac-verify.sh`

The two runbooks in step 8 are the reasoning; `MAC-SETUP.sh` is the executable form of both, and
`mac-verify.sh` tells you what actually landed. Both are idempotent and safe to re-run.

```bash
./MAC-SETUP.sh --dry-run     # prints every command it would run, changes nothing — read this first
./MAC-SETUP.sh               # install; --only <step> / --skip <step> to scope it, --list for the names
./mac-verify.sh              # read-only check; exit 0 only when everything required is healthy
```

`--list` also names the seven tools the installer **refuses** to install and the three it **declined**
after evaluation, each with its reason. `--only <a refused or declined name>` prints that reason and
exits 2 rather than saying "unknown step" — so "was this ever looked at?" always has an answer.
It writes no key: where a tool needs one it creates `~/.config/<tool>/.env` (`chmod 600`) holding the
variable **names** only, and prints what is still missing. Everything on a HALT row — a key's value,
an account, a LaunchAgent, a live task or a live prompt — is reported as NEEDS-STEVEN and left to you.
Log: `~/Library/Logs/vanessa-setup/<date>.log`. Neither script has ever been run on a Mac —
`docs/findings/findings-M3.json` lists line by line what is untested.

## 10. Reconciliation — every tool Steven named, and its true state

**Checked line by line on 2026-09-22 (V1) against `MAC-SETUP.sh`, the two runbooks, `.claude/skills/`
and `docs/findings/`.** This is the list to re-read when something "was supposed to be installed".
Full reasoning: `docs/findings/findings-V1.json`. `./MAC-SETUP.sh --list` prints the last two groups.

| What Steven asked for | True state | Where |
|---|---|---|
| WhatsApp → Vanessa (`marcelrgberger/whatsapp-cli`) | in `MAC-SETUP.sh` (`whatsapp-cli`) | FR5b §1 |
| Headroom · Graphify · CodeBurn | in `MAC-SETUP.sh` | FR5a §1, §2, §3 |
| OmniRoute + switch to free models on limit, back on refresh | in `MAC-SETUP.sh` (`omniroute`) + `integrations/omniroute-failover/` | FR5b §2 |
| Scrapling · Scrapegraph-ai | in `MAC-SETUP.sh` | FR5b §3a/3b |
| homes.com / SkySlope / zipForms / ShowingTime / Showami via CLI-Anything | in `MAC-SETUP.sh` (`cli-anything`). SkySlope + zipForms **gated on the ECC security review** | S1, `mac-task-specs.md` §4 |
| **Lofty** | **was never finished.** Right call (REST API, not a browser wrapper — F-S1-11), but nothing created the key file. **Fixed: new `lofty-keyfile` step** | F-S1-11 |
| Zoho | skill exists; blocked on a **profile permission only Steven can grant** (HALT) | `CONNECTIONS.md` |
| Apple Design · Find Skills · Karpathy CLAUDE.md | vendored in `.claude/skills/` | FR5a §7, §8, §14 |
| Agent Skills (addyosmani) | six skills **vendored individually**; the whole plugin is REFUSED (name collision) | FR5a §6 |
| Apple Health sync · Apple Health with Notion | `apple-health-notion` skill + `health-notion-sync` task spec. The `Rachnog` repo never reads Apple Health — reference only | FR5b §5 |
| Claude Code Setup · Ponytail · prompts.chat | **advisory, and the reasons were wrong.** Plugin installs are **not** interactive — verified exit 0. Each now states its real reason: policy (Setup), policy (Ponytail — hooks fire on every prompt), value (prompts.chat) | FR5a §4, §9, §12 |
| Screenshot-to-Code · Strix · Agent Reach · laya | advisory / on a named need; each with its own reason | FR5a §5, §10, §11, §17 |
| **Higgsfield API** | **was refused by association.** The *repo* is REFUSED (committed credential) — the *API* is not. **Fixed: new `higgsfield` step** creates the key file, names only, calls nothing | FR5b §4 |
| **Free AI API keys** (bytez · openrouter free · build.nvidia) | key **names** wired in `~/.config/omniroute/.env` + checked by `mac-verify.sh`. Pages still egress-blocked; Steven pastes values only | FR5b §2 |
| **`tashfeenahmed/freellmapi`** | **evaluated and DECLINED** — a second aggregator, not a key source. The verdict existed but was unfindable; now in `--list` and FR5b §6 | FR5b §6 |
| **`cheahjs/free-llm-api-resources`** | **repo is gone — HTTP 404, re-verified.** Wanted only as a catalogue; covered by OmniRoute's `FREE_TIERS.md` and `freellmapi.co/models` | FR5b §6 |
| openalternative.co | reference only, nothing to install | FR5a §13 |
| **"…with Notion + Drive"** | Notion wired. **Google Drive NEVER ADDRESSED** — no connector, no key, no client; two tasks claim to read it and the fabric tile counts **0 files**. Spec written, decision owed | `integrations/google-drive-brain.md` |
| `vphone-cli` · `Agent402` · `whatscli` · the media-inference worker · the Agent-Reach *skill* · the WhatsApp *plugin* · the addyosmani *plugin* | **REFUSED**, each with its reason, enforced by a runtime guard | `MAC-SETUP.sh --list` |

## What NOT to do

- Do not copy client pages into this repo. They live in the vault, on the Mac, and they are not
  committed. `wiki/clients/` ships with its index only.
- Do not put a key in a `.md` file. Lofty's key belongs in `~/.config/lofty/.env`; everything else
  in the Mac keychain. Reference the location, never the value.
- Do not let two copies of the tree exist. Symlink.
