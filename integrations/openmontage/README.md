# OpenMontage — the video studio (installed 2026-10-12)

**What it is.** calesthio/OpenMontage, "the first open-source, agentic video production system." There is no
orchestrator process: the AI coding assistant (Claude Code on the Mac) reads a pipeline manifest (YAML), a
stage-director skill (Markdown) and calls 100+ Python tools to research the topic, write and narrate the script,
pick royalty-free music, burn word-level subtitles and render with Remotion or FFmpeg, then self-reviews
(ffprobe, frame sampling, audio levels) before showing the result. Thirteen pipelines: animated explainer,
documentary montage, talking head, avatar spokesperson, screen demo, clip factory, podcast repurpose, localization
dub, cinematic, hybrid, animation, character animation, framework smoke.

**Review (2026-10-12, commit `e45f5b1`, 163 MB, AGPL-3.0).** No telemetry or analytics SDK, no install hooks,
no `curl | sh`; the Makefile only builds a venv, pip-installs `requirements.txt`, runs `npm install` for the
Remotion composer and copies `.env.example`. Every API key is optional; Piper TTS and FFmpeg give a fully offline
path. Decision: **INSTALL on the Mac** (not the cloud sandbox: it needs FFmpeg, Node 18+, Python 3.10+ and a
large npm tree). Owner: Sofia (CMO) for use, Derek (CTO) for the install, Elena (CISO) for the key rules.

**Install.** `bash integrations/openmontage/openmontage.sh install --apply` (also `go.sh` step 10). It clones to
`~/Applications/OpenMontage`, pins the reviewed commit, builds the venv, installs Remotion and Piper, and copies
`.env.example` to a `chmod 600` `.env`. `doctor` reports what is present without printing any value.

**Keys (HALT: credentials).** Steven types keys into `~/Applications/OpenMontage/.env` himself. Free tiers worth
adding first: Pexels and Pixabay (stock footage), Google (700+ TTS voices, 1M chars/month free), ElevenLabs
(10K chars/month). Paid video generation (fal, Kling, Runway, Atlas Cloud) spends money per render: a Needs-Steven
packet before any key is added, and a cost estimate before any paid render.

**How the AI team uses it.** Skill `.claude/skills/openmontage-video/SKILL.md`. Sofia drafts the brief (audience,
length, tone, call to action, the compliance line Alexandra requires on any mortgage or real-estate message),
Claude Code in the OpenMontage folder runs the pipeline, Steven approves every creative decision the pipeline
pauses on, and nothing is posted anywhere: the output is an MP4 in `OpenMontage/output/` for Steven to publish.

**Where it fits.** Marketing videos for LPT Realty and Patriot Pacific Financial (VA-loan explainers, listing
montages, market updates), training clips for the ISA, and the "AI twin" voice/video lane on the Next Big Moves
panel. It replaces nothing already installed; Canva stays for stills.

**AGPL note.** Running it for your own videos is fine. Do not host a modified copy for other people without
publishing the source.
