#!/usr/bin/env python3
"""cli-anything-zipforms — read-only, ECC-gated DOMShell harness for zipForms.

Usage:
    cli-anything-zipforms gate status                       # offline: is the ECC gate open?
    cli-anything-zipforms verbs                             # offline: reads that exist, writes deliberately absent
    cli-anything-zipforms paths show|validate               # offline: the (unverified) path map
    cli-anything-zipforms --json recipe form-index          # gated, read-only
    cli-anything-zipforms --json recipe form-detail --id F-1
    cli-anything-zipforms discover --url https://www.zipformplus.com/
    cli-anything-zipforms                                   # REPL

Nothing here can click, type, upload, download, send or sign. The browser
harness's write group is not wrapped, not disabled — it is absent.
"""

from __future__ import annotations

import functools
import json
import shlex
import sys
from typing import Optional

import click

from cli_anything.zipforms import __version__
from cli_anything.zipforms.core import discover as discover_mod
from cli_anything.zipforms.core import paths as paths_mod
from cli_anything.zipforms.core import policy
from cli_anything.zipforms.core import recipes as recipes_mod
from cli_anything.zipforms.core import target
from cli_anything.zipforms.utils import zipforms_backend as backend

# Global state
_json_output = False
_repl_mode = False
_paths_override: Optional[str] = None
_availability_cached: Optional[tuple[bool, str]] = None


# ── Output helpers ───────────────────────────────────────────────
def output(data, message: str = ""):
    if _json_output:
        click.echo(json.dumps(data, indent=2, default=str))
    else:
        if message:
            click.echo(message)
        if isinstance(data, dict):
            _print_dict(data)
        elif isinstance(data, list):
            _print_list(data)
        else:
            click.echo(str(data))


def _print_dict(d: dict, indent: int = 0):
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


def _print_list(items: list, indent: int = 0):
    prefix = "  " * indent
    for i, item in enumerate(items):
        if isinstance(item, dict):
            click.echo(f"{prefix}[{i}]")
            _print_dict(item, indent + 1)
        else:
            click.echo(f"{prefix}- {item}")


def _fail(payload: dict, exit_code: int) -> None:
    """Print a structured failure and exit (one-shot) or return (REPL)."""
    if _json_output:
        click.echo(json.dumps(payload, indent=2, default=str))
    else:
        click.echo(f"Error: {payload.get('error')}", err=True)
        if payload.get("fix"):
            click.echo(f"Fix: {payload['fix']}", err=True)
    if not _repl_mode:
        sys.exit(exit_code)


