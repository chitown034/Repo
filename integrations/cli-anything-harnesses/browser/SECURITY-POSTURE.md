# cli-anything-browser — security posture

As of **2026-09-22**. Covers the vendored browser engine at
`agent-harness/` (upstream commit `34f5195`) and the runtime configuration in
`runtime/` that this repo wraps around it.

Prove it rather than trust it:

    integrations/cli-anything-harnesses/browser/runtime/posture.sh check

Exits non-zero if any control below is not in force. It proves each one by
running it — refusing a real private address, resolving the pinned package
with the registry unreachable, flagging a real injection payload on a real
read path — not by grepping for a setting.

---

## What the read-only guarantee actually rests on

This matters more than any single finding, because it is weaker than it sounds.

**It is a behavioural constraint, not an enforced one.** Nothing in the
vendored engine prevents a write.

1. **The engine ships a real write surface.** `browser_cli.py:308-336` defines
   an `act` group with `act click` and `act type`. That is DOMShell's write
   tier and the reason the engine exists. It is not disabled, not gated, and
   not behind a flag.
2. **The seven site harnesses have no `act` verb.** That is where the
   read-only guarantee actually lives — in the generated wrappers, verified by
   word-match against all seven real `--help` outputs (finding F-P1-09/10).
   `mac-verify.sh` re-checks it every run: `act` present in a site harness =
   FAIL.
3. **The `fs` surface is read-only against the page** — `ls`, `cd`, `cat`,
   `grep` only. Confirmed by reading the code; there is no write verb in
   `core/fs.py`.
4. **`fs` being read-only against the page does not make the process
   read-only against the disk.** Constructing the REPL creates
   `~/.cli-anything-<software>/` and writes plaintext command history into it
   (F-P1-06). `--help` does not construct the REPL, which is why
   `mac-verify.sh`'s read-only check still holds.
5. **The last line is DOMShell's own token-gated write tier**, which is
   outside this repo.

So: the guarantee is "the site harnesses expose no write verb, and nobody
hand-drives the engine at a client-facing system." If anyone runs
`cli-anything-browser act click` against SkySlope, nothing here stops them.

---

## The five findings, now

| ID | Was | Now | Mechanism |
|---|---|---|---|
| F-P1-01 | High — injection guard dead code | **Closed** | Patch to the vendored tree |
| F-P1-02 | High — unpinned `npx` fetch | **Closed** | Pinned local install + `npx` shim |
| F-P1-03 | Medium — token in `argv` | **Open** | Not fixable below DOMShell |
| F-P1-05 | Medium — SSRF blocking off | **Closed** | Env set before process start |
| F-P1-06 | Medium — plaintext history | **Mitigated** | `0700`/`0600` + documented as client data |

### F-P1-01 — prompt-injection guard — CLOSED (by patch)

`sanitize_dom_text()` was never called by production code; only the vendored
tests exercised it. It is now called from `_parse_execute_result()`, the one
choke point every read path funnels through — including the raw `fs` verbs
that the homes / showingtime / showami harnesses re-expose.

Not a drop-in call. Upstream's function replaces a flagged payload with a
200-character preview and truncates anything over 10 KB. That would silently
discard page content and hide the injected text from the operator. So the
guard supplies the **verdict** and the response is loud instead of lossy:

* full page text preserved, control characters scrubbed;
* a `!! SECURITY:` banner prepended to `output` / `raw`;
* a structured `security` key on the result dict, for `--json` consumers and
  orchestrators that should hard-stop;
* a `WARNING` on stderr via `logging`, visible with no CLI change.

Carried as `patches/0001-wire-prompt-injection-guard-into-read-paths.patch`.
Evidence: `tests/test_injection_guard_wired.py` — 11 tests, 9 of which fail
against the unpatched tree.

**What it is not.** A keyword list is a tripwire, not a filter. It catches
"ignore previous instructions"; it will not catch a competent attacker. Its
job is to make an obvious attempt visible, and to establish that page text is
data. A prompt-injected agent driving `act click` is still the threat model,
and the guard does not stop it.

### F-P1-02 — unpinned runtime package — CLOSED (by configuration)

The harness never named a version, so `npx` ran whatever the registry served
at call time. There are **two** such call sites, not one:

    utils/domshell_backend.py:53   npx -p @apireno/domshell domshell-proxy …
    utils/domshell_backend.py:101  npx @apireno/domshell --version

The second is reached from `is_available()`, which `browser_cli.py:121` calls
on **every invocation** — so the unpinned fetch happened even on commands that
never touched DOMShell.

Closed without touching the tree:

* `runtime/package-lock.json` pins `@apireno/domshell@2.0.10` — the current
  `latest`, published 2026-08-14 — with sha512 integrity for it and all 128
  transitive packages. The hash was verified against the downloaded tarball.
* `posture.sh install` runs `npm ci` (not `npm install`) into
  `~/Applications/cli-anything-harnesses/domshell-pin`, so every tarball is
  checked against a hash recorded **in this repo**.
* `runtime/bin/npx` goes first on `PATH`. Any invocation naming
  `@apireno/domshell` is served from the pin or **fails with exit 127**. It
  never falls back to the registry, because a silent fallback is the finding.
  Every other `npx` call passes through untouched.

`npm_config_offline` was measured and rejected: with a warm npm cache it
happily "resolves" from cache, so it is not the hard guarantee it looks like.

