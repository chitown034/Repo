# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `1c1e646d4e22c68c`: **not yet**.

```
code validation 2026-10-23T13:39:12Z - change-set 1c1e646d4e22c68c
files:
  CLAUDE.md
  brain/export_notebooklm.py
  brain/layers.py
  brain/links.py
  brain/tests/test_layers.py
  dashboard/brain-4d.html
  dashboard/brain-4d/build.py
  dashboard/brain-4d/template.html
  dashboard/brain-4d/test_build_passages.py
  docs/STEVEN-STEPS.md
  docs/reports/LAYERS.md
  integrations/CONNECTIONS.md
  memory/fieldy-meetings.md
  scripts/validate-code.sh
  wiki/ai-team/second-brain-layers.md
  wiki/ai-team/toolkit.md
PASS py_compile brain/export_notebooklm.py
PASS py_compile brain/layers.py
PASS py_compile brain/links.py
PASS py_compile brain/tests/test_layers.py
PASS quickcheck dashboard/brain-4d.html
PASS py_compile dashboard/brain-4d/build.py
PASS quickcheck dashboard/brain-4d/template.html
PASS py_compile dashboard/brain-4d/test_build_passages.py
PASS bash -n scripts/validate-code.sh
PASS brain unit tests
PASS brain layout
FAIL brain doctor
      FAIL index: brain/index.json stale vs the tree — a file's content, title or description changed since the last reindex — run `bin/brain reindex`
      ok   router: all 32 paths CLAUDE.md names exist
      ok   links: all 149 INDEX.md lines point at real files
      ok   layout: every mapped path exists and all 12 service modules have a test naming them
      doctor: FAIL
verdict: FAIL (11 passed, 1 failed)
```
