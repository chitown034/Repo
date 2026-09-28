# Orca — wiring its agents through the same gates (researched 2026-09-28, not run against a live Orca)

`stablyai/orca` (`github.com/stablyai/orca`) is "the ADE for working with a fleet of parallel agents. Run
any coding agent with your own subscription." Steven's Mac already installs it
(`integrations/install-orca-whatsapp-laya.sh` §1, brew cask `stablyai/orca/orca`), which today does exactly
one thing and says so on its own: *"Orca only runs agents you start in it; it does not change how Vanessa or
your Mac runner work."* This file is about closing that gap — **without** touching that install script,
because nothing below is verified to a level this round trusts for an unattended script (see §Honest status).

## Goal

An Orca-launched **Claude Code** agent should go through `claude-auto` — the same lease/PII/route gates
every other Claude Code invocation on the Mac goes through (`integrations/omniroute-failover/README.md`).
An Orca-launched **OpenAI-compatible** agent (Codex, OpenCode) should be able to point at OmniRoute's `local`
or free-fallback combo directly, since those tools have no `claude-auto` to run through at all.

## What Orca's own GitHub confirms exists (issues + merged PRs, read 2026-09-28)

No single settings-doc page was found and fetched directly — the evidence below is titles/descriptions of
real, merged PRs and open issues on `stablyai/orca`, which is weaker than a fetched primary doc and is
flagged as such throughout. **Not executed against a live Orca session; nothing here has run.**

| Claim | Evidence |
|---|---|
| Orca supports **custom agents defined by an arbitrary command + args** ("bring your own CLI") | Issue #18249 *"user-defined agent entries — bring your own CLI, and presets for the ones you have"*; PR #17668 *"feat: add custom agent launch profiles"* |
| A custom command can be supplied **even when Orca's automatic agent detection fails or would guess wrong** | PR #21653 *"Allow custom agent commands when automatic detection fails"* |
| Custom agents can carry **their own env vars**, not just a command | PR #17195 *"fix(settings): always render the per-agent Environment field"*; a `orca-per-workspace-env` skill guide is indexed (skillsmp.com listing, not fetched directly) |
| A leading `VAR=value` prefix in a launch command is **parsed as an env assignment**, merged over the spawn environment, before Orca resolves the binary | PR #5363 *"Fix: support VAR=value env prefixes in agent command override"* |
| Each **execution host** (Orca can run agents on more than one machine) can carry its own command/args/env overrides | Search-result synthesis of Orca's settings docs, not independently fetched — treat as reported, not confirmed |
| **Codex and OpenCode are supported agent types**, listed alongside Claude Code | Orca's own README (fetched 2026-09-28): "40+ supported agent types" including both, with docs links |
| Orca can fail to recognize `claude`/`codex` as agents when launched via a wrapped `exec`+`env` shell form | Issue #21255 *"Codex and Claude launched via exec env are not classified as agents"* — **relevant**: a naive wrapper script could defeat Orca's own agent detection even if the gate still runs correctly underneath |

## The plan this implies (not yet built, not yet run)

**Claude Code agents, routed through `claude-auto`:**
1. Install `claude-auto` on PATH as today (`omniroute-failover/README.md` §Install, step 3: copied to
   `~/.local/bin/claude-auto`).
2. In Orca, define Claude Code's agent entry with a **custom launch command** pointed at `claude-auto`
   instead of the bare `claude` binary (the override PR #21653 documents exists for exactly this: a command
   Orca's own detection would not have picked). No `--task` is passed — an Orca session is interactive, a
   human is present, so it is correctly **not lease-gated** (`omniroute-failover/README.md` §Scope) and runs
   on whatever route `state/mode` already says, same as any other interactive Vanessa Live session.
3. Because of the `exec`/`env` wrapping caveat (issue #21255), the override should be the **plain path** to
   `claude-auto` — not a `VAR=value claude-auto` prefix form, and not an `exec ... env ...` wrapper — so
   Orca's own agent classification still recognizes it as a Claude Code session (chat rendering, token
   counts, etc. depend on that classification, separately from whether the gate itself runs).

**OpenAI-compatible agents (Codex, OpenCode), routed through OmniRoute directly:**
1. Define (or edit) that agent's entry with its per-agent env override (`agentDefaultEnv`, per PR #17195 —
   name not independently confirmed against a fetched settings schema) carrying:
   `OPENAI_BASE_URL=http://127.0.0.1:20128/v1` and that agent's own API-key env var pointed at whatever
   OmniRoute issues for its loopback endpoint (`omniroute-failover/.env`'s `OMNIROUTE_API_KEY`, same value
   already used for Claude Code's `ANTHROPIC_AUTH_TOKEN` — OmniRoute's `/v1` surface takes the same key).
2. **This does not get `claude-auto`'s PII gate** — structurally cannot: that gate lives inside
   `claude-auto.sh`, which Codex/OpenCode never execute. The only protection is whichever OmniRoute combo the
   agent is pointed at: the `local` combo is safe by the same fail-closed construction as everywhere else in
   this round (`integrations/omniroute/README.md` §The local combo), so pointing an OpenAI-compatible agent
   at `local` is fine for client-adjacent work; pointing it at the free-fallback combo is **not** — that
   combo has no PII gate of its own once entered this way, so Steven (a human, in Orca, choosing what to
   type) is the only safeguard, same as any other free-provider use without `claude-auto` in front of it.

## What this round did NOT do

- **Did not edit `integrations/install-orca-whatsapp-laya.sh`.** The brief's own rule: update it "only if a
  verified setting exists." What's confirmed above is that the *feature* exists (real, merged PRs); what is
  **not** confirmed is the exact settings-file path, JSON schema, or CLI incantation to write it unattended
  — every source above is an issue/PR title and description, not a fetched settings-doc page or a config
  file this round could read. Encoding a guessed schema into a script that edits Steven's real Orca install
  risks silently writing the wrong key (or corrupting a file this round never saw the shape of), which the
  brief's own "never installed/configured for anything not proven" rule forbids. The install script's
  existing line — *"Orca only runs agents you start in it; it does not change how Vanessa or your Mac runner
  work"* — remains accurate and is left exactly as it is.
- **Did not test any of §The plan against a live Orca session** — no Orca runs in this sandbox (it is a
  macOS desktop app).

## Verify before trusting any of this (Steven, on the Mac, once)

1. Open Orca → Settings → Agents → Claude Code (or wherever the current build puts custom-command overrides
   — the exact menu path was not confirmed from a fetched screen, only from PR descriptions of the feature).
2. Point its launch command at `~/.local/bin/claude-auto` and start a session; confirm `claude-auto --status`
   output (route mode, lease role) matches a session started the normal way from a terminal.
3. For a Codex/OpenCode agent, set its env override to the two vars in §The plan, start it, and confirm
   (OmniRoute's dashboard request log, or `X-OmniRoute-Decision` if the client surfaces response headers)
   that its traffic actually arrived at OmniRoute and not directly at whatever provider it normally talks to.
4. Record what actually exists at that menu path back into this file — it is currently a plan, not a proof.
