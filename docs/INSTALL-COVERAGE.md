# INSTALL-COVERAGE — every tool Steven asked for, as a list, checked as a list

**Built 2026-09-22 by P6 (Install Coverage). Every upstream below was probed from this session, not
carried forward from an earlier doc.** Steven named ~28 things to install across this engagement. Each
got *some* treatment; nobody had ever checked the list **as a list**. This is that check: one row per
item, four questions each — is the upstream live, where does it live in this repo, does anything
actually install it, and does anything prove it afterwards.

**The short version.** The list is in much better shape than "nobody checked it" implies: **nothing is
Mentioned-only.** Every single item Steven named has a real runbook section, a real installer step, a
recorded refusal, or a recorded decline — there is no item that is just a name in a sentence. The real
gaps are different and more specific: **one upstream is genuinely dead** (`cheahjs/free-llm-api-resources`,
HTTP 404 — already caught and routed around, and no installer line points at it), **six items are
Spec-only** (a good runbook, but nothing installs them and nothing checks them), **one item is actively
mis-advertised** (the Google Drive half of the second-brain unification: the deck counts a store that
reads 0 files and two Mac task descriptions claim to read it), and **nothing on this list has ever run
on a Mac** — every "Installable" below is installable on paper only. Two new traps were found today: the
PyPI package `whatsapp-cli` is somebody else's project, and 13 of the 22 skills in `.claude/skills/` have
no frontmatter check at all.

## Counts

| Status | Count | What it means |
|---|---|---|
| **Mentioned-only** | **0** | Nothing reads as done purely on the strength of a sentence. See the note above. |
| **Dead** | 6 | 1 upstream genuinely gone (404); 5 alive but refused/superseded by an explicit, recorded decision. |
| **Spec-only** | 6 | Real runbook with real commands. Nothing installs it, nothing verifies it. |
| **unverified** | 1 | Could not be established from here, and I will not guess. |
| **Blocked-on-Steven** | 5 | Needs a credential, an account, money or a GUI login. One named action each. |
| **Installable** | 9 | A real installer line, pointing at a live upstream — **never run on a Mac.** |
| **Working** | 4 | Installed and proven by a check that has actually run. |
| | **31 rows** | 28 items Steven named; 3 split where he named two separable things at once. |

**"Working" means exactly four things** — the four vendored skill sets, proven by `mac-verify.sh`'s
frontmatter check, which I re-ran today against all 22 skills (all 22 pass). Everything else on this
list is, at best, a command that has never been executed on the target machine.

---

## The matrix — worst status first

