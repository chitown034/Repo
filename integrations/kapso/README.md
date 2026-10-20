# Kapso — WhatsApp for Vanessa, on Orca and the Command Deck (installed 2026-10-13)

**What it is.** Kapso (kapso.ai) is a hosted WhatsApp Business Cloud API: the real Meta API, wrapped with a free
sandbox number, a remote MCP server (`https://api.kapso.ai/mcp`) and a Claude Code plugin marketplace
(`gokapso/agent-plugins`, MIT, commit `a6cbfe9` on 2026-10-12). It is the route the deck's own WhatsApp note called
"real but needs a Meta Business account": Kapso's free plan skips that for the sandbox and handles it for a
business number later. It replaces the never-live `whatsapp-cli` / OpenWA path that drove the WhatsApp desktop app
(`integrations/mac-task-specs.md` §5/§5a stay as history; nothing there was ever live).

**Review.** The plugin is three skills (integrate, automate, observe), reference docs, a handful of Node scripts
that call `https://api.kapso.ai` with `X-API-Key`, and an MCP config pointing at the hosted server. No hooks, no
install script, no telemetry in the plugin itself; secrets are redacted from script output by design
(`SECURITY.md`). What Kapso *is*, though, is a third party that stores every WhatsApp conversation it carries, so
the rules below are Elena's and Alexandra's, not optional.

**Plan.** Free plan ($0: 2,000 messages, one number plus the sandbox). Pro ($25/mo) only if volume needs it
(HALT: money).
- **Phase 1 — sandbox, Steven only.** Steven signs up, signs the MCP in from Claude Code (`/mcp` → kapso), and
  messages the Kapso sandbox number from his own phone. Any Claude Code session launched from Orca reads and
  answers that thread through the MCP. Nothing is sent to anyone but Steven.
- **Phase 2 — a business number.** Needs a Meta Business account, verification, and a number not on personal
  WhatsApp (Needs-Steven packet). Client messaging then needs documented opt-in, the NMLS/DRE identity line,
  Alexandra's template review for anything marketing, and Elena's yes before any client name enters Kapso.

**Install (Mac).** `bash integrations/kapso/install-mac.sh install --apply` (`go.sh` step 11). It adds the plugin
marketplace and installs the `kapso` plugin for Claude Code, registers the MCP server at user scope so every
Claude Code session — including each one Orca launches — has it, and prints the one thing only Steven can do:
run `claude`, type `/mcp`, pick `kapso`, sign in. `doctor` reports the plugin, the MCP registration and, when a
Keychain key exists, the live number and conversation counts (never a message body).

**Command Deck.** The `whatsappKapso` document feeds the "WhatsApp — Kapso" card on the Vanessa panel and the
WhatsApp row of the reach table. The Mac task `kapso-inbox-sync` (spec §5b in `integrations/mac-task-specs.md`,
every 10 minutes) runs `integrations/kapso/kapso-fetch.py`, which reads the API key from the macOS Keychain item
`kapso` and produces only: connection status, numbers masked to their last four digits, and per-conversation
contact label, last-message time, direction and unread count. No message text reaches the deck. The script never
writes the deck itself: `kapso-fetch.py --json` prints the document and the task (or any Claude Code session asked
to "update the WhatsApp card") writes it with ArtifactData.

**The number.** Kapso assigned **(202) 474-5223** on 2026-10-14 — save it in the phone as *Vanessa (WhatsApp)*. The
allow-list (Keychain item `kapso-allow`) is Steven's own mobile, stored on the Mac by `install-mac.sh keys --allow
<digits>`; it is never written in this repo, the deck or a routine.

**Talking to Vanessa (Phase 1, the point of all this).** Steven messages (202) 474-5223 from his own phone.
Two ways she answers:
1. **Live, in a session** — any Claude Code session (Terminal or Orca) with the `kapso` MCP signed in: "read my
   WhatsApp" / "answer my WhatsApp" loads `.claude/skills/whatsapp-kapso` and she reads and replies on the thread.
2. **Unattended** — the Mac task `vanessa-whatsapp-inbox` (spec §5c, every 5 minutes) runs
   `kapso-fetch.py --inbound --since <last>` which returns **only** messages from the allow-listed number
   (Keychain item `kapso-allow` = Steven's own number; anyone else is counted, never read), answers as Vanessa,
   and sends through `kapso-send.py`, which refuses before any network call to send to any number but that one.
   The allow-list is the HALT line in code: a client send is impossible through these scripts.

**Keys (HALT: credentials).** Two Keychain items, both set by Steven on the Mac with one paste:
`bash integrations/kapso/install-mac.sh keys --allow <his 10-digit mobile>` stores `kapso-allow` (11 digits, country
code first) and then prompts, hidden, for the project API key (`kapso`). The script prints at most 4 digits of
either; neither value is ever in chat, this repo, the deck or a routine prompt.

**Orca.** No pairing changes. Because the MCP is registered at user scope, `claude --agent <seat>` inside an Orca
worktree sees the `kapso` tools; the skill `.claude/skills/whatsapp-kapso/SKILL.md` tells every seat the rules.
