# Perplexica (Vane) — private AI search on the Mac

Installed 2026-11-09 at Steven's request ("install https://github.com/BunsDev/perplexica-search-engine-ai.git").
It's BunsDev's copy of **Vane** (formerly Perplexica, MIT licence), version 1.12.2. It's a self-hosted answer engine:
SearxNG searches the web without tracking, and an LLM you choose writes a cited answer. It has speed, balanced and quality
modes, academic and discussion sources, file upload, image/video search and a local search history.

**Where it runs:** on the Mac, in Docker, at **http://localhost:3010**. It's bound to 127.0.0.1, so only the Mac can
open it. Port 3000 belongs to OpenStock.

**Install / update / start (one paste on the Mac):**
```
cd ~/Repo && git pull -q && bash integrations/perplexica/install.sh
```
Stop it with `bash integrations/perplexica/install.sh stop`. Docker Desktop must be installed and open first.

**First run — Steven only:** open http://localhost:3010 → Settings → choose a model.
- **Ollama:** free and fully local. Needs Ollama on the Mac. This is the only choice allowed for anything touching a client.
- **Anthropic (Claude):** you paste your own API key into Perplexica's own Settings. The key stays on the Mac and is never
  put in the repo.

**Where it fits the brain:** it's a manual research tool for Steven and the Mac. It is **not** a recall level. Recall
level 3 stays Claude web research (CLAUDE.md, Perplexity removed 2026-10-05). Never put a client's name, phone, loan
detail or any other PII into a search: queries go out to public search engines through SearxNG.

**Security review (2026-11-09):** source pinned to commit `348feca`. Checked the Dockerfile, entrypoint.sh and
package.json scripts: no install-time hooks, no remote script downloads, and SearxNG runs inside the container. The image
is built from the reviewed source rather than pulled from Docker Hub. Bump `PIN` in install.sh only after a re-review.
