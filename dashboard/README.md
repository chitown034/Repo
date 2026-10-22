# dashboard/

What is here, and what deliberately is not.

| Path | What it is |
| --- | --- |
| `panel-orchestration.html` / `.js` | Source of the Orchestration & Loop panel spliced into the Command Deck |
| `isa/isa-portal.html` | Full ISA Portal source. Its `cdStateSeed` is `{}` and its client tables seed empty by design |
| `tests/` | The two gates every change passes before publishing |

## The Command Deck's own HTML is not in this repository, on purpose

`command-deck.html` carries a `cdStateSeed` block holding Steven's real account
balances, property addresses, loyalty-membership numbers and licence details.
Committing it here would publish personal financial data to a Git host. The deck
is versioned where it lives, as artifact versions, and its database is backed up
weekly into the artifact's own `backups` collection, which has the same access
control as the data itself.

The ISA Portal is a different case and is safe to keep here: its seed is empty
and its client tables are deliberately seeded empty, because "a client name
shipped inside published HTML is a disclosure, not a placeholder."

## The two gates

`tests/quickcheck.py <file>` is the static gate: one inline script, `node --check`
on it, seed JSON parses, no duplicate ids, balanced tags, every panel titled. It
has three known false positives on the ISA Portal that are present at the base
commit too, so compare against the base rather than reading a red as a regression.

`tests/runtime-harness.js <file>` is the real gate. It executes the whole inline
script under a pure-Node DOM shim and reports exceptions, render failures, shape
warnings, which container ids received content, which `$()` lookups found
nothing, and per-render duration. A static check cannot see a function that is
called but no longer defined, which is the bug class that once blanked half the
dashboard while `node --check` passed.

`tests/stress-sweep.js` runs both across volume, malformed-document, failure
injection, concurrency and backup-restore scenarios.

### A test that asserts its own conclusion is worse than no test

On 2026-09-22 three rows in the sweep were red by construction rather than by
measurement, and stayed red after the defects they described were fixed:

- the two local-persistence cases fired on the injection alone and never asked
  whether the save failure was surfaced;
- the ISA-line case counted survivors as rows still lacking an id, which the
  derived-id fix makes impossible;
- the restore case modelled the old rule that skipped a document with no `v`
  wrapper, which the reader no longer does.

All three now measure the thing they claim. That alone moved the sweep from
53 pass / 9 degraded to 55 / 7 with no further change to the dashboard. When a
row's verdict does not move after a fix, suspect the test before the fix.
