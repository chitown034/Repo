> Vendored from https://github.com/HKUDS/CLI-Anything/tree/main/browser/agent-harness — fetched 2026-09-22 by P1
> at upstream commit 34f519533bc175d2fe287ab8316b0dd99bb9cc43; the tree below is unmodified (`diff -r` against
> the upstream checkout is empty, excluding `build/` and `*.egg-info/`, which are build output and were not copied).
> License: Apache License 2.0 (upstream `LICENSE`, verified 2026-09-22) — the full text is kept beside this file
> as `LICENSE`. Upstream ships no `NOTICE` file, so there is none to carry.
> Added by this repo, alongside the unmodified tree: this file, `LICENSE`, and `.gitignore`. Nothing upstream was edited.

# cli-anything-browser — vendored DOMShell harness

This is the browser harness the site harnesses run on. `homes`, `showingtime` and `showami` declare
`cli-anything-browser>=1.0.0` and `import cli_anything.browser.core` at module level; that distribution is
**not on PyPI**, so before this was vendored those three could not be installed or tested from this repo at all.
Installing this directory first makes all seven site harnesses install and test standalone.

    pip install integrations/cli-anything-harnesses/browser/agent-harness
    pip install integrations/cli-anything-harnesses/homes/agent-harness      # and the other six

`MAC-SETUP.sh --only cli-anything-harnesses` does exactly that, into `~/Applications/cli-anything-harnesses/.venv`.

## PEP 420

`cli_anything/` is a namespace portion and has **no `__init__.py`**. Eight distributions
(`browser` + the seven sites) install into the one `cli_anything/` namespace and must keep coexisting;
adding `cli_anything/__init__.py` to any of them would hide the other seven. `setup.py` uses
`find_namespace_packages(include=["cli_anything.*"])` for this reason.

## Licence note (upstream inconsistency, not ours)

Upstream's `setup.py` sets `license="MIT"` and an OSI MIT classifier, but the repository `LICENSE` file,
the root `README.md` and this harness's own `cli_anything/browser/README.md` all say Apache License 2.0.
We treat **Apache 2.0** as governing — it is what the actual `LICENSE` file contains — and comply with it.
The `setup.py` string is left as upstream wrote it, because the tree here is unmodified.

## Security posture — read before enabling this on the Mac

Reviewed line by line 2026-09-22 (P1). Full detail in `docs/findings/findings-P1.json`.

- No telemetry, no analytics, no HTTP client. Nothing in this harness phones home.
- It spawns `npx -p @apireno/domshell domshell-proxy`, **unpinned** — npx resolves and executes whatever
  version the npm registry serves at call time, downloading it on first run. That is a live supply-chain
  surface and it is not this repo's code.
- `DOMSHELL_TOKEN` is passed as an argv element, so it is visible in `ps` output to any local process.
- `sanitize_dom_text()` — the prompt-injection guard — is **never called by production code**; only the tests
  exercise it. DOM text reaches the agent unfiltered.
- SSRF blocking is **off by default**. Set `CLI_ANYTHING_BROWSER_BLOCK_PRIVATE=true` to refuse
  localhost/RFC-1918/link-local targets. It is read at import time, so it must be set before the process starts.
- It has an `act` group (`act click`, `act type`) — a real write surface. The seven site harnesses deliberately
  have none. This engine must never be pointed at a client-facing system by hand.
- The REPL creates `~/.cli-anything-browser/` and writes plaintext command history there. Browser-automation
  commands carry URLs; on a machine holding client files, treat that history as client data.
