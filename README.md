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

## Claude Code plugins

Registered in [`.claude/settings.json`](.claude/settings.json):

- [`codex`](https://github.com/openai/codex-plugin-cc) (marketplace: `openai-codex`)