Upstream column: **live** = probed 2026-09-22 from this session (`git ls-remote` anonymously, or the
registry's own JSON API). **dead** = 404. GitHub's *HTML* is uniformly 403 through this session's egress
proxy, so a 403 proves nothing and was never treated as evidence either way.

### Dead — gone, refused, or superseded

| Item | Upstream | Licence | Lives at | Installed by | Verified by | Status | Note |
|---|---|---|---|---|---|---|---|
| `cheahjs/free-llm-api-resources` | **DEAD — HTTP 404** | n/a | `MAC-INSTALL-comms-data.md` "Unreachable" §; `MAC-SETUP.sh:52` DECLINED_LIST | nothing | n/a | **Dead** | **The only genuinely dead URL on the list.** Confirmed twice today, independently: WebFetch → `HTTP 404`, and `git ls-remote` → auth prompt (GitHub's 404 signature). **No installer line anywhere points at it** — so there is no 6am failure waiting. Wanted only as a free-tier catalogue; replaced by OmniRoute's `docs/reference/FREE_TIERS.md` + `freellmapi.co/models`. |
| WhatsApp CLI — `normen/whatscli` *(Steven's URL)* | live | MIT (declared in README §License; **no LICENSE file**) | `MAC-INSTALL-comms-data.md` §1b; `MAC-SETUP.sh:34` REFUSED_LIST + `:45` guard | nothing — guard aborts the run | `mac-verify.sh` refused-absent "whatscli" | **Dead (superseded)** | Upstream is alive; the *item* was superseded. I read the upstream README today: line 26 says **"No automation of messages, no sending of messages through shell commands"** — the rejection reasoning is correct and verified against source, not assumed. Replaced by `marcelrgberger/whatsapp-cli` (next section). |
| `framepipe-dev/media-inference-worker` | live | (repo) | `MAC-INSTALL-comms-data.md` §4; `MAC-SETUP.sh:31` REFUSED + `:40-41` guards | nothing — guard aborts | `mac-verify.sh` refused-absent clone check | **Dead (refused)** | Commits a live-looking third-party credential. Refusal stands. The *Higgsfield API* is a separate row — it is not refused. |
| `tashfeenahmed/freellmapi` | live | MIT | `MAC-INSTALL-comms-data.md` §6; `MAC-SETUP.sh:51` DECLINED_LIST | nothing (declined) | n/a | **Dead (superseded)** | Not a key source — a *second* aggregator. OmniRoute holds that seat; two routers = two egress surfaces to audit for client data. `--only freellmapi` prints this reason. |
| `Lakr233/vphone-cli` | live | **MIT (LICENSE file present)** | `MAC-INSTALL-tooling.md` §15; `MAC-SETUP.sh:28` REFUSED + `:38` guard | nothing — guard aborts | `mac-verify.sh` refused-absent | **Dead (refused)** | Needs SIP/AMFI relaxation on the Mac holding the keychain and client files. **The install line in §15 is upstream-accurate** — I checked: `brew install zqxwce/tap/vphone-cli` is the repo's own README line 27, and `zqxwce/homebrew-tap` resolves live. Different owner is not a defect. |
| `MikeyPetrillo/Agent402` | live | **AGPL-3.0** (server); npm `agent402-mcp` 0.13.4 MIT | `MAC-INSTALL-tooling.md` §16; `MAC-SETUP.sh:29` REFUSED + `:39` guard | nothing — guard aborts | `mac-verify.sh` fails if it appears in `claude mcp list` | **Dead (refused)** | Pay-per-call tool market settled from an agent-held wallet — HALT line 1. npm shows 0.13.4 (doc says 0.13.3; harmless drift). |

### Spec-only — a real runbook, but nothing installs it and nothing checks it

| Item | Upstream | Licence | Lives at | Installed by | Verified by | Status | Note |
|---|---|---|---|---|---|---|---|
| **second-brain unification — the Google Drive half** | n/a | n/a | `integrations/google-drive-brain.md` (spec); `CLAUDE.md` recall order; `OPTIMIZATION.md` | **nothing** | **nothing** | **Spec-only** | **The most dangerous row on this page.** Notion, Obsidian, Jarvis, Graphify and the ECC lens are all real. Drive is not: no connector, no credential, no client. Worse than missing — it is *advertised as working*: the knowledge-fabric tile counts a "Drive folder" store that reads **0 files**, and two Mac task descriptions (`brain-learn-daily`, `openjarvis`) claim to read it. Steven owes one decision: **wire it (path A: point the indexer at the already-synced `~/Library/CloudStorage/GoogleDrive-…` folder) or drop it from the counts.** A 0-file store on the deck is a false green. |
| Ponytail | live (`DietrichGebert/ponytail`) | MIT | `MAC-INSTALL-tooling.md` §4 | **advisory only** — `MAC-SETUP.sh:737-738` prints the command, never runs it | none | **Spec-only** | Held on **policy, not safety**: its two Node hooks fire on every prompt of every session and inject into every subagent — a live-dispatch change on the Mac holding client files (HALT). Overlaps the vendored `karpathy-coding-principles`. Steven's call. |
| Screenshot-to-Code | live (`abi/screenshot-to-code`) | MIT | `MAC-INSTALL-tooling.md` §5 | **advisory only** — `MAC-SETUP.sh:753-754` | none | **Spec-only** | Also needs a provider API key (spend). FR5a's verdict — the hosted app is enough — still reads correct. |
| Claude Code Setup | live (`anthropics/claude-plugins-official`) | Apache-2.0 | `MAC-INSTALL-tooling.md` §9 | **advisory only** — `MAC-SETUP.sh:403-404` | none | **Spec-only** | Held on policy: it lands in the live user scope of the business Mac, and everything it *produces* is a hooks/settings edit (HALT-class). Install itself is read-only and low risk. Named as the first candidate to promote if Steven says yes once. |
| prompts.chat | live (`f/prompts.chat`); npm 0.1.1 | MIT code / CC0 prompts | `MAC-INSTALL-tooling.md` §12 | **advisory only** — `MAC-SETUP.sh:747-748` | none | **Spec-only** | Held on **value**, not safety: no business skill inside; Steven's prompts are his persona skills. |
| Apple Health alt — `Rachnog/alex-honchar-claude-for-life` | live | **no LICENSE file** (confirmed) | `MAC-INSTALL-comms-data.md` §5; `integrations/apple-health-dashboard.md` | nothing (reference only) | none | **Spec-only** | Correctly demoted to reference: it reads Oura/Garmin/Withings, **never Apple Health**. No licence file — ask before copying a schema. |

### unverified — could not be established from here

| Item | Upstream | Licence | Lives at | Installed by | Verified by | Status | Note |
|---|---|---|---|---|---|---|---|
| openalternative.co | **unreachable** — `EGRESS_BLOCKED` | n/a | `references/index.md:36`; `MAC-SETUP.sh:53` DECLINED | nothing to install | n/a | **unverified** | Re-attempted today by two paths: `curl` → `CONNECT tunnel failed, response 403`; WebFetch → `EGRESS_BLOCKED`. The row in `references/index.md` is honestly labelled "Steven's description … not yet read". **Nothing to install, so nothing is at risk** — but its content has still never been seen by anyone here. This is the closest thing on the list to Mentioned-only, and it is correctly flagged as such in place. To close it: read it from a browser on the Mac and fill in the row. |

### Blocked-on-Steven — one named action each

| Item | Upstream | Licence | Lives at | Installed by | Verified by | Status | The single action |
|---|---|---|---|---|---|---|---|
| Free API keys — bytez · openrouter · nvidia | sites egress-blocked (unchanged) | n/a | `MAC-SETUP.sh` `omniroute` step `ensure_env_file` | key **names** only, `chmod 600` | `mac-verify.sh:263` checks all four by name, and rejects placeholders | **Blocked** | **Paste three values** into `~/.config/omniroute/.env`, then `omniroute providers add <id> --credential-env <NAME>` for each. Names are already wired; only values are missing. |
| Higgsfield API | `platform.higgsfield.ai` (docs egress-blocked) | n/a | `MAC-INSTALL-comms-data.md` §4 + correction | `MAC-SETUP.sh --only higgsfield` creates the key file (names only, calls nothing) | `mac-verify.sh:269`, conditional on the file existing | **Blocked** | **Fund a Higgsfield account of his own** and put the two values in `~/.config/higgsfield/.env`. Spend + credential = two HALT rows. Business verdict is still "no use today". |
| Strix | live; PyPI `strix-agent` 1.6.2 | Apache-2.0 | `MAC-INSTALL-tooling.md` §10 | `MAC-SETUP.sh:717` — real, but only behind `--only strix` | `mac-verify.sh` optional check + `strix/.env` names | **Blocked** | **Decide the LLM budget and write the target authorization.** Needs Docker Desktop + a key that spends per run. Own systems only — never a lender portal or vendor SaaS. |
| Agent Reach | live (`Panniantong/agent-reach`) | MIT | `MAC-INSTALL-tooling.md` §11 | **advisory only** — `MAC-SETUP.sh:760-761` | none | **Blocked** | **Decide: dedicated Chrome profile or burner account.** It drives logged-in accounts with exported cookies. Its *skill* stays REFUSED (its "MUST USE for any research" frontmatter would hijack the router's research path). Trap confirmed today: PyPI `agent-reach` 0.1.0 is a different project — use the git URL. |
| Apple Health sync + Apple Health → Notion | n/a | n/a | `.claude/skills/apple-health-notion/`; `integrations/apple-health-dashboard.md`; `mac-task-specs.md` §3 | skill ships with the repo; **nothing installs the sync** | **no check at all** — `apple-health-notion` is not among the nine skills `mac-verify.sh` validates | **Blocked** | **Run the phone step once** (Claude iOS → Apple Health → Notion "Health Log" row), then create `health-notion-sync` disabled and run it by hand. Honestly documented: DB and card are live, the sync and the data are not. Creating the task is a live-task change (HALT). |

### Installable — a real installer line, live upstream, **never run on a Mac**

| Item | Upstream | Licence | Lives at | Installed by | Verified by | Status | Note |
|---|---|---|---|---|---|---|---|
| CLI-Anything — 7 targets | live (`HKUDS/CLI-Anything`) | hub MIT; browser Apache-2.0 | `integrations/cli-anything-harnesses/{browser,homes,showingtime,showami,skyslope,zipforms,lofty,zoho}`; skill `cli-anything-connectors` | `MAC-SETUP.sh:536` `pipx install cli-anything-hub`; `:543` plugin; `:561-565` browser clone; **`:631`** installs all 8 in-repo packages in one `uv pip install` | `mac-verify.sh:280` — `harness_check` for all seven, plus cli-hub, browser and namespace checks | **Installable** | All seven targets Steven named have a real package **and** a real check. Per-target caveats stand: homes/ShowingTime/Showami recipes are `verified:false` until a `--discover` run; SkySlope + zipForms gated on the ECC review; **Lofty is REST, not a wrapper** (correct call); Zoho blocked on a profile permission. Note `cli-anything-browser` is **confirmed not on PyPI** (HTTP 404 today) — which is exactly why the browser harness is vendored. |
| OmniRoute + free-LLM failover | live; npm `omniroute` 3.8.50 | MIT | `MAC-INSTALL-comms-data.md` §2; `integrations/omniroute-failover/` | `MAC-SETUP.sh:451` `npm install -g omniroute`, + copies `claude-auto`/`probe.sh` | `mac-verify.sh:164` + launcher byte-compare + route-mode age + probe escalation | **Installable** | The best-verified item on the list. Scripts pass `bash -n` only — never executed. PII canary must pass twice before the runner is pointed at `claude-auto`. |
| WhatsApp — `marcelrgberger/whatsapp-cli` *(the substitute actually installed)* | live | MIT | `MAC-INSTALL-comms-data.md` §1 | `MAC-SETUP.sh:429` clone + `:434-435` uv venv 3.12 + install | `mac-verify.sh` binary + **venv Python ≥ 3.12** | **Installable** | **New trap found today:** PyPI `whatsapp-cli` 0.1.3 is `yausername`'s unrelated project. The installer is safe — it installs from the clone's `agent-harness/` — but `pip install whatsapp-cli` would fetch the wrong thing. Now documented in §1. |
| Headroom | live; PyPI `headroom-ai` 0.38.0 | Apache-2.0 | `MAC-INSTALL-tooling.md` §1 | `MAC-SETUP.sh:412` `uv tool install --python 3.13 "headroom-ai[all]"` | `mac-verify.sh:148` | **Installable** | Measured trial on one report seat only; never wrap a session that reads `wiki/clients/`. |
| Graphify | live; PyPI `graphifyy` **0.9.66** | **Apache-2.0 per PyPI** | `MAC-INSTALL-tooling.md` §2; `knowledge-graph/README.md` | `MAC-SETUP.sh:385-386` `pipx install graphifyy` (uv fallback) | `mac-verify.sh:147` | **Installable** | Two small drifts found today: runbook says 0.9.65 (now **0.9.66**) and MIT-per-pyproject (**PyPI metadata says Apache-2.0**). Neither blocks; both are worth correcting at the next touch. `graphify install` appends to `~/.claude/CLAUDE.md` — a live-prompt edit, left to Steven. |
| CodeBurn | live; npm `codeburn` 0.9.25 | MIT | `MAC-INSTALL-tooling.md` §3 | `MAC-SETUP.sh:372` `npm install -g codeburn` | `mac-verify.sh:146` | **Installable** | Order of operations says do this first — it baselines the spend everything else is measured against. |
| Scrapling | live; PyPI 0.4.15 | **BSD-3-Clause** | `MAC-INSTALL-comms-data.md` §3a | `MAC-SETUP.sh:495` `uv pip install "scrapling[fetchers]"` | `mac-verify.sh` — imports `Fetcher`, and **fails distinctly** if the extra is missing | **Installable** | The `[fetchers]` extra is load-bearing (bare install → `ModuleNotFoundError: curl_cffi`) and both the installer and the checker encode that. Alexandra's written terms check gates every target. |
| Scrapegraph-ai | live; PyPI 2.2.4 | **no licence metadata on PyPI** | `MAC-INSTALL-comms-data.md` §3b | `MAC-SETUP.sh:517` | `mac-verify.sh` — version **and** rejects the 1.x build | **Installable** | `requires_python` confirmed today as `<4.0,>=3.12`, which is exactly why the venv is pinned to 3.12; on 3.11 PyPI serves the import-broken 1.76.0 and the checker calls that out by name. |
| Laya | live (`NandhaKishorM/laya`); PyPI **0.3.6** | **Apache-2.0 (LICENSE file)** | `MAC-INSTALL-tooling.md` §17 | **advisory only** — `MAC-SETUP.sh:767-768` | none | **Installable** *(was Spec-only; upgraded by proof today)* | **I installed it and ran its tests.** Fresh *empty* venv (pip+setuptools only), `pip install --no-cache-dir laya` → **exit 0, laya 0.3.6**, `import laya` ok, on **CPython 3.11** — the 3.12 pin is conservative, not required. Its `tests/` are **not a pytest suite**: `pytest tests/` aborts with `INTERNALERROR/SystemExit`; run as scripts, **7 of 8 pass** (`test_local_e2e` fails only for want of undownloaded checkpoints). Business verdict "not now" is unchanged — but the commands are now proven rather than asserted. |

### Working — installed and proven by a check that has actually run

| Item | Upstream | Licence | Lives at | Installed by | Verified by | Status | Note |
|---|---|---|---|---|---|---|---|
| Agent Skills (addyosmani) — 6 of 25 | live | MIT | `.claude/skills/{code-review-and-quality,git-workflow-and-versioning,source-driven-development,documentation-and-adrs,security-and-hardening,debugging-and-error-recovery}/` | ships with the repo; `MAC-SETUP.sh:355` asserts presence | `mac-verify.sh` frontmatter + link check — **re-run today, all pass** | **Working** | The whole plugin stays REFUSED: it ships an `interview-me` that collides by name with the brain's own. Six vendored individually is the right shape. |
| Find Skills (vercel-labs) | live | MIT | `.claude/skills/find-skills/` | ships with the repo | `mac-verify.sh` frontmatter — **passes** | **Working** | Needs the `skills` npm CLI (1.7.0, live) to actually search. Installing a skill it finds is a live-prompt edit → Sunday `skills-refresh` gate. |
| Apple Design (emilkowalski) | live | MIT | `.claude/skills/apple-design/` | ships with the repo | `mac-verify.sh` frontmatter — **passes** | **Working** | Byte-identical to upstream per FR5a. |
| Karpathy skills (`multica-ai/andrej-karpathy-skills`) | live | MIT **declared in README §License; no LICENSE file** | `.claude/skills/karpathy-coding-principles/` | ships with the repo | `mac-verify.sh` frontmatter — **passes** | **Working** | Licence is a README declaration only — I checked, there is no LICENSE file in the repo. Fine for internal use; worth knowing before redistribution. |

---

## Two gaps that are not any single item's fault

**1. 13 of the 22 skills in `.claude/skills/` have no check at all.** `mac-verify.sh` validates frontmatter
(name matches directory, description non-empty, relative links resolve) for exactly **nine** vendored
skills. The other thirteen — including **`apple-health-notion`** and **`cli-anything-connectors`**, both
directly on Steven's list — are unmonitored. I ran the checker's own logic against all 22 today and **all
22 pass**, so nothing is broken right now. But a future edit that breaks the frontmatter of
`apple-health-notion` or `zoho-crm-sync` would ship silently and `mac-verify.sh` would still exit 0.
Unchecked: `ai-ecosystem-backup`, `apple-health-notion`, `cli-anything-connectors`,
`continuous-process-improvement`, `interview-me`, `lofty-crm-sync`, `loop-engineering`, `prompt-master`,
`scale-growth-engine`, `skills-refresh`, `stress-test-sweep`, `vanessa-orchestrator`, `zoho-crm-sync`.
Fix is one line: widen the `for s in …` list to every directory under `.claude/skills/`.

**2. Nothing on this list has ever run on a Mac.** Every "Installable" row is installable *on paper*. The
first real run of `MAC-SETUP.sh` is still the first real test of all of it.

## Method, and what I did not do

- **Upstream probes:** `git ls-remote` anonymously against every named repo, plus `pypi.org/pypi/<p>/json`
  and `registry.npmjs.org/<p>` (both bypass the egress proxy). **GitHub HTML is uniformly 403 here**, so a
  403 was never read as "gone" — the one dead repo was confirmed by two independent methods.
- **The one install I proved by running:** Laya, in a fresh *empty* virtualenv, with its own test suite.
  Recorded above with the exact failure of the one test that fails and why. Disk was measured before and
  after (18G → 12G → 18G); the venv and every clone were deleted.
- **I did not re-prove** Headroom, Graphify, CodeBurn, OmniRoute, Scrapling, Scrapegraph-ai or the
  CLI-Anything harnesses in fresh venvs. Their existing records are from throwaway prefixes in earlier
  sessions and the CLI-Anything harnesses are being actively edited by another engineer as I write.
  Re-proving them would duplicate live work; their rows say "never run on a Mac", which remains true.
- **`MAC-SETUP.sh` and `mac-verify.sh` are moving under this audit.** Line numbers above are pinned to
  `MAC-SETUP.sh` sha256 `c708137a12a6…` (792 lines) and `mac-verify.sh` sha256 `c5aeea5a0a52…` (413 lines),
  both read 2026-09-22 ~23:30. A step I first read as missing (`cli-anything-harnesses`) appeared mid-audit;
  the table reflects the later state. Re-check the line numbers, not the claims, after the next commit.
