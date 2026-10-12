# Backend folder structure — the layered layout every new service follows

Source: the "Backend folder structure & use" diagram Steven saved on 2026-10-12 (Instagram, @smart_coder_hacker;
the same pattern as the Node/Express convention). Recorded here as the house rule for any backend the AI team
builds or vets (OpenStock, n8n flows, an ISA API, the brain's own code), and as the vocabulary `bin/brain layout`
uses to check the brain against it.

## The eight layers (request flows top to bottom)

| Folder | Job | Rule of thumb |
|---|---|---|
| `src/config/` | Database, environment and system configuration | Reads `.env`; nothing else touches environment variables |
| `src/models/` | Structure and validation of database collections or tables | Schema and validation only; no business logic |
| `src/middlewares/` | Processes a request **before** the controller: auth, logging, validation | Every gate is a middleware, so a controller never checks permissions itself |
| `src/controllers/` | Receives the request, validates input, sends the final response | Thin: parse, call a service, respond |
| `src/services/` | Business logic, data persistence, external service calls | The only layer that talks to models and third parties |
| `src/routes/` | Defines API endpoints (URLs) and maps them to controllers | One file per resource; no logic |
| `src/utils/` | Reusable helpers: loggers, string formatters, date math | Pure functions; no I/O that depends on a request |
| `test/unit/` + `test/integration/` | Tests for every backend component | A service without a test is unfinished |

Root files: `.env` (secrets, never committed), `.gitignore` (lists `.env` and `node_modules`), `package.json` and
`package-lock.json` (pinned dependencies), `server.js` (boots config, mounts middlewares and routes), `Dockerfile`
(reproducible build). `node_modules/` is generated, never edited.

## How the second brain maps onto it (checked by `bin/brain layout`)

| Layer | Brain equivalent |
|---|---|
| config | `brain/state/`, `brain/synonyms.py`, `brain/synonyms-learned.json`, `.env`-free by design |
| models | `brain/indexer.py` (the index schema), `brain/bench/*.json` (gold shapes) |
| middlewares | the HALT list in `CLAUDE.md` and the gates in `brain/route.py` (Alexandra, ECC, Vanessa) |
| controllers | `brain/__main__.py` (parse the command, call one module, print) |
| services | `brain/recall.py`, `ask.py`, `pack` in `loop.py`, `learn.py`, `passages.py`, `agentos.py`, `encyclopedia.py` |
| routes | the routing table in `CLAUDE.md` and `INDEX.md` (one line per file) |
| utils | `brain/text.py`, `brain/stopwords.py` |
| tests | `brain/tests/` (84+ tests), `scripts/setup-health.sh` |

## Rules that follow from it
- A new integration ships with the same shape: config (what it reads), a model (what it stores), the gate it
  passes (HALT or ECC), a thin entry point, the service that does the work, and a test. `integrations/n8n/library`
  and `integrations/openstock` already follow it; `bin/brain layout` says which brain services lack a test.
- Secrets only in `.env`-style files outside the repo (`chmod 600`), never in config files that are committed.
- Validation happens twice on purpose: the model validates shape, the middleware validates the caller.
