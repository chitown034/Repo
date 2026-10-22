# Branch triage — 2026-10-22

Every unmerged `claude/*` branch was reviewed read-only against the main line
(`claude/stoic-cori-pvn3f8` at 75ec72c) for what it adds, overlap, conflicts (`git merge-tree`),
secrets/PII, session-start cost and the CLAUDE.md HALT list. Re-read this before re-reviewing
any of these branches. A verdict changes only if the branch gets new commits.

| Branch | Adds | Verdict | Why | Owner |
|---|---|---|---|---|
| `focused-bardeen-klwryi` | Vanessa 3.0 dashboard (`vanessa/`, v10–v76: VA toolkit, scenarios, lender profiles, Autopilot/AI Squads), `mods/` (vanessa-hq, drafts-only-guard, public-repo-guard), `/zoho` (app42) | **Merge — needs Steven's go-ahead** | 0 conflicts, no secrets or client PII. Another session may still be writing to it. Zoho is wired, not live (its own gap note still records NO_PERMISSION). After the merge, add Composio `ZOHO_CREATE*`/`ZOHO_UPDATE*` to drafts-only-guard, and register `vanessa/` and `mods/` | Vanessa · Derek |
| `tender-feynman-mw4cm1` | AEO/SEO/GEO/AIO presence kit | **Taken** as a held draft → `projects/aeo-presence/` | Real marketing value. Needs Alexandra's review (Reg Z triggering terms, VA disclaimer) and fact checks first; see `projects/aeo-presence.md` | Sofia, gated by Alexandra |
| `festive-edison-9w9fyl` | Standalone Node "Mortgage Lead CRM" (workflow engine, agents, campaigns; 29 tests pass) | Skip | Autonomous mode sends SMS/email/voicemail with no human gate (HALT). It also duplicates Zoho and Lofty. Keep it as its own repo if ever wanted | Nadia (proposal) |
| `gracious-clarke-vhfy7z` | Bot Crew page: dating, job-hunt and ticket personas | Skip | Unrelated to the business | — |
| `dreamy-keller-qhzlsk` | simple-english and asd-ste100 skills | Skip | Low fit. simple-english's ~900-char trigger list loads into every session and overlaps writing-guidelines | Derek |
| `dreamy-keller-sipfxn` | Cookbook finance/brand skills plus a ~210 MB submodule | Skip | Corporate DCF/ratio tools, Acme placeholder brand; the submodule is not worth vendoring | Marcus |
| `friendly-carson-wuha2x` | scroll-world skill plus plugin installs on SessionStart | Skip | 5–20 s of network on every session. Codex is already enabled | Derek |
| `compassionate-feynman-r6imxq` | LLM gateway setup script | Skip | Routes all prompts (client NPI) through an unverified third party; disables connectors | Elena |
| `wizardly-dijkstra-e8pqaw` | OmniRoute subscription fallback plus SessionStart npm install | Skip | Sends Claude traffic to free third-party providers, breaking the PII-local rule. Main's `integrations/omniroute*` is the governed version | Elena |
| `tender-fermi-3nwvdl` | OpenJarvis clone + Rust build on SessionStart | Skip | 1–3 min on every session. `integrations/jarvis/` already covers it | Derek |
| `sharp-mendel-1u24o6` | OpenBot installer (curl \| bash, OpenAI key) | Skip | No brain use case; pipe-to-shell install | Derek |
| `serene-brahmagupta-m9v95e` | Orca headless launch | Already on main | — | Derek |
| `admiring-planck-u1qu64` | Early router plus a vendored `securo/` app (263k lines) | Skip; keep as an archive | Superseded; 9 add/add conflicts | — |

**Cost note for Derek.** Main's own SessionStart hook clones and builds Orca on every cloud session
(2–5 min of pnpm). Making that opt-in or cached would save time on every remote session.
