#!/usr/bin/env python3
"""cli-anything-publicfeeds — read-only recipes for public real-estate and
lender research pages, gated per category on a terms-of-service review.

Usage:
    cli-anything-publicfeeds --json recipes                    # what can be read, and each group's gate state
    cli-anything-publicfeeds --json gate status                # the three policy gates (offline)
    cli-anything-publicfeeds --json recipe <name> [--url U]    # one recipe -> JSON (gated)
    cli-anything-publicfeeds --json recipe <name> --discover   # dump the live tree to fix paths.json (gated)
    cli-anything-publicfeeds                                   # interactive REPL

Nothing here can click or type, and there is no `fs`/`page` group either —
narrower than cli-anything-homes on purpose: every live-touching command here
is exactly one named recipe against one known page, so the gate can be
checked before anything is opened. Clicking and typing are the whole write
surface of cli-anything-browser and this package does not import them.

Every recipe additionally refuses to run (exit 3, disabled-by-policy) until
its policy group's terms-of-service question has a review date. Run
`gate status` to see which of the three groups (marketpages, lenderrates,
builderpages) are open.
"""

from __future__ import annotations

import json
import os
import shlex
import sys
from typing import Any, Optional

import click

from cli_anything.publicfeeds import CLI_NAME, SITE, SITE_TITLE, __version__
from cli_anything.publicfeeds.core import paths as paths_mod
from cli_anything.publicfeeds.core import policy
from cli_anything.publicfeeds.core import recipes as recipes_mod
from cli_anything.publicfeeds.core import target
from cli_anything.publicfeeds.core.auth import AuthError
from cli_anything.publicfeeds.core.recipes import RecipeError
from cli_anything.publicfeeds.core.tree import LiveTree, TreeError
from cli_anything.publicfeeds.utils.security import URLRejected, require_site_url

# Exit codes (documented in PUBLICFEEDS.md). Policy gate is 3, matching
# cli-anything-skyslope's POLICY_EXIT_CODE, so an orchestrator that already
# knows "3 == disabled-by-policy" from that package reads this one the same
# way. path_map_error and url_rejected are shifted up one slot each versus
# cli-anything-homes to make room for it.
EXIT_OK = 0
EXIT_RUNTIME = 1
EXIT_AUTH = 2
EXIT_POLICY_GATE = policy.POLICY_EXIT_CODE  # 3
EXIT_PATH_MAP = 4
EXIT_URL_REJECTED = 5

# ── module state ─────────────────────────────────────────────────────
_json_output = False
_repl_mode = False
_source: Optional[LiveTree] = None
_PATH_MAP: dict = {}
_PATH_MAP_SOURCE: str = ""
_PATH_MAP_WARNING: str = ""


def _load_map_at_import() -> None:
    global _PATH_MAP, _PATH_MAP_SOURCE, _PATH_MAP_WARNING
    try:
        _PATH_MAP, _PATH_MAP_SOURCE = paths_mod.load_path_map()
    except Exception as e:  # malformed override -> fall back, but say so loudly
        _PATH_MAP_WARNING = f"effective path map unusable ({e}); using the packaged default"
        _PATH_MAP = paths_mod.load_default_path_map()
        _PATH_MAP_SOURCE = str(paths_mod.PACKAGED_PATH)


_load_map_at_import()


class DependencyError(RuntimeError):
    pass


class PolicyGateError(RuntimeError):
    def __init__(self, gate_status: policy.GateStatus) -> None:
        super().__init__(gate_status.reason)
        self.gate_status = gate_status


def _live_source() -> LiveTree:
    """The single seam to Chrome. Tests replace this with a FixtureTree."""
    global _source
    if _source is None:
        ok, msg = LiveTree.check_available()
        if not ok:
            raise DependencyError(
                f"{msg}\nInstall Node.js, then the DOMShell Chrome extension "
                f"(https://chromewebstore.google.com/detail/domshell), and export DOMSHELL_TOKEN."
            )
        if not os.environ.get("DOMSHELL_TOKEN", "").strip():
            raise DependencyError(
                "DOMSHELL_TOKEN is not set. Export the auth token DOMShell prints at startup "
                "(and DOMSHELL_PORT if the MCP port is not 3001), then re-run."
            )
        _source = LiveTree(_PATH_MAP.get("hosts", []))
    return _source


