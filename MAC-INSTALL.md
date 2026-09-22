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

`--list` also names the seven tools the installer **refuses** to install, each with its reason.
It writes no key: where a tool needs one it creates `~/.config/<tool>/.env` (`chmod 600`) holding the
variable **names** only, and prints what is still missing. Everything on a HALT row — a key's value,
an account, a LaunchAgent, a live task or a live prompt — is reported as NEEDS-STEVEN and left to you.
Log: `~/Library/Logs/vanessa-setup/<date>.log`. Neither script has ever been run on a Mac —
`docs/findings/findings-M3.json` lists line by line what is untested.

## What NOT to do

- Do not copy client pages into this repo. They live in the vault, on the Mac, and they are not
  committed. `wiki/clients/` ships with its index only.
- Do not put a key in a `.md` file. Lofty's key belongs in `~/.config/lofty/.env`; everything else
  in the Mac keychain. Reference the location, never the value.
- Do not let two copies of the tree exist. Symlink.
