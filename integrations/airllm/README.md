# AirLLM — big open models on the Mac, one layer at a time (added 2026-11-23)

Source: https://github.com/lyogavin/airllm (Apache-2.0), commit `7f7b518` (2026-11-23), PyPI `airllm==4.0.0`.
Steven, 2026-11-23: "install https://github.com/lyogavin/airllm.git".

**What it does.** Runs large open models (Llama 3.x, Qwen3, DeepSeek and more on a CUDA PC; Llama-style models only on a
Mac) with very little memory by loading one layer at a time from disk. No quantization needed. The trade is speed: a
70B model answers in minutes, not seconds, so it suits overnight or batch drafts, not chat.

**Where it sits.** A second engine for the brain's **local tier**, next to Bonsai 27B through OmniRoute
(`integrations/omniroute/README.md`). Same rule as Bonsai: **off until proven on the Mac**, and the PII gate does not
route client data to it until a proven run is recorded here. It never calls a cloud model and has no cloud fallback.
Owner: Derek (CTO), with Nadia for model choice.

**Install (Steven's Mac, Apple silicon).**

```bash
cd ~/Repo && git pull
bash integrations/airllm/install.sh          # ~/airllm/.venv with airllm 4.0.0 + mlx + torch
bash integrations/airllm/install.sh smoke    # downloads TinyLlama 1.1B (~2.2 GB) and answers one question
bash integrations/airllm/install.sh status
```

Then any Llama-style model: `~/airllm/.venv/bin/python ~/airllm/ask.py --model <hf-repo-or-path> "question"`.
Gated models (Meta Llama, some Mistral) need your own `huggingface-cli login` first; the script never reads a key.

**Disk.** The first run splits the model into per-layer files under `~/airllm/layers`, roughly the model's own size
again (8B ≈ 16 GB, 70B ≈ 140 GB). `install.sh status` shows it; delete a model's folder there to reclaim it.

**Proven in the cloud session (2026-11-24).** Installed in the orchestrator's cloud machine (4 CPUs, no GPU):
`airllm 4.0.0` in a venv, TinyLlama 1.1B downloaded and split, and asked in TinyLlama's chat format — it answered
"The capital of the United States is Washington, D.C." Two things learned there: `ask.py --device auto` now falls back
to CPU (float32) when no GPU exists, and in that cloud environment Hugging Face downloads need `HF_HUB_DISABLE_XET=1`
(the newer transfer host is not on its allowlist). The Mac run is still to be proven.

**Guardrails (CLAUDE.md HALT).** Answers are drafts; never a rate quote, an eligibility call or a client send.