def _recipe_policy_group(name: str) -> str:
    cfg = (_PATH_MAP.get("recipes") or {}).get(name) or {}
    group = cfg.get("policy_group")
    if not group:
        raise RuntimeError(f"recipe '{name}' has no policy_group in paths.json — refusing to run ungated")
    return group


def _check_gate_or_raise(name: str) -> policy.GateStatus:
    gs = policy.check_gate(_recipe_policy_group(name))
    if not gs.ok:
        raise PolicyGateError(gs)
    return gs


# ── output helpers ───────────────────────────────────────────────────
def output(data: Any, message: str = "") -> None:
    if _json_output:
        click.echo(json.dumps(data, indent=2, default=str))
        return
    if message:
        click.echo(message)
    if isinstance(data, dict):
        _print_dict(data)
    elif isinstance(data, list):
        _print_list(data)
    else:
        click.echo(str(data))


def _print_dict(d: dict, indent: int = 0) -> None:
    prefix = "  " * indent
    for k, v in d.items():
        if isinstance(v, dict):
            click.echo(f"{prefix}{k}:")
            _print_dict(v, indent + 1)
        elif isinstance(v, list):
            click.echo(f"{prefix}{k}:")
            _print_list(v, indent + 1)
        else:
            click.echo(f"{prefix}{k}: {v}")


def _print_list(items: list, indent: int = 0) -> None:
    prefix = "  " * indent
    for i, item in enumerate(items):
        if isinstance(item, dict):
            click.echo(f"{prefix}[{i}]")
            _print_dict(item, indent + 1)
        else:
            click.echo(f"{prefix}- {item}")


def _print_rows(rows: list[dict]) -> None:
    if not rows:
        click.echo("(no rows)")
        return
    cols = [c for c in rows[0].keys() if c != "_path"]
    widths = {c: max(len(c), *(len(str(r.get(c) or "")) for r in rows)) for c in cols}
    widths = {c: min(w, 40) for c, w in widths.items()}
    click.echo("  ".join(c.ljust(widths[c]) for c in cols))
    click.echo("  ".join("─" * widths[c] for c in cols))
    for r in rows:
        click.echo("  ".join(str(r.get(c) or "")[: widths[c]].ljust(widths[c]) for c in cols))


def _emit_error(err: Exception, etype: str, code: int, hint: str = "", extra: Optional[dict] = None) -> None:
    payload = {"error": str(err), "type": etype}
    if hint:
        payload["hint"] = hint
    if extra:
        payload.update(extra)
    if _json_output:
        click.echo(json.dumps(payload, indent=2))
    else:
        click.echo(f"Error ({etype}): {err}", err=True)
        if hint:
            click.echo(f"Hint: {hint}", err=True)
    if not _repl_mode:
        sys.exit(code)


