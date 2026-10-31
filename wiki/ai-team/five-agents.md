# The five agents — one boss and four specialists (built 2026-10-31)

From Steven's "5 Claude Agents to Build First" image. Each is one text file in `.claude/agents/`; the Mac installer
(`bash integrations/agent-os/install-mac.sh --apply`) links them into `~/.claude/agents` so they run from anywhere.

| Agent | What it does | Reports to | Model | Never |
|---|---|---|---|---|
| `chief-of-staff` | The only agent Steven talks to. Splits a request, runs the specialists in parallel, returns one brief | Vanessa | Opus | sends, posts, quotes, spends |
| `inbox-triage` | Unread Gmail → URGENT / REPLY / READ LATER / IGNORE; reply drafts in his voice from his last 20 sent emails; fraud flags first | Voicemail & Inbox Triage (Victor) | Sonnet | sends, deletes, labels |
| `calendar-prep` | PREP page per meeting: WHO, HISTORY, OPEN PROMISES, GOAL (Calendar + Gmail + Fieldy) | Meeting Scribe (Vanessa) | Sonnet | touches the calendar or emails attendees |
| `competitor-watch` | Weekly public-page check of `context/competitors.md`; dated snapshot in `docs/competitor-watch/`; reports only changes | Competitive Intelligence Analyst (Victor) | Sonnet | logs in, uses paid data, invents rivals |
| `hook-writer` | 3 hooks, 3 titles, 1 caption per post; `context/banned-words.md`; Reg Z / Fair Housing rules; NMLS line | Content Writer (Sofia) | Sonnet | posts; uses numbers without disclosure |

**Use it:** in Terminal, `claude --agent chief-of-staff "prep my Monday"`. Or ask any agent directly, e.g.
`claude --agent hook-writer "VA loan with zero down for a first-time buyer"`.

**Steven's part:** (1) Gmail, Google Calendar and Fieldy connectors on in claude.ai (they are); (2) name 3–6 rivals
in `context/competitors.md`, or let the first run propose them; (3) add his own words to `context/banned-words.md`;
(4) say yes if he wants calendar-prep hourly on weekdays and competitor-watch on Monday mornings as cloud tasks
(live tasks are his decision).

The old generated `chief-of-staff` seat (a generic message-triage seat) is replaced by this boss agent; message
triage is now `inbox-triage`. Hand-written files in `.claude/agents/` always win over generated seat files.
