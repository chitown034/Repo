# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `bca6ef1dccfebd3c`: **not yet**.

```
code validation 2026-11-15T20:35:36Z - change-set bca6ef1dccfebd3c
files:
  brain/__main__.py
  brain/mausbot.py
  brain/tests/test_mausbot.py
  context/decisions.md
  integrations/sellbird/README.md
  integrations/sellbird/install.sh
  references/index.md
  scripts/fix-mine.sh
PASS py_compile brain/__main__.py
PASS py_compile brain/mausbot.py
PASS py_compile brain/tests/test_mausbot.py
PASS bash -n integrations/sellbird/install.sh
PASS bash -n scripts/fix-mine.sh
PASS fix-mine shell tests
PASS brain unit tests
PASS brain layout
PASS brain doctor
verdict: PASS (9 passed, 0 failed)
```
