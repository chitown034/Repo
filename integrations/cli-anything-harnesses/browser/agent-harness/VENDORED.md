> Vendored from https://github.com/HKUDS/CLI-Anything/tree/main/browser/agent-harness — fetched 2026-09-22 by P1
> at upstream commit 34f519533bc175d2fe287ab8316b0dd99bb9cc43.
> License: Apache License 2.0 (upstream `LICENSE`, verified 2026-09-22) — the full text is kept beside this file
> as `LICENSE` (sha256 `0cff1a8a…c77760`). Upstream ships no `NOTICE` file, so there is none to carry.
> Added by this repo, alongside the vendored tree: this file, `LICENSE`, and `.gitignore`.
>
> **THE TREE IS NO LONGER UNMODIFIED.** Exactly one upstream file has been changed — see
> *Modification state* below. Everything else is byte-identical to commit 34f5195.

# cli-anything-browser — vendored DOMShell harness

This is the browser harness the site harnesses run on. `homes`, `showingtime` and `showami` declare
`cli-anything-browser>=1.0.0` and `import cli_anything.browser.core` at module level; that distribution is
**not on PyPI**, so before this was vendored those three could not be installed or tested from this repo at all.
Installing this directory first makes all seven site harnesses install and test standalone.

    pip install integrations/cli-anything-harnesses/browser/agent-harness
    pip install integrations/cli-anything-harnesses/homes/agent-harness      # and the other six

`MAC-SETUP.sh --only cli-anything-harnesses` does exactly that, into `~/Applications/cli-anything-harnesses/.venv`.

## Modification state

Changed on 2026-09-22 by Steven Shearrill's engineering team (Security Engineer seat), relative to
upstream commit 34f5195:

| File | Change | Carried as |
|---|---|---|
| `cli_anything/browser/utils/domshell_backend.py` | Finding **F-P1-01** — the prompt-injection guard was dead code. `_parse_execute_result()` now calls it on every read path. | `../patches/0001-wire-prompt-injection-guard-into-read-paths.patch` |

Nothing else was touched. Verified by directory diff against the as-vendored tree: exactly one file differs.

* upstream `domshell_backend.py` sha256 `61d3841fab0e39e67e94cc431fffa1b950f919082095de8c7490628bcb8ae2aa`
* modified  `domshell_backend.py` sha256 `9570d5bfb02f54af6a8cd4f9f3529ffea223df8d55b29ee2c392520e86b05e62`

**Apache 2.0 §4(b)** — the modified file carries a prominent "THIS FILE HAS BEEN MODIFIED FROM UPSTREAM"
notice at the top, naming who changed it, when, and what changed. That notice is part of the patch, so it
survives a re-apply.

### Re-syncing from upstream

    cd integrations/cli-anything-harnesses/browser/agent-harness
    # replace the tree with a fresh upstream checkout, then:
    patch -p1 < ../patches/0001-wire-prompt-injection-guard-into-read-paths.patch
    python -m pytest ../tests ./cli_anything/browser/tests

If the patch no longer applies, upstream has changed `_parse_execute_result`. Re-do the change by hand and
regenerate the patch — do **not** drop it and do not update this file to say the tree is clean again. The
five findings below are why it exists.

Every other fix for those findings is deliberately **outside** this tree, in `../runtime/`, so that re-sync
stays this cheap.

## PEP 420

`cli_anything/` is a namespace portion and has **no `__init__.py`**. Eight distributions
(`browser` + the seven sites) install into the one `cli_anything/` namespace and must keep coexisting;
adding `cli_anything/__init__.py` to any of them would hide the other seven. `setup.py` uses
`find_namespace_packages(include=["cli_anything.*"])` for this reason.

## Licence note (upstream inconsistency, not ours)

Upstream's `setup.py` sets `license="MIT"` and an OSI MIT classifier, but the repository `LICENSE` file,
the root `README.md` and this harness's own `cli_anything/browser/README.md` all say Apache License 2.0.
We treat **Apache 2.0** as governing — it is what the actual `LICENSE` file contains — and comply with it.
The `setup.py` string is left exactly as upstream wrote it: it is upstream's inconsistency to resolve, and
changing it would add a modified file for no security benefit.

## Security posture — read before enabling this on the Mac

Reviewed line by line 2026-09-22 (P1), then closed where it could be closed (P8). Full current detail in
`../SECURITY-POSTURE.md`; findings in `docs/findings/findings-P1.json` and `findings-P8.json`.

- No telemetry, no analytics, no HTTP client. Nothing in this harness phones home.
- **F-P1-01 CLOSED.** `sanitize_dom_text()` — the prompt-injection guard — was never called by production
  code. It is now called on every `fs ls` / `cat` / `grep` result. Flagged page text is banner-wrapped,
  logged as a WARNING and marked with a `security` key, and is **not** truncated: hiding the injected text
  from the operator would be worse than showing it. It is a tripwire for obvious attempts, not a filter.
- **F-P1-02 CLOSED, outside this tree.** It spawns `npx -p @apireno/domshell domshell-proxy` unpinned, and
  `is_available()` makes a second unpinned `npx` call on *every* invocation. Both are now served from a
  lockfile-pinned `@apireno/domshell@2.0.10` by `../runtime/bin/npx`, which refuses rather than falling
  back to the registry. Run `../runtime/posture.sh install` before first use.
- **F-P1-03 OPEN.** `DOMSHELL_TOKEN` is passed as an argv element, so it is visible in `ps` to any process
  running as the same user. Not fixable here: `domshell-proxy` reads the token from argv only, with no
  environment fallback. Upstream change required.
- **F-P1-05 CLOSED, outside this tree.** SSRF blocking is off by default and is read at **import time**.
  `../runtime/browser-harness.env` sets `CLI_ANYTHING_BROWSER_BLOCK_PRIVATE=true` and
  `../runtime/run-browser-harness.sh` applies it before the interpreter starts. Started any other way, the
  harness runs with blocking OFF.
- **F-P1-06 MITIGATED.** The REPL creates `~/.cli-anything-browser/` (measured: mode 0755) and writes
  plaintext command history into it (0644). Browser commands carry URLs; on a machine holding client files
  that history **is client data**. `posture.sh install` pre-creates all eight directories 0700 / 0600 and
  documents how to disable persistence entirely.
- It has an `act` group (`act click`, `act type`) — a real write surface. The seven site harnesses deliberately
  have none. This engine must never be pointed at a client-facing system by hand.
