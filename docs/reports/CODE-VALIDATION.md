# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `8f35c2585bc5759d`: **not yet**.

```
code validation 2026-10-23T06:20:55Z - change-set 8f35c2585bc5759d
files:
  connect-all-tests.sh
  connect-all.sh
  context/decisions.md
  docs/STEVEN-STEPS.md
  integrations/CONNECTIONS.md
  integrations/notebooklm/README.md
PASS bash -n connect-all-tests.sh
PASS bash -n connect-all.sh
FAIL brain doctor
      FAIL index: brain/index.json stale vs the tree — a file's content, title or description changed since the last reindex — run `bin/brain reindex`
      ok   router: all 29 paths CLAUDE.md names exist
      ok   links: all 146 INDEX.md lines point at real files
      ok   layout: every mapped path exists and all 12 service modules have a test naming them
      doctor: FAIL
verdict: FAIL (2 passed, 1 failed)
```
