# Repo

Dependencies and Claude Code plugins tracked for this environment.

## Python dependencies

- [`laya`](https://github.com/NandhaKishorM/laya) — multilingual, non-autoregressive
  typed-decision engine (PyPI: [`laya`](https://pypi.org/project/laya/)). Install with:

  ```bash
  pip install -r requirements.txt
  ```

  Quickstart:

  ```python
  from laya import Router

  router = Router(preload=True)
  result = router.predict(
      {"body": "We were billed twice, please refund."},
      {"urgency": {"type": "score", "instructions": "How urgent is this?",
                    "criteria": ["not urgent", "soon", "critical"]}},
  )
  ```

## Vendored source

- [`securo/`](securo/) — full source of [`securo-finance/securo`](https://github.com/securo-finance/securo)
  (AGPL-3.0), a self-hosted personal finance manager, vendored at upstream commit
  [`d7aa27e`](https://github.com/securo-finance/securo/commit/d7aa27ecb177f082d1ec99994283b769e0b76b85).
  This is a full application (Postgres + backend + frontend), not a dependency of this
  repo — nothing here runs it automatically. To run it from this checkout:

  ```bash
  cd securo
  docker compose up --build
  ```

  Then open <http://localhost:3000> and create an account. Bank sync (Pluggy, Enable
  Banking, SimpleFIN) and OIDC login are optional — see `securo/.env.example` and
  `securo/README.md` for configuration. `securo/.gitignore` already excludes real
  `.env` files and `secrets/`; keep any live credentials out of this repo.

## Claude Code plugins

Registered in [`.claude/settings.json`](.claude/settings.json):

- [`codex`](https://github.com/openai/codex-plugin-cc) (marketplace: `openai-codex`)