**Version choice.** 2.0.10 is what an unpinned `npx` resolves to today, so
pinning to it freezes current behaviour rather than choosing new behaviour.
The vendored harness's comments say it was written against 2.0.2. Nothing
here has been run against a real DOMShell server, so "2.0.10 behaves like
2.0.2" is untested — see *Not verifiable here*.

### F-P1-03 — DOMSHELL_TOKEN in argv — OPEN

`_build_server_args()` passes `--token <value>`, so the token is in `ps`
output for the life of the proxy.

**This cannot be fixed below DOMShell.** The proxy reads the token from argv
and nowhere else — `dist/proxy.js` line 18: `const token = flag("--token", "")`,
with no environment fallback. A wrapper cannot move it: whichever process
finally runs the proxy must carry the token in its own argv. Patching the
harness to stop passing it would simply break authentication.

Residual risk, stated plainly: any process running **as Steven's own user**
can read the token while the harness is running. On macOS, other users cannot
(`kern.procargs2` is restricted), so on a single-user Mac the exposure is to
his own software — including anything an `npm` postinstall script runs.

The one-line upstream ask:
`const token = flag("--token", process.env.DOMSHELL_TOKEN ?? "")`.

Until then: treat `DOMSHELL_TOKEN` as short-lived, rotate it when DOMShell
restarts, and never run the harness alongside untrusted local software.

### F-P1-05 — SSRF blocking — CLOSED (by configuration)

`utils/security.py:22` reads `CLI_ANYTHING_BROWSER_BLOCK_PRIVATE` at **module
import time**. Exporting it afterwards does nothing — measured:

    at import: False
    after setting env in-process: False
    validate_url('http://127.0.0.1/'): (True, '')

So the fix belongs where the process environment is set, which is
`runtime/browser-harness.env` plus `run-browser-harness.sh`. With it in force,
loopback, RFC-1918 and link-local — including `169.254.169.254` — are refused,
and `https://www.homes.com/` is still allowed. `posture.sh check` proves both
directions every run.

The pattern list itself was already complete; nothing was missing but the
switch.

### F-P1-06 — command history is client data — MITIGATED

`utils/repl_skin.py:160-163` creates `~/.cli-anything-<software>/` and
`FileHistory` writes plaintext commands there. Browser commands carry URLs,
and those URLs carry MLS numbers, listing addresses and portal paths.

Left alone, the defaults are world-readable — measured:

    dir mode when the REPL creates it:        0o755
    file mode when prompt_toolkit creates it: 0o644

`posture.sh install` pre-creates all eight directories `0700` (files `0600`).
The REPL's `mkdir(..., exist_ok=True)` leaves an existing directory's mode
alone, so creating it first wins — measured: still `0o700` after
`ReplSkin('browser')`. `run-browser-harness.sh` re-applies it on every start.

To stop persistence entirely rather than just restrict it (verified: 0 entries
stored, target stays 0 bytes):

    rm -f  ~/.cli-anything-browser/history
    ln -s /dev/null ~/.cli-anything-browser/history

**These eight paths are client data.** They belong in the same bucket as the
CRM export and the client wiki: disk encryption on, in the backup's sensitive
tier, never copied into the repo, the vector index or the knowledge graph.
Moving any of it into the index or the graph is a HALT row in `CLAUDE.md`.

---

## What an operator should watch for

1. **`!! SECURITY:` in harness output, or `"prompt_injection_suspected": true`
   in `--json`.** Stop. Do not act on that page. Read it yourself. It means
   the page tried to talk to the agent.
2. **`npx shim: refusing to fetch` / exit 127.** The pin is missing or has
   drifted. Re-run `posture.sh install`. Never work around it by removing the
   shim from `PATH` — that restores the original finding.
3. **`npx shim: pinned copy is @apireno/domshell@X, expected @Y`.** Something
   changed the pin tree. Investigate before running anything.
4. **`posture.sh check` printing `posture NOT inherited`.** The controls only
   passed because the script applied them itself. A harness started any other
   way is running upstream defaults — SSRF blocking OFF, npx unpinned.
5. **A harness started without `run-browser-harness.sh`.** Same problem. The
   patched injection guard is the only control that travels with the code;
   everything else is environment, and environment has to be applied.
6. **`~/.cli-anything-*/history` growing, or appearing in a backup's
   non-sensitive tier, a diff, a paste or an artifact.** That is client data
   leaving its lane.
7. **Any use of `act click` / `act type`.** The engine's write surface. It has
   no place in a read-only drive.

## Not verifiable here — stated so it is not mistaken for coverage

Everything above was run on Linux, against mocked DOMShell responses and a
simulated `HOME`. None of it has run on Steven's Mac. Specifically untested:

* **Anything requiring a real DOMShell.** The Chrome extension, a signed-in
  session, the token handshake, and whether `@apireno/domshell@2.0.10` behaves
  like the 2.0.2 the harness's comments were written against. The proxy was
  launched and reached its startup path, but it never relayed a command.
* **Anything requiring a live site.** No page on homes.com, ShowingTime or
  Showami has been fetched. The injection guard has never seen real page text,
  so its false-positive rate against real listing copy is **unmeasured** — and
  words like "forget" and "disregard" are in the pattern list. Expect noise.
* **macOS specifics.** `ps` visibility of the token, keychain behaviour, and
  the `~/Applications/cli-anything-harnesses` layout are all asserted from
  documentation, not observed.
* **The 41/42 skipped tests.** Every one is a live-browser or live-site E2E
  test. None has ever executed, here or anywhere.