def handle_error(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except PolicyGateError as e:
            _emit_error(e, "policy_gate", EXIT_POLICY_GATE, e.gate_status.fix, e.gate_status.as_dict())
        except URLRejected as e:
            _emit_error(e, "url_rejected", EXIT_URL_REJECTED)
        except AuthError as e:
            _emit_error(e, "auth_error", EXIT_AUTH, getattr(e, "hint", ""))
        except RecipeError as e:
            code = EXIT_PATH_MAP if e.kind == "path_map_error" else EXIT_RUNTIME
            _emit_error(e, e.kind, code, getattr(e, "hint", ""))
        except DependencyError as e:
            _emit_error(e, "dependency_error", EXIT_RUNTIME)
        except TreeError as e:
            _emit_error(e, "tree_error", EXIT_RUNTIME)
        except (RuntimeError, ValueError, IndexError, FileNotFoundError) as e:
            _emit_error(e, type(e).__name__, EXIT_RUNTIME)
    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__
    return wrapper


# ── main group ───────────────────────────────────────────────────────
@click.group(invoke_without_command=True)
@click.option("--json", "use_json", is_flag=True, help="Output as JSON (agents: always pass this)")
@click.version_option(__version__, prog_name=CLI_NAME)
@click.pass_context
def cli(ctx, use_json):
    """Public real-estate & lender research pages — read-only, per-group gated.

    Three unrelated page categories, one CLI: Redfin market pages
    (marketpages), lender-advertised-rate pages (lenderrates), builder
    incentive pages (builderpages). Each has its own
    CLI_ANYTHING_TOS_REVIEWED_<GROUP> gate — see `gate status`. Nothing here
    can click or type, and there is no raw `fs`/`page` group either; the only
    live-touching command is `recipe <name>`, always through the gate.
    """
    global _json_output
    _json_output = use_json
    if _PATH_MAP_WARNING and not _repl_mode:
        click.echo(f"Warning: {_PATH_MAP_WARNING}", err=True)
    if ctx.invoked_subcommand is None:
        ctx.invoke(repl)


# ── gate (offline) ──────────────────────────────────────────────────
@cli.group("gate")
def gate_group():
    """Terms-of-service review gates, one per policy group (offline)."""


@gate_group.command("status")
@handle_error
def gate_status():
    """Show all three gates and why each is open or blocked."""
    gates = {g: gs.as_dict() for g, gs in policy.all_gates().items()}
    if _json_output:
        output(gates)
        return
    for g, gs in gates.items():
        click.echo(f"{g}: {gs['connState']} — {gs['reason']}")


# ── recipes ──────────────────────────────────────────────────────────
@cli.command("recipes")
@handle_error
def recipes_list():
    """List the read recipes in the effective path map, with each one's gate state."""
    items = recipes_mod.list_recipes(_PATH_MAP)
    gates = policy.all_gates()
    for it in items:
        name = it["name"]
        group = (_PATH_MAP["recipes"].get(name) or {}).get("policy_group", "")
        it["policyGroup"] = group
        it["gateOpen"] = bool(gates.get(group) and gates[group].ok)
    if _json_output:
        output({"site": SITE, "path_map": _PATH_MAP_SOURCE, "recipes": items})
        return
    click.echo(f"{SITE_TITLE} recipes (path map: {_PATH_MAP_SOURCE})")
    for it in items:
        flags = []
        if it["url_required"]:
            flags.append("--url required")
        flags.append("verified" if it["verified"] else "UNVERIFIED path map")
        flags.append("gate open" if it["gateOpen"] else f"disabled-by-policy ({it['policyGroup']})")
        click.echo(f"  {it['name']:<32} {it['kind']:<7} {it['description']}  [{', '.join(flags)}]")


@cli.group("recipe")
def recipe():
    """Run one named read recipe (rows/record as JSON with --json). Gated per policy group."""


def _make_recipe_command(name: str, cfg: dict):
    @recipe.command(name, help=cfg.get("description", name) + (
        "" if cfg.get("verified") else "  [path map UNVERIFIED until first live run]"))
    @click.option("--url", "url", default=None, help="Page to read (must be on this package's allow-listed hosts, https)")
    @click.option("--match", "match", default=None, help="Keep only rows containing this text (case-insensitive)")
    @click.option("--max-rows", "max_rows", default=50, show_default=True, help="Upper bound on rows read")
    @click.option("--discover", "do_discover", is_flag=True, help="Dump the live tree instead of running the recipe")
    @click.option("--depth", "depth", default=3, show_default=True, help="Tree depth for --discover")
    @click.option("--text", "with_text", is_flag=True, help="Include each node's text in --discover output (slower)")
    @handle_error
    def _cmd(url, match, max_rows, do_discover, depth, with_text):
        gs = _check_gate_or_raise(name)  # gate first: no subprocess for a disabled-by-policy recipe
        src = _live_source()
        with src:
            if do_discover:
                result = recipes_mod.discover(
                    src, _PATH_MAP, name, url=url, depth=depth, with_text=with_text,
                    override_path=str(paths_mod.override_location()),
                )
                result["policyGate"] = gs.as_dict()
                output(result, f"Discovered tree for {name} at {result.get('url')}")
                return
            result = recipes_mod.run_recipe(
                src, _PATH_MAP, name, url=url, match=match, max_rows=max_rows,
                path_map_source=_PATH_MAP_SOURCE,
            )
        if getattr(src, "warnings", None):
            result.setdefault("warnings", []).extend(src.warnings)
        result["policyGate"] = gs.as_dict()
        if _json_output:
            output(result)
            return
        click.echo(f"{SITE_TITLE} · {name} · {result.get('url')} · {result.get('fetched_at')} · auth: {result.get('auth_state')}")
        if not result["path_map"]["verified"]:
            click.echo("  (path map UNVERIFIED — spot-check these values against the page)")
        if result.get("kind") == "record":
            _print_dict(result.get("record", {}), 1)
        else:
            _print_rows(result.get("rows", []))
            click.echo(f"{result.get('count', 0)} row(s)")
        for w in result.get("warnings", []):
            click.echo(f"  warning: {w}", err=True)

    _cmd.__name__ = f"recipe_{name.replace('-', '_')}"
    return _cmd


for _name, _cfg in (_PATH_MAP.get("recipes") or {}).items():
    _make_recipe_command(_name, _cfg)


# ── paths (the editable map, offline) ──────────────────────────────────
@cli.group("paths")
def paths_group():
    """Inspect or initialise the editable path map (a local file; never touches a site)."""


@paths_group.command("show")
@handle_error
def paths_show():
    """Print the effective path map and where it was loaded from."""
    data = {"source": _PATH_MAP_SOURCE, "warning": _PATH_MAP_WARNING or None,
            "override_location": str(paths_mod.override_location()), "map": _PATH_MAP}
    output(data)


@paths_group.command("where")
@handle_error
def paths_where():
    """Print the resolution order and which file is in use."""
    cands = [str(p) for p in paths_mod.candidate_locations()]
    output({"in_use": _PATH_MAP_SOURCE, "resolution_order": cands,
            "env_var": paths_mod.ENV_VAR})


@paths_group.command("init")
@click.option("--force", is_flag=True, help="Overwrite an existing copy")
@handle_error
def paths_init(force):
    """Copy the packaged default map to ~/.config/cli-anything/publicfeeds-paths.json for editing."""
    dest, written = paths_mod.init_override(force=force)
    output({"path": str(dest), "written": written},
           f"{'Wrote' if written else 'Already exists (use --force to overwrite)'}: {dest}")


# ── REPL ─────────────────────────────────────────────────────────────
@cli.command()
@handle_error
def repl():
    """Start the interactive REPL session."""
    from cli_anything.publicfeeds.utils.repl_skin import ReplSkin

    global _repl_mode
    _repl_mode = True

    skin = ReplSkin(SITE, version=__version__)
    skin.skill_install_cmd = (
        "uv pip install --python ~/Applications/cli-anything-harnesses/.venv/bin/python "
        f"<repo>/integrations/cli-anything-harnesses/{SITE}/agent-harness  (PUBLICFEEDS.md)"
    )
    skin.global_skill_path = skin.skill_path or skin.global_skill_path
    skin.print_banner()
    pt_session = skin.create_prompt_session()

    recipe_names = "|".join((_PATH_MAP.get("recipes") or {}).keys())
    _repl_commands = {
        "recipes":  "List read recipes and their gate state",
        "recipe":   f"{recipe_names} [--url U] [--match T] [--discover]",
        "gate":     "status",
        "paths":    "show|where|init",
        "help":     "Show this help",
        "quit":     "Exit REPL",
    }

    while True:
        try:
            context = "/"
            if _source is not None:
                sess = _source.session
                context = sess.working_dir or "/"
                if sess.current_url:
                    u = sess.current_url
                    context = f"{u[:40] + '...' if len(u) > 40 else u} {context}"
            line = skin.get_input(pt_session, context=context)
            if not line:
                continue
            if line.lower() in ("quit", "exit", "q"):
                skin.print_goodbye()
                break
            if line.lower() == "help":
                skin.help(_repl_commands)
                continue
            try:
                args = shlex.split(line)
            except ValueError:
                args = line.split()
            if _json_output and "--json" not in args:
                args = ["--json"] + args
            try:
                cli.main(args, standalone_mode=False)
            except SystemExit:
                pass
            except click.exceptions.UsageError as e:
                skin.warning(f"Usage error: {e}")
            except Exception as e:
                skin.error(f"{e}")
        except (EOFError, KeyboardInterrupt):
            skin.print_goodbye()
            break

    _repl_mode = False


# ── entry point ──────────────────────────────────────────────────────
def main():
    cli()


if __name__ == "__main__":
    main()
