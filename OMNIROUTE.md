# OmniRoute: auto-fallback for Claude Code

[OmniRoute](https://github.com/diegosouzapw/OmniRoute) is a local AI gateway.
With it, Claude Code:

- uses **your Claude subscription** first,
- **fails over to a free provider** when the subscription's usage runs out,
- **switches back automatically** when your usage resets.

No script watches your usage. Claude Code always talks to OmniRoute, and
OmniRoute's `priority` combo (`subscription-fallback`) picks a provider for
each request. Its circuit breaker skips the subscription while it's
rate-limited and probes it again once it recovers. You never restart Claude
Code for a switch.

## Setup across your computers

Run OmniRoute **once** on an always-on machine (the "server"). Then point
every computer's Claude Code at it. You do the Claude login once, on the
server.

`scripts/omniroute/install.sh` handles both roles on macOS and Linux.

**1. On the server machine** (needs Node.js 20 or later):

```bash
bash scripts/omniroute/install.sh server
# better fallback (recommended), using a free Google AI Studio key:
GEMINI_API_KEY=... bash scripts/omniroute/install.sh server --gemini-key-env GEMINI_API_KEY
```

This installs OmniRoute and turns on API-key protection, because other
computers connect to it over your network. It then opens a browser for your
Claude subscription login, adds the free fallback, creates the
`subscription-fallback` combo and an API key for your other computers. At the
end it prints the LAN URL and the exact client command. Allow inbound TCP
20128 in the server's firewall.

**2. On every other computer** (and on the server itself, if you code there):

```bash
bash scripts/omniroute/install.sh client --server http://<server-ip>:20128
# single computer instead: bash scripts/omniroute/install.sh local
```

The script first checks that the server is reachable, that it accepts the key
and that the combo exists. If any check fails, it changes nothing. If they
pass, it backs up `~/.claude/settings.json` and merges in this block, keeping
your other settings:

```jsonc
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://<server-ip>:20128",
    "ANTHROPIC_AUTH_TOKEN": "<OmniRoute API key>",
    "ANTHROPIC_MODEL": "subscription-fallback",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "subscription-fallback",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "subscription-fallback",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "subscription-fallback",
    "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY": "1"
  }
}
```

The model id is the plain combo name. OmniRoute resolves combos by exact
name, and `/v1/models` lists them that way. The `claude/combo/...` form only
works if you enable `EXPOSE_CC_DISCOVERY_ALIASES`. Restart Claude Code after
the script runs.

Other commands:

- `status` shows server health, providers, the combo, and where this
  computer's Claude Code points.
- `uninstall-client` removes the block after making a backup, so Claude Code
  talks to Anthropic directly again.

## Caveats

- **Pick a good fallback.** With no Gemini key, the fallback is AI Horde's
  anonymous tier: no signup, but slow, and it **can't make tool calls**.
  Claude Code depends on tool calls, so on that tier it's badly limited. Use
  `--gemini-key-env` if you can.
- **Start at login is not enabled.** The installer doesn't set it up. For
  that, see `omniroute autostart --help` on Linux or the OmniRouteTray app on
  macOS. Otherwise, re-run `server` after a reboot.
- **No Windows installer yet.** Its planned scheduled-task auto-start was
  blocked by the permission system. On Windows, install with
  `npm install -g omniroute`, run `omniroute`, then add the JSON block above
  to `%USERPROFILE%\.claude\settings.json` yourself.
- **Run it on your computers.** Cloud Claude Code sessions can't reach your
  computers, and their network policy blocks third-party AI hosts. To have
  Claude run this on a computer, start `claude remote-control` in a terminal
  on that machine, or use the Claude Desktop app.
