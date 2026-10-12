# n8n workflow library (Zie619/n8n-workflows) — added 2026-10-12

**What it is:** 2,061 ready-made n8n workflow files (MIT, reviewed at commit `94007c1`; its README claims 4,343 — only 2,061 are in the
checkout), grouped by service. Almost all are generic (Gmail, Sheets, Slack, Notion, Telegram, Calendly, OpenAI). **Not found:** any
Lofty workflow; one Zoho CRM workflow; nothing specific to mortgage or real estate. It is a parts bin, not a business system.

**How it is used here:** read-only catalog. `bash integrations/n8n/workflow-library.sh install --apply` clones it to
`~/Applications/n8n-workflows` (outside this repo) and builds a local index. Nothing runs. The library's own web server is not started
(it needs a pinned FastAPI stack and adds nothing the catalog doesn't).

## Commands

| Command | Does |
|---|---|
| `workflow-library.sh find calendly --safe` | search by words/service; `--safe` hides every workflow with a risk flag below |
| `workflow-library.sh show <path>` | nodes, trigger, flags, exactly which systems it can write to |
| `workflow-library.sh risks` | counts per risk class |
| `workflow-library.sh stage <path> [--into-n8n]` | writes a copy with `active:false` and every credential reference removed; with `--into-n8n` imports it into your **loopback** n8n, still inactive |

## What the scan found (all 2,061 files, static read)

| Risk | Count | Rule |
|---|---|---|
| Shell command nodes | 23 | `stage` refuses unless you pass `--i-reviewed` |
| SSH nodes | 9 | same |
| Token-shaped secret | 1 | same (the loose scan flagged ~47; mostly placeholders) |
| Code/Function nodes (run JavaScript) | 657 | hidden by `--safe` |
| Local file read/write | 224 | hidden by `--safe` |
| Webhook with no authentication | 395 | hidden by `--safe`; never expose your n8n to the internet |
| Can write to an external system (email, CRM, Sheets, posts…) | 1,076 | allowed, but only ever staged inactive; you turn on any write |
| **No unsafe flag at all** | **1,013** | the usable pool |

2,120 of 2,128 HTTP-request URLs are the placeholder `{{ $env.BASE_URL }}`: where they point is decided by *your* settings, so read
each one before enabling. No pastebin/ngrok/raw-IP endpoints found beyond a private LAN address and one gist link in samples. Nothing
overtly malicious.

## Worth a look for Steven's business (staged inactive, your credentials, write nodes off first)

| Workflow | What it does | Writes to |
|---|---|---|
| `Calendly/0039_…Calendly_Notion…` and `…/0125_…` | Calendly booking → Notion log | Notion |
| `Datetime/0348_…GoogleCalendar…` | Google Calendar → Zoom, scheduled | nothing found |
| `Manual/1543_…Openai_Automation…` | OpenAI summarising to Gmail/Sheets | none found |
| `Openai/1177_…GoogleSheets…` | Sheets trigger + OpenAI | Sheets |
| `Form/1537_…GoogleSheets…` | form capture → Sheets + email (lead-capture pattern) | Sheets, email |
| `Linkedin/1330_…Schedule…` | scheduled LinkedIn → Notion | Notion |
| `Zohocrm/0086_…Zohocrm_Trello…` | Shopify order → Zoho record + Gmail/Mailchimp | **CRM write — HALT: Steven decides** |

**Rules (CLAUDE.md HALT list):** anything that emails or texts a client, writes to Zoho/Lofty, posts publicly or touches a licensed
activity is **Steven's switch**, never auto-activated; credentials go in n8n's own store, never in a workflow file or in chat; use
throwaway test credentials first. Where n8n runs: `integrations/n8n/` (loopback only, Node 24+). Owner: Derek (tech) with Elena
gating credentials.