def gated(func):
    """Refuse unless the ECC gate is open; then require DOMShell.

    Gate first, on purpose: a Mac without DOMShell still sees the policy reason,
    and no subprocess is spawned for a command that is disabled-by-policy.
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        global _availability_cached
        gs = policy.check_gate()
        if not gs.ok:
            _fail({"error": gs.reason, "type": "policy_gate", **gs.as_dict()},
                  policy.POLICY_EXIT_CODE)
            return None
        if _availability_cached is None:
            _availability_cached = backend.is_available()
        ok, msg = _availability_cached
        if not ok:
            _fail({"error": msg, "type": "dependency_error"}, 1)
            return None
        return func(*args, **kwargs)
    return wrapper


def handle_error(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except (RuntimeError, ValueError) as e:  # PathMapError is a ValueError
            _fail({"error": str(e), "type": type(e).__name__}, 1)
            return None
    return wrapper


# ── Main CLI Group ──────────────────────────────────────────────
@click.group(invoke_without_command=True)
@click.option("--json", "use_json", is_flag=True, help="Output as JSON")
@click.option("--paths", "paths_file", type=click.Path(), default=None,
              help=f"Path map file (default: packaged paths.json, or ${target.PATHS_ENV})")
@click.version_option(__version__, prog_name=target.CLI_NAME)
@click.pass_context
def cli(ctx, use_json, paths_file):
    """zipForms CLI — read-only, ECC-gated.

    Nothing here can click, type, upload, download, send or sign; there is no
    action group at all. Every command that touches the live site is refused
    unless CLI_ANYTHING_ECC_REVIEWED_AT holds the ECC review sign-off date.
    Run without a subcommand to enter the REPL.
    """
    global _json_output, _paths_override
    _json_output = use_json
    _paths_override = paths_file
    if ctx.invoked_subcommand is None:
        ctx.invoke(repl)


# ── Offline commands (never touch the site) ─────────────────────
@cli.group()
def gate():
    """ECC review gate (offline)."""


@gate.command("status")
def gate_status():
    """Show whether the ECC gate is open, and why not."""
    gs = policy.check_gate()
    output(gs.as_dict(), f"{target.NAME}: {gs.conn_state} — {gs.reason}")


@cli.command("verbs")
def verbs():
    """List the read verbs that exist and the write verbs deliberately absent."""
    output({
        "target": target.NAME,
        "readOnly": True,
        "verbsEnabled": target.READ_VERBS,
        "verbsDisabled": target.DISABLED_WRITE_VERBS,
        "gate": policy.ENV_VAR,
    }, f"{target.NAME}: {len(target.READ_VERBS)} read verbs; "
       f"{len(target.DISABLED_WRITE_VERBS)} write verbs deliberately absent")


@cli.group("paths")
def paths_group():
    """The path map (offline). Unverified until the first live run."""


@paths_group.command("show")
@handle_error
def paths_show():
    """Print the effective path map and where it came from."""
    pm = paths_mod.load(_paths_override)
    output(pm, f"path map: {pm['source']}")


@paths_group.command("validate")
def paths_validate():
    """Schema-check the path map without touching the site."""
    f = paths_mod.resolve_file(_paths_override)
    try:
        pm = paths_mod.load(_paths_override)
    except paths_mod.PathMapError as e:
        _fail({"error": str(e), "type": "PathMapError", "file": str(f)}, 1)
        return
    verified = [n for n, s in pm["map"]["recipes"].items() if s.get("verified")]
    output({"file": pm["source"], "valid": True,
            "recipes": sorted(pm["map"]["recipes"]),
            "verifiedRecipes": verified,
            "note": pm["map"].get("verified_note")},
           f"valid: {pm['source']} ({len(verified)} of {len(pm['map']['recipes'])} recipes verified live)")


# ── Recipes (gated) ─────────────────────────────────────────────
@cli.group()
def recipe():
    """Read recipes. Gated on CLI_ANYTHING_ECC_REVIEWED_AT; read-only."""


def _make_recipe_command(name: str, spec: dict) -> click.Command:
    params = []
    if spec["needs_id"]:
        params.append(click.Option(["--id", "id_"], required=True,
                                   help="Form id (letters, digits, - and _ only)"))

    @handle_error
    @gated
    def _run(id_: Optional[str] = None):
        pm = paths_mod.load(_paths_override)
        result = recipes_mod.run(name, pm, id=id_)
        if "error" in result:
            _fail(result, 1)
            return
        output(result, f"{name}: {result['count']} rows (verified={result['verified']})")

    _run.__name__ = name.replace("-", "_")
    return click.Command(name, callback=_run, params=params,
                         help=spec["help"] + " Gated on CLI_ANYTHING_ECC_REVIEWED_AT.")


for _name, _spec in target.RECIPES.items():
    recipe.add_command(_make_recipe_command(_name, _spec))


# ── Discovery (gated) ───────────────────────────────────────────
@cli.command()
@click.option("--url", default=None,
              help="Open this URL first (allow-listed hosts only); otherwise walk the current tab")
@click.option("--root", default="/", show_default=True, help="Tree path to start from")
@click.option("--max-depth", default=3, show_default=True, type=int)
@click.option("--max-nodes", default=400, show_default=True, type=int)
@handle_error
@gated
def discover(url, root, max_depth, max_nodes):
    """Dump the live accessibility tree (ls only) so paths.json can be corrected."""
    sess = backend.new_session()
    if url:
        opened = backend.open_url(sess, url)
        if "error" in opened:
            _fail({"error": opened["error"], "type": "navigation_error", "url": url}, 1)
            return
    result = discover_mod.walk(sess, root, max_depth, max_nodes)
    output(result, f"{result['count']} nodes under {root} (truncated={result['truncated']})")


# ── Filesystem pass-throughs (gated, read-only) ─────────────────
@cli.group()
def fs():
    """Accessibility-tree reads: ls, cat, grep, pwd. Gated."""


@fs.command("ls")
@click.argument("path", default="", required=False)
@handle_error
@gated
def fs_ls(path):
    """List elements at a path."""
    output(backend.ls(backend.new_session(), path))


@fs.command("cat")
@click.argument("path", default="", required=False)
@handle_error
@gated
def fs_cat(path):
    """Read element content."""
    output(backend.cat(backend.new_session(), path))


@fs.command("grep")
@click.argument("pattern")
@click.argument("path", default="", required=False)
@handle_error
@gated
def fs_grep(pattern, path):
    """Search for a text pattern."""
    output(backend.grep(backend.new_session(), pattern, path))


@fs.command("pwd")
@handle_error
@gated
def fs_pwd():
    """Print the working directory of a fresh session."""
    click.echo(backend.new_session().working_dir)


# ── Page (gated; open is host-allow-listed) ─────────────────────
@cli.group()
def page():
    """Page navigation: open (allow-listed hosts), info, reload, back, forward. Gated."""


@page.command("open")
@click.argument("url")
@handle_error
@gated
def page_open(url):
    """Open an allow-listed zipForms URL."""
    result = backend.open_url(backend.new_session(), url)
    if "error" in result:
        _fail({"error": result["error"], "type": "navigation_error", "url": url}, 1)
        return
    output(result, f"Opened: {url}")


@page.command("info")
@handle_error
@gated
def page_info():
    """Show current page information."""
    output(backend.page_info(backend.new_session()))


@page.command("reload")
@handle_error
@gated
def page_reload():
    """Reload the current page."""
    output(backend.reload(backend.new_session()), "Page reloaded")


@page.command("back")
@handle_error
@gated
def page_back():
    """Navigate back in history."""
    output(backend.back(backend.new_session()))


@page.command("forward")
@handle_error
@gated
def page_forward():
    """Navigate forward in history."""
    output(backend.forward(backend.new_session()))


# ── REPL ─────────────────────────────────────────────────────────
@cli.command()
def repl():
    """Start the interactive REPL."""
    from cli_anything.zipforms.utils.repl_skin import ReplSkin

    global _repl_mode
    _repl_mode = True
    skin = ReplSkin(target.SLUG, version=__version__)
    skin.print_banner()
    pt_session = skin.create_prompt_session()
    commands = {
        "gate": "status",
        "verbs": "read verbs that exist; write verbs deliberately absent",
        "paths": "show|validate",
        "recipe": "|".join(target.RECIPES),
        "discover": "--url URL [--max-depth N] [--max-nodes N]",
        "fs": "ls|cat|grep|pwd",
        "page": "open|info|reload|back|forward",
        "help": "Show this help",
        "quit": "Exit REPL",
    }
    gs = policy.check_gate()
    (skin.success if gs.ok else skin.warning)(f"{gs.conn_state}: {gs.reason}")
    while True:
        try:
            line = skin.get_input(pt_session, context=target.NAME)
            if not line:
                continue
            if line.lower() in ("quit", "exit", "q"):
                skin.print_goodbye()
                break
            if line.lower() == "help":
                skin.help(commands)
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
            except Exception as e:  # noqa: BLE001 - REPL must not die on a bad line
                skin.error(f"{e}")
        except (EOFError, KeyboardInterrupt):
            skin.print_goodbye()
            break
    _repl_mode = False


# ── Entry Point ──────────────────────────────────────────────────
def main():
    cli()


if __name__ == "__main__":
    main()
