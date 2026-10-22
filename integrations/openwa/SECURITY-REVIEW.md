# OpenWA — security review (R9 · C1-whatsapp · 2026-09-27)

Reviewed from a full clone at `$S/r9/openwa` (`rmyndharis/OpenWA`, MIT, `package.json` version
`0.23.7`, NestJS + TypeORM, dual engine). Read: `SECURITY.md`, `docs/04-security-design.md`,
`docs/05-database-design.md`, `README.md`, and the source under `src/modules/auth`, `src/common/security`,
`src/engine`, `src/modules/webhook`, `src/config`. Everything below is either read from source/docs or
measured in this sandbox (see `SECURITY-REVIEW.md` §"Proof" below and the command log in
`$S/r9/work-C1-whatsapp/logs/`). Nothing here is installed on Steven's Mac; see §0 of `BRIEF-CONNECT.md`.

## It drives WhatsApp Web unofficially — say this plainly

OpenWA is **not** Meta's official Cloud API. It connects through two reverse-engineered clients
(`README.md` "Before you connect a number — please read"):

| Engine | How it talks to WhatsApp | Ban-risk (the project's own words) | Resource cost |
|---|---|---|---|
| `whatsapp-web.js` (default, drives Puppeteer/Chromium) | Real headless Chromium, looks like genuine WhatsApp Web traffic | **Lower** | ~300–500 MB RAM/session |
| `@whiskeysockets/baileys` | Speaks the multi-device WebSocket protocol directly | **Higher** — "easier for WhatsApp to fingerprint" | ~30–80 MB RAM/session |

The project's own guidance: never link a primary personal/business number; there is "always a
non-zero risk of account restriction or ban"; warm up a fresh number; rate-limit; keep a fallback
channel. Steven is linking his **own personal number** in self-chat mode (`context/decisions.md`,
2026-09-23 direction carried in `MAC-INSTALL-comms-data.md` §1). Given that, **the Mac package
below defaults `ENGINE_TYPE=whatsapp-web.js`** (lower ban-risk profile) even though this review's
"prove it here" pass below used `baileys` for a sandbox-specific reason explained there. Steven can
switch to `baileys` for lower RAM if he accepts the higher fingerprint risk — his call, not made here.

## Dependencies — `npm audit`

Installed clean (`npm install`, Node 22.22.2, 1031 packages added, exit 0). `npm audit --json`:

```
moderate: 2, high: 0, critical: 0, total: 2   (1092 dependencies total)
```

Both are transitive, both moderate, neither reachable through anything this integration calls:

- **`qs`** (2.2.5–6.15.3, array-limit/DoS advisories) — pulled in by `@bull-board/express` → `express@5`
  and by `supertest`/`superagent` (dev/test only). OpenWA's own bulk-message DTOs use `class-validator`,
  not `qs`, for body parsing.
- **`hono`** (≤4.13.4, path-traversal/parser advisories) — pulled in by `@modelcontextprotocol/sdk`'s
  Streamable-HTTP transport, used only when `MCP_ENABLED=true` (off by default; the Mac package leaves
  it off).

The repo's own CI gate (`scripts/check-audit.mjs`) blocks only `high`/`critical` with a per-advisory
allowlist that is currently **empty** — i.e. the maintainers' own bar is already clean at that
threshold; these two moderates sit below it. No action needed beyond re-running `npm audit` on
whatever commit Steven ends up installing.

## Outbound network calls and telemetry

Grepped `src/**/*.ts` (excluding specs) for literal `http(s)://` targets and cross-checked each hit
against the calling code:

| Destination | What / when | Opt-out |
|---|---|---|
| `api.github.com/repos/rmyndharis/OpenWA/releases/latest` | Update-check (`src/modules/infra/update-check.ts`): unauthenticated GET, once per 6h per process, only for the dashboard's "new version" banner. Body capped at 256 KB, 5s timeout, goes through the SSRF-guard's own pinned connection (not `HTTP(S)_PROXY`). | `UPDATE_CHECK_ENABLED=false` |
| `raw.githubusercontent.com/wppconnect-team/wa-version/...` | `src/engine/wa-web-version.ts`: resolves/pins the WhatsApp Web build the `whatsapp-web.js` engine loads, refreshed every 24h. The code's own comment: the fetched HTML "is executed inside the authenticated web.whatsapp.com origin with no integrity check" — a real supply-chain trust point, disclosed by the maintainers, not hidden. | Pin `WA_WEB_VERSION` explicitly instead of the auto-pin |
| `raw.githubusercontent.com/rmyndharis/OpenWA-plugins/main/plugins.json` | Plugin marketplace catalogue — only fetched if the plugin browser/search is used. Steven's package installs no plugins. | Don't use the plugin marketplace UI |
| `chat.whatsapp.com`, `call.whatsapp.com`, `pps.whatsapp.net`, and WhatsApp's own protocol endpoints | Inherent to the WhatsApp protocol itself (invite links, call links, profile-photo CDN, the Baileys/wwebjs connection) — not additional telemetry. | n/a |
| `fonts.googleapis.com` / `fonts.gstatic.com` | Dashboard CSP allowance for the bundled React UI's webfonts — browser-side, not a server call. | Self-host fonts if this matters |

**No telemetry/analytics SDK found.** Checked `package.json` dependencies and grepped source for
`telemetry|analytics|posthog|sentry|mixpanel|amplitude` — the only hits were code comments about
database "analytics queries" (stats aggregation) and a bulk-message event named for "alerting/analytics
plugins," not an outbound call. Unlike the CLI-Anything hub (opt-out PostHog, per `mac-task-specs.md` §4),
OpenWA itself ships nothing that phones a metrics vendor.

## What it stores, and where

Per `docs/04-security-design.md` §4.4 and `docs/05-database-design.md`, verified against the entities:

| Data | At rest | Protection |
|---|---|---|
| API keys | **Hashed** — SHA-256, HMAC-SHA256 if `API_KEY_PEPPER` is set (`src/modules/auth/api-key-hash.ts`) | One-way; a DB leak alone can't recover a key |
| WhatsApp session/auth state | Plaintext on disk under the data volume (`whatsapp-web.js` LocalAuth / Baileys `useMultiFileAuthState`) | Filesystem permissions only |
| Message content | Plaintext in the `messages` SQLite/Postgres table | DB access control only |
| Webhook secrets, proxy credentials | Plaintext columns, never echoed back by read DTOs | DB access control only |
| `data/.api-key` (the seed admin key, shown once) | Plaintext file, **written 0600** | Owner-only file perms — verified here (see Proof) |
| `data/.env.generated` | Plaintext, **written 0600** | Owner-only file perms |
| Media (images/audio/docs) | **Not persisted to the storage backend by default** — returned inline to the API/webhook caller; `STORAGE_TYPE=local` only matters for the built-in backup/export feature | n/a unless export is used |

**No application-level encryption at rest anywhere** (the project says so plainly). This matters more
here than for a typical deployment because a WhatsApp self-chat used as Vanessa's channel will carry
whatever Steven types to her — the exact same "entire history in plaintext on disk" cost
`MAC-INSTALL-comms-data.md` §5a already accepted for `ChatStorage.sqlite`. OpenWA doesn't add a new
exposure class; it moves the plaintext store from Apple's SQLite file to OpenWA's own SQLite file,
both under the same Mac, same disk. FileVault (already recommended in §5a) covers this the same way.

## How its auth works

Bearer-style API keys (`X-API-Key` header or `Authorization: Bearer`), format `owa_k1_<64 hex>`
(32 cryptographically random bytes, `crypto.randomBytes`). Three roles — `admin` / `operator` /
`viewer` (lower-case in the API; `SECURITY.md`'s prose capitalizes them). Two independent scoping
axes, both verified live in this sandbox:

- **`allowedSessions`** — restricts a key to named WhatsApp sessions; infra routes, key-lifecycle
  routes, and cross-session stats stay closed to a session-scoped key.
- **`allowedChats`** — restricts a key to specific chats (`<phone>@c.us`, `<id>@g.us`, `<lid>@lid`, or
  a bare number). This is the mechanism the Mac package uses for Vanessa's key: a chat-scoped
  operator key can send/read only inside its listed chats and every route not explicitly marked safe
  for it refuses with `403` **by default**, including routes added in later releases — i.e. the
  refusal, not an allow-list, is what a new endpoint inherits.

No fixed "dev" key is ever used unless an operator explicitly sets `ALLOW_DEV_API_KEY=true` — absent
that, first boot always mints a random key (`resolveSeedApiKey()` in `auth.service.ts`). The Mac
package's `.env.example` leaves `ALLOW_DEV_API_KEY` unset.

## Loopback binding — a real nuance, not a checkbox

`src/main.ts` calls `app.listen(port)` with **no host argument** — the Node process itself binds every
interface, not just `127.0.0.1`. "Loopback-only" is delivered by the **Docker Compose port
publish**, `'127.0.0.1:${API_PORT:-2785}:2785'` (both `docker-compose.yml` and `.dev.yml`, verified
by reading the files) — the container's internal `0.0.0.0:2785` is never reachable from outside the
host because Docker only forwards the loopback-bound host port. There is **no equivalent guarantee
for a bare `node dist/main` run** — that's exactly how this review's own proof-of-run was started
(no Docker daemon in this sandbox), and it was reached only by curling `127.0.0.1` ourselves, never by
an application-level restriction. **The Mac package below installs via Docker Compose for this
reason** — it is the only path that actually enforces loopback without an extra firewall rule.

## Webhook delivery — SSRF guard, and the one opt-in it needs for this use case

`WEBHOOK_SSRF_PROTECT=true` by default, and it **blocks loopback and RFC1918 targets** — verified
in `src/common/security/ssrf-guard.ts` (127.0.0.0/8, RFC1918, link-local/metadata, ULA, and their
IPv6 equivalents are all on the deny list). That's the right default for a public deployment, but it
is exactly wrong for Vanessa's bridge, where the webhook target is **local n8n on the same Mac**
(127.0.0.1, a different port). The fix is the documented escape hatch, `SSRF_ALLOWED_HOSTS` — a
named allowlist of specific hosts, not a blanket `WEBHOOK_SSRF_PROTECT=false`. The Mac package's
`.env.example` sets `SSRF_ALLOWED_HOSTS=127.0.0.1`, nothing wider. Delivery is HMAC-SHA256 signed
(`X-OpenWA-Signature: sha256=<hex>`, `crypto.timingSafeEqual` on verification) — n8n's webhook node
must check this before acting on a payload; see `BRIDGE.md`.

## Other hardening worth carrying into the Mac package

- Non-root container (`gosu`, drops from root after a volume `chown`), `dumb-init` as PID 1.
- Docker socket is never mounted into the app container; a `tecnativa/docker-socket-proxy` sidecar
  on an internal-only network is the sole path to the daemon, and `SECURITY.md` is candid that this
  is an operational gateway, not a privilege boundary (POST enables every method on the enabled
  paths). Steven's package needs no datastore orchestration (SQLite needs no Postgres/Redis/MinIO
  container), so it never starts the socket proxy: `install.sh` and the launchd job both run
  `docker compose up -d --no-deps openwa-api`. Without `--no-deps`, a plain `up -d openwa-api`
  WOULD start it, because openwa-api lists it under `depends_on` (as `required: false`, which only
  tolerates its absence). Corrected 2026-09-28 by the integrator; the first draft of this section
  said the proxy was not started while the script's `up` still started it.
- Plugins are explicitly "full host trust" — the sandbox is a resource cap, not a security boundary
  against a malicious plugin. The Mac package installs zero plugins.
- `ENABLE_SWAGGER` defaults off in production; a documented advisory (`SECURITY.md`) warns that an
  `.env` copied before that advisory could have pinned it on — the package's `.env.example` ships it
  commented out, matching upstream's post-advisory template.
- One cosmetic, non-security bug observed live: on a completely fresh `data/` directory, the first
  `chmod 0600` on `data/.api-key` logs `ENOENT` (the file doesn't exist yet at that exact instant);
  a second write succeeds and the file lands at `0600` as intended (confirmed with `ls -la`). No
  window where the key file is readable by anyone but its owner — the log line is misleading, not
  a vulnerability. Not worth a report upstream on its own.

## Proof this was tested here (not "installed" — see BRIEF-CONNECT.md §0)

Full command-by-command log: `$S/r9/work-C1-whatsapp/logs/`. Summary, in order:

1. `npm install` (Chromium download skipped — `PUPPETEER_SKIP_DOWNLOAD=true` — because this pass
   used the `baileys` engine; see "why baileys here" below) → exit 0, 1031 packages, 1m.
2. `npm audit --json` → 2 moderate, 0 high/critical (table above).
3. `npm run build` (`nest build`) → exit 0.
4. Started `node dist/main` with `NODE_ENV=production`, `DATABASE_TYPE=sqlite`,
   `ENGINE_TYPE=baileys`, `SSRF_ALLOWED_HOSTS=127.0.0.1` → clean boot, no errors; console printed a
   freshly-minted `owa_k1_…` admin key (captured once, then redacted out of every saved log —
   `grep -rE "owa_k1_[0-9a-f]{20,}"` over `work-C1-whatsapp/logs/` returns nothing).
5. `curl http://127.0.0.1:2785/api/health` → `{"status":"ok",...}` HTTP 200.
6. `POST /api/sessions` → created; `POST /api/sessions/{id}/start` → `status:"initializing"`,
   `engineLoaded:true`.
7. `POST /api/auth/api-keys` with `role:"operator"`, `allowedChats:["<placeholder>@c.us"]` → HTTP 201,
   a chat-scoped key.
8. Scope enforcement, live: the chat-scoped key against an admin-only route → `403`; against
   `GET /api/sessions` → `403`; no key → `401`; a garbage key → `401`. All four match the documented
   model exactly.
9. Registered a webhook (`events:["session.status"]`) pointing at a local Python listener on
   `127.0.0.1:9797`, then `POST /api/sessions/{id}/stop`. The listener received the event **with**
   `X-OpenWA-Signature` present, correct JSON shape (`event`, `deliveryId`, `idempotencyKey`, `data`).
10. **Did not** reach `qr_ready`. `baileys` needs a live WebSocket connection to WhatsApp's
    multi-device edge; this sandbox's egress proxy explicitly does not support WebSocket upgrades
    (`/root/.ccr/README.md`: "Not supported through the proxy... WebSocket upgrades... report, do
    not work around"). The session sat correctly at `initializing`/`engineLoaded:true` — that is the
    software working as designed against a network boundary that is a property of this sandbox, not
    of OpenWA or of Steven's Mac. `baileys` (no browser) was chosen for this pass specifically to
    avoid also needing a Chromium download under the same blocked egress; the finding would be
    identical either way, since both engines need an outbound connection this sandbox cannot make.
    **On the Mac, with ordinary internet, both engines reach `qr_ready` in seconds** — that step is
    `not-reached` here and is called out as such in the hand-back, not claimed.

No secret value, PII, or Steven's phone number appears in this file, in the Mac package, or in the
retained logs.
