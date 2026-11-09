# AI Engineering from Scratch — learning curriculum

Installed 2026-11-09 at Steven's request ("install https://github.com/rohitg00/ai-engineering-from-scratch.git").
It's an open curriculum (MIT) by rohitg00: 542 lessons in 20 phases. It runs from setup and math foundations through
transformers, RAG and retrieval, agents and MCP servers, evaluation, and Claude certification tracks. Each lesson has an
explainer, code with tests, a quiz, and a reusable output (skill, prompt, agent or MCP server). It's also on the web at
https://aiengineeringfromscratch.com.

**Install on the Mac (one paste):**
```
cd ~/Repo && git pull -q && bash integrations/ai-engineering-from-scratch/install.sh
```
It lands at `~/Learning/ai-engineering-from-scratch` (about 250 MB). Add `--python` to also build the lab environment.
That pulls PyTorch, Transformers and friends, several GB, and is only needed to run the coding labs.

**How the team uses it:**
- It's a **reference**, not a store: registered in `references/index.md`. It is never indexed into the brain, the vector
  index or the knowledge graph.
- Derek (CTO) and Nadia (CAIO) may cite a lesson when proposing how an agent, RAG pipeline or eval should be built.
- A lesson's `outputs/` skill or agent is **not** installed automatically. Adopting one is a proposal that goes through
  the code-validation gate like any other code.
- The Claude certification track (`certifications/claude/`) is the useful starting point for Steven.
