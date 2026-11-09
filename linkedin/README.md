# LinkedIn tools (Mac only)

Two tools from GitHub, both driven by **your own logged-in LinkedIn session**:

| Tool | What it is | How RoleCompass uses it |
|---|---|---|
| [joeyism/linkedin_scraper](https://github.com/joeyism/linkedin_scraper) | Python library (Playwright) that reads LinkedIn job, company and profile pages | `linkedin_scan.py` searches jobs for each RoleCompass lane and writes a CSV for Jobs → Import JobSpy results |
| [stickerdaniel/linkedin-mcp-server](https://github.com/stickerdaniel/linkedin-mcp-server) | MCP server: gives Claude tools like `search_jobs`, `get_job_details`, `get_company_employees`, `search_people`, `get_saved_jobs` | Lets you ask Claude (Desktop or Claude Code on your Mac) to search LinkedIn jobs or find people at a target employer in plain language |

Neither runs in the Claude cloud: that environment cannot reach linkedin.com, and both need a real browser with your login. Everything below happens in Terminal on your Mac.

**Read before using.** Both tools automate a logged-in account. LinkedIn's User Agreement prohibits automated access, and accounts that read pages too fast get challenged or restricted. Run them occasionally, at human pace (the scan pauses 3 s between pages by default), never on a shared or company account, and keep `--per-query` small. The RoleCompass board itself still never logs into LinkedIn; only these Mac tools do, with your session.

## Part 1: job scan with linkedin_scraper

One-time setup (same folder as the JobSpy setup, `~/rolecompass-jobspy`):

```bash
cd ~/rolecompass-jobspy && source .venv/bin/activate
```
```bash
curl -fsSL -o linkedin_scan.py https://raw.githubusercontent.com/chitown034/Repo/claude/tender-fermat-b1pa20/linkedin/linkedin_scan.py && curl -fsSL -o create_session.py https://raw.githubusercontent.com/chitown034/Repo/claude/tender-fermat-b1pa20/linkedin/create_session.py
```
```bash
pip install linkedin-scraper && playwright install chromium
```

Log in once (a browser window opens; sign in, finish any 2FA, wait for your feed; the session is saved to `linkedin_session.json` in that folder, never commit or share it):

```bash
python3 create_session.py
```

Run a scan (start small):

```bash
python3 linkedin_scan.py --lanes navwar-pss,defense-tpm --max-titles 2 --per-query 5 --lanes-file lanes.json --session linkedin_session.json
```

Then RoleCompass → **Jobs → Import JobSpy results** and choose the CSV. Rows are tagged `linkedin` and carry the full description, so Claude's scoring on import works well.

If the session expires, run `create_session.py` again. If LinkedIn shows a challenge page, stop for the day.

## Part 2: LinkedIn MCP server for Claude

Gives Claude on your Mac LinkedIn tools (job search, job details, Easy Apply form reading, people and company search). It reuses the LinkedIn login from your normal browser.

Prerequisite: [uv](https://docs.astral.sh/uv/getting-started/installation/):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Claude Code on your Mac** (plugin, simplest):

```bash
claude plugin marketplace add stickerdaniel/linkedin-mcp-server
```
```bash
claude plugin install linkedin-mcp-server@linkedin-mcp-server
```

**Claude Desktop**: Settings → Developer → Edit Config, add inside `mcpServers`:

```json
"mcp-server-linkedin": {
  "command": "uvx",
  "args": ["mcp-server-linkedin@latest"],
  "env": { "UV_HTTP_TIMEOUT": "300" }
}
```

First use: the server imports your LinkedIn cookies from the most recently used signed-in browser (close that browser first; macOS may ask for keychain access), or opens a login window. To do it explicitly:

```bash
uvx mcp-server-linkedin@latest --import-from-browser
```

Then ask Claude things like "search LinkedIn for Program Analyst jobs in San Diego posted this week" or "who works at Lyntris in program management". `dismiss_job` is irreversible and `get_easy_apply_form` only reads forms; nothing applies for you.

## Not done here

Nothing in this folder could be exercised from the cloud session that wrote it (no LinkedIn access, and the MCP server was blocked from running there), so `linkedin_scan.py` is untested against live LinkedIn. If it fails on your Mac, paste the error into Claude.
