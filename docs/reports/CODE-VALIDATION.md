# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `8b62c8ed0ae0a7fe`: **not yet**.

```
code validation 2026-11-23T15:08:28Z - change-set 8b62c8ed0ae0a7fe
files:
  context/decisions.md
  docs/reports/LAYERS.md
  integrations/airllm/README.md
  integrations/airllm/ask.py
  integrations/airllm/install.sh
  integrations/notebooklm/drive-manifest.json
  integrations/omniroute/README.md
  references/index.md
PASS py_compile integrations/airllm/ask.py
PASS bash -n integrations/airllm/install.sh
PASS json integrations/notebooklm/drive-manifest.json
PASS brain doctor
verdict: PASS (4 passed, 0 failed)
```
