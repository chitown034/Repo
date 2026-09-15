# Repo

Claude Code configuration and vendored references.

## Installed

- **`codex@openai-codex` plugin** — registered in `.claude/settings.json` via the
  `openai/codex-plugin-cc` marketplace.
- **`claude-cookbooks` submodule** — [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks),
  pinned at `claude-cookbooks/`.

## Working with the cookbooks submodule

Fresh clone:

```bash
git clone --recurse-submodules --shallow-submodules https://github.com/chitown034/Repo
```

Existing clone:

```bash
git submodule update --init --depth 1 claude-cookbooks
```

Pull the latest upstream `main` and record the new pin:

```bash
git submodule update --remote claude-cookbooks
git add claude-cookbooks && git commit -m "Bump claude-cookbooks"
```

The submodule is marked `shallow = true`, so the clone fetches a single commit
(~210 MB of notebooks) instead of the full history.
