# Vibe-coding learning shelf — awesome-vibe-coding and Easy-Vibe (recorded 2026-10-12)

Two reading resources Steven asked to install on 2026-10-12. Neither is a tool; both are registers of knowledge, so
they live here as pointers (the references rule: a register, not a library) and the engineers cite them by section.

## awesome-vibe-coding (awesome-vibe-coding/awesome-vibe-coding, CC0, commit 46d0f0d, 2026-08-13)
A curated list plus a Hugo site: web builders (Bolt, Lovable, v0), editors and IDEs, CLI tools, task management,
monitoring and cost tracking, and three parts worth the engineers' time:
- `content/dictionary/` — 27 one-page definitions (agent skill, agentic loop, context rot, context window, diff review,
  git worktree, headless mode, MCP, plan mode, prompt caching, prompt injection, repo map, RAG, sandboxing, subagent,
  tool use). The brain's encyclopedia uses the same vocabulary; cite the dictionary page when a term is new to Steven.
- `content/skills/` — 70 packaged skills (Anthropic's open skill standard, AWS skills, brand guidelines, canvas design,
  artifacts builder). Any pick goes through `integrations/skill-packs/` vetting first; nothing here is auto-installed.
- `content/mcp-servers/` and `content/tools/` — the comparison shelf for Nadia's tooling calls.
Read online: https://github.com/awesome-vibe-coding/awesome-vibe-coding (clone is 1.7 MB, safe to pull on the Mac).

## Easy-Vibe (datawhalechina/easy-vibe, CC BY-NC-SA 4.0, commit 130e9b7, 2026-08-25)
A ten-language curriculum "from first idea to real product", four stages: I beginner (AI tools, finding ideas,
prototypes, integrating AI, a complete project; appendices on product thinking, user research — Double Diamond, Jobs
to Be Done, the Mom Test — and common errors); II junior/mid developer (frontend: Figma/MasterGo, UI design, component
libraries, design-to-code; backend: databases, deployment); III senior (cross-platform: mini-programs, Android, MCP);
plus "vibe stories". 1.1 GB with images, so it is read online, not cloned: https://datawhalechina.github.io/easy-vibe/welcome.html
(English path `/en/`). Non-commercial license: fine for Steven's own learning and for the team's internal study plan;
not for resale or client training material.

## How the team uses them
- Steven's own study order: Easy-Vibe stage I → the awesome dictionary → Easy-Vibe stage II backend, alongside
  `references/backend-folder-structure.md`.
- Engineers (Derek's and Elon's seats) cite the dictionary for definitions and the Easy-Vibe appendix "What to do if
  you encounter errors" in debugging packets; the code-validation gate (`.claude/skills/code-validation-gate`) is
  what turns "it works" into evidence.
