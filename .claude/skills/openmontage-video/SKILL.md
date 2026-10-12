---
name: openmontage-video
description: Make a marketing, explainer or training video with OpenMontage on the Mac (~/Applications/OpenMontage) — Sofia's brief, Claude Code runs the pipeline, Steven approves every creative stop, nothing is posted. Use when Steven asks for a video, an explainer, a listing montage, a talking-head clip or a social video; install first with integrations/openmontage/openmontage.sh.
---
# OpenMontage video

Installed by `bash integrations/openmontage/openmontage.sh install --apply` (`go.sh` step 10). Reviewed commit
`e45f5b1`, 2026-10-12. Reference: `integrations/openmontage/README.md`.

## Before the first frame
1. **Brief first (Sofia's lane).** Audience, length (30–90 s for social), tone, one call to action, platform.
   Any mortgage or real-estate claim goes through Alexandra's line: NMLS 1921615, Equal Housing, no rate quote,
   no "guaranteed", no eligibility promise. The brief is a Needs-Steven packet; he approves before rendering.
2. **Pick the pipeline, do not improvise.** In the OpenMontage folder read `AGENT_GUIDE.md`, then the manifest in
   `pipeline_defs/` (animated-explainer for VA-loan explainers, documentary-montage for listing/area videos,
   talking-head or avatar-spokesperson for Steven on camera, podcast-repurpose for clips), then its stage skill in
   `skills/pipelines/`. Check the live tool envelope first:
   `python -c "from tools.tool_registry import registry; registry.discover(); print(registry.support_envelope())"`.
3. **Cost gate (HALT: money).** The offline path (Piper voice, FFmpeg, free stock keys) costs nothing. Any provider
   that bills per render (fal, Kling, Runway, Atlas, Sora) needs Steven's yes with an estimate first. Never add a key
   yourself; keys live only in `~/Applications/OpenMontage/.env`, typed by Steven.

## Run
- Work inside `~/Applications/OpenMontage` with its venv active. One sentence of intent is enough: the pipeline
  researches, scripts, narrates, finds music, subtitles and renders, pausing for approval at each creative decision.
- Let the pipeline's self-review (ffprobe, frame samples, audio levels, delivery-promise check) finish before
  calling anything done. Output lands in `output/`.

## After
- The MP4 is a draft for Steven. Posting to YouTube, Instagram, a listing page or a client is his action (HALT:
  client-facing write). Log the brief, the pipeline used and the cost in `memory.md` via `bin/brain remember`.
- Never put a client's name, address or photo into a video without Steven's written yes (HALT: PII).
