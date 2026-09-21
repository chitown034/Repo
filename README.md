# Repo

Claude Code configuration and vendored references.

## Installed

- **`codex@openai-codex` plugin** — registered in `.claude/settings.json` via the
  `openai/codex-plugin-cc` marketplace.
- **`claude-cookbooks` submodule** — [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks),
  pinned at `claude-cookbooks/`.
- **Three cookbook skills** in `.claude/skills/`, copied from
  `claude-cookbooks/skills/custom_skills/`:
  - `analyzing-financial-statements` — financial ratio calculation and interpretation
  - `creating-financial-models` — DCF, sensitivity analysis, Monte Carlo
  - `applying-brand-guidelines` — document branding (ships with Acme Corporation
    placeholder values; edit `SKILL.md` and `REFERENCE.md` before real use)

  The skill scripts require `numpy` and `pandas`. They are copies, not symlinks,
  so they work without initializing the submodule; re-copy from
  `claude-cookbooks/skills/custom_skills/` to pick up upstream changes.

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
