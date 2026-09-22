# OmniRoute — auto-fallback for Claude Code

This sets up [OmniRoute](https://github.com/diegosouzapw/OmniRoute), a local
AI gateway, so Claude Code can transition automatically:

- **Primary:** your real Claude subscription.
- **When its usage/tokens are exhausted:** automatically fail over to a free
  fallback provider through OmniRoute.
- **When your Claude tokens reset:** automatically switch back to the Claude
  subscription.

The switching itself is not a script we run — it's OmniRoute's own
**tier-cascade** + **circuit breaker** design. Claude Code always talks to
OmniRoute; OmniRoute forwards each request to your Claude subscription while
it's healthy, and to the fallback tier only while the subscription is
rate-limited, then automatically resumes the subscription once its quota
window resets (it tracks Claude's session/weekly reset countdowns). No
Claude Code restart is needed — the decision happens per request, inside
OmniRoute.

## Why this isn't fully automated

Two of these steps need your live credentials and can't be scripted by an
agent:

1. **Connecting your actual Claude subscription** to OmniRoute is an OAuth
   login — it has to happen in a browser, by you.
2. **Auto-installing and continuously running a third-party gateway that all
   your Claude Code traffic flows through** is a meaningful, persistent
   change to this environment. Doing that unattended (e.g. via a
   `SessionStart` hook that reinstalls and (re)launches it on every future
   session) was blocked by this session's auto-mode permission classifier
   ("Unauthorized Persistence") — which is the right call: routing your AI
   traffic through a new always-on service is not something that should
   happen silently. If you want that automated, say so explicitly and
   approve the `.claude/hooks/session-start.sh` edit (or add a Bash
   permission rule) and I'll wire it in.

## Manual setup (one time)

1. **Install & start OmniRoute:**

   ```bash
   npm install --global omniroute
   omniroute
   ```

   Dashboard + API come up at `http://localhost:20128`.

2. **Connect your Claude subscription** in the dashboard under `Providers`
   (OAuth) — this becomes **Tier 1 / Subscription**.

3. **Connect at least one free-tier provider** the same way — this is the
   fallback tier used only while Tier 1 is exhausted.

4. **Create a combo** with the `priority` strategy, Claude subscription
   listed first, the free provider second (e.g. name it
   `subscription-fallback`). `priority` drains the first target before
   moving to the next, and OmniRoute's circuit breaker automatically
   re-probes and resumes Tier 1 once it recovers — this is what implements
   "switch back when tokens reset."

5. **Point Claude Code at it.** Claude Code reads these once at startup, so
   add them to `.claude/settings.json` (or export them before launching
   `claude`):

   ```jsonc
   {
     "env": {
       "ANTHROPIC_BASE_URL": "http://localhost:20128",
       "ANTHROPIC_MODEL": "claude/combo/subscription-fallback",
       "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY": "1"
     }
   }
   ```

   Restart Claude Code after saving. Until step 4 is done, don't add this
   block — with no combo to route to, requests would just fail.

Reference: OmniRoute's own
[Claude Code Configuration guide](https://github.com/diegosouzapw/OmniRoute/blob/main/docs/guides/CLAUDE-CODE-CONFIGURATION.md)
and [Resilience Guide](https://github.com/diegosouzapw/OmniRoute/blob/main/docs/architecture/RESILIENCE_GUIDE.md)
(circuit breaker thresholds/reset behavior).
