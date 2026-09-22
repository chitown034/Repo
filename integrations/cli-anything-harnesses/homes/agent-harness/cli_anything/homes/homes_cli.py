#!/usr/bin/env python3
"""cli-anything-homes — read-only homes.com recipes over the DOMShell browser harness.

Usage:
    cli-anything-homes --json recipes                       # what can be read
    cli-anything-homes --json recipe <name> [--url U]       # one recipe → JSON
    cli-anything-homes --json recipe <name> --discover      # dump the live tree to fix paths.json
    cli-anything-homes --json fs ls /                       # raw tree, same as the browser harness
    cli-anything-homes                                      # interactive REPL

There is no ``act`` group in this CLI. ``act click`` / ``act type`` are the whole
write surface of cli-anything-browser and this package does not import them.
"""

from __future__ import annotations

import json
import os
import shlex
import sys
from typing import Any, Optional

import click

from cli_anything.browser.core import fs as fs_mod
from cli_anything.browser.core import page as page_mod

from cli_anything.homes import CLI_NAME, SITE, SITE_TITLE, __version__
from cli_anything.homes.core import paths as paths_mod
from cli_anything.homes.core import recipes as recipes_mod
from cli_anything.homes.core.auth import AuthError
from cli_anything.homes.core.recipes import RecipeError
from cli_anything.homes.core.tree import LiveTree, TreeError
from cli_anything.homes.utils.security import URLRejected, require_site_url

# Exit codes (documented in README.md / SKILL.md)
EXIT_OK = 0
EXIT_RUNTIME = 1        # runtime, dependency or usage error
EXIT_AUTH = 2           # signed out / cannot confirm signed in
EXIT_PATH_MAP = 3       # page does not fit paths.json → run --discover
EXIT_URL_REJECTED = 4   # URL failed the homes.com allow-list

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
    except Exception as e:  # malformed override → fall back, but say so loudly
        _PATH_MAP_WARNING = f"effective path map unusable ({e}); using the packaged default"
        _PATH_MAP = paths_mod.load_default_path_map()
        _PATH_MAP_SOURCE = str(paths_mod.PACKAGED_PATH)


_load_map_at_import()


class DependencyError(RuntimeError):
    pass


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
            # The browser harness only checks this at call time; say it up front.
            raise DependencyError(
                "DOMSHELL_TOKEN is not set. Export the auth token DOMShell prints at startup "
                "(and DOMSHELL_PORT if the MCP port is not 3001), then re-run."
            )
        _source = LiveTree(_PATH_MAP.get("hosts", []))
    return _source


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


def _emit_error(err: Exception, etype: str, code: int, hint: str = "") -> None:
    payload = {"error": str(err), "type": etype}
    if hint:
        payload["hint"] = hint
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
    """homes.com read-only CLI — named page recipes over the DOMShell browser harness.

    Reads the signed-in Chrome tab through cli-anything-browser. Only read verbs
    exist: fs (ls cd cat grep pwd), page (open info back forward reload; open is
    allow-listed to homes.com hosts), recipe <name>, recipes, paths, session
    status. Run without a subcommand to enter the REPL.
    """
    global _json_output
    _json_output = use_json
    if _PATH_MAP_WARNING and not _repl_mode:
        click.echo(f"Warning: {_PATH_MAP_WARNING}", err=True)
    if ctx.invoked_subcommand is None:
        ctx.invoke(repl)


# ── recipes ──────────────────────────────────────────────────────────
@cli.command("recipes")
@handle_error
def recipes_list():
    """List the read recipes in the effective path map."""
    items = recipes_mod.list_recipes(_PATH_MAP)
    if _json_output:
        output({"site": SITE, "path_map": _PATH_MAP_SOURCE, "recipes": items})
        return
    click.echo(f"{SITE_TITLE} recipes (path map: {_PATH_MAP_SOURCE})")
    for it in items:
        flags = []
        if it["requires_auth"]:
            flags.append("signed-in")
        if it["url_required"]:
            flags.append("--url required")
        if it["requires_match"]:
            flags.append("--match required")
        flags.append("verified" if it["verified"] else "UNVERIFIED path map")
        click.echo(f"  {it['name']:<22} {it['kind']:<7} {it['description']}  [{', '.join(flags)}]")


@cli.group("recipe")
def recipe():
    """Run one named read recipe (rows as JSON with --json). --discover dumps the live tree."""


def _make_recipe_command(name: str, cfg: dict):
    @recipe.command(name, help=cfg.get("description", name) + (
        "" if cfg.get("verified") else "  [path map UNVERIFIED until first live run]"))
    @click.option("--url", "url", default=None, help=f"Page to read (must be on {SITE_TITLE}, https)")
    @click.option("--match", "match", default=None, help="Keep only rows containing this text (case-insensitive)")
    @click.option("--max-rows", "max_rows", default=50, show_default=True, help="Upper bound on rows read")
    @click.option("--discover", "do_discover", is_flag=True, help="Dump the live tree instead of running the recipe")
    @click.option("--depth", "depth", default=3, show_default=True, help="Tree depth for --discover")
    @click.option("--text", "with_text", is_flag=True, help="Include each node's text in --discover output (slower)")
    @handle_error
    def _cmd(url, match, max_rows, do_discover, depth, with_text):
        src = _live_source()
        with src:
            if do_discover:
                result = recipes_mod.discover(
                    src, _PATH_MAP, name, url=url, depth=depth, with_text=with_text,
                    override_path=str(paths_mod.override_location()),
                )
                output(result, f"Discovered tree for {name} at {result.get('url')}")
                return
            result = recipes_mod.run_recipe(
                src, _PATH_MAP, name, url=url, match=match, max_rows=max_rows,
                path_map_source=_PATH_MAP_SOURCE,
            )
        if getattr(src, "warnings", None):
            result.setdefault("warnings", []).extend(src.warnings)
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


# ── paths (the editable map) ─────────────────────────────────────────
@cli.group("paths")
def paths_group():
    """Inspect or initialise the editable path map (a local file; never touches the site)."""


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
    """Copy the packaged default map to ~/.config/cli-anything/homes-paths.json for editing."""
    dest, written = paths_mod.init_override(force=force)
    output({"path": str(dest), "written": written},
           f"{'Wrote' if written else 'Already exists (use --force to overwrite)'}: {dest}")


# ── page (read-only navigation; open is allow-listed) ─────────────────
@cli.group()
def page():
    """Page navigation, read-only. `open` accepts only https homes.com URLs."""


@page.command("open")
@click.argument("url")
@handle_error
def page_open(url):
    """Open a homes.com URL (allow-listed hosts, https only)."""
    hosts = _PATH_MAP.get("hosts", [])
    url = require_site_url(url, hosts)
    src = _live_source()
    result = src.open(url)
    output(result, f"Opened: {url}")


@page.command("info")
@handle_error
def page_info():
    """Show current page information."""
    src = _live_source()
    output(page_mod.get_page_info(src.session))


@page.command("reload")
@handle_error
def page_reload():
    """Reload the current page."""
    src = _live_source()
    output(page_mod.reload_page(src.session), "Page reloaded")


@page.command("back")
@handle_error
def page_back():
    """Navigate back in history."""
    src = _live_source()
    result = page_mod.go_back(src.session)
    output(result, result.get("error", "Navigated back") if isinstance(result, dict) else "Navigated back")


@page.command("forward")
@handle_error
def page_forward():
    """Navigate forward in history."""
    src = _live_source()
    result = page_mod.go_forward(src.session)
    output(result, result.get("error", "Navigated forward") if isinstance(result, dict) else "Navigated forward")


# ── fs (read-only tree navigation, same semantics as the browser harness) ──
@cli.group()
def fs():
    """Accessibility-tree navigation, read-only: ls, cd, cat, grep, pwd."""


@fs.command("ls")
@click.argument("path", default="", required=False)
@handle_error
def fs_ls(path):
    """List elements at a path in the accessibility tree."""
    src = _live_source()
    result = fs_mod.list_elements(src.session, path)
    if _json_output:
        output(result)
        return
    if "error" in result:
        click.echo(result["error"], err=True)
        return
    entries = result.get("entries", [])
    if not entries:
        click.echo(f"No elements at {path or src.session.working_dir}")
        return
    for entry in entries:
        click.echo(entry.get("name", ""))


@fs.command("cd")
@click.argument("path")
@handle_error
def fs_cd(path):
    """Change directory in the accessibility tree."""
    src = _live_source()
    result = fs_mod.change_directory(src.session, path)
    output(result, result.get("error") or f"Changed to: {src.session.working_dir}")


@fs.command("cat")
@click.argument("path", default="", required=False)
@handle_error
def fs_cat(path):
    """Read element content from the accessibility tree."""
    src = _live_source()
    output(fs_mod.read_element(src.session, path))


@fs.command("grep")
@click.argument("pattern")
@click.argument("path", default="", required=False)
@handle_error
def fs_grep(pattern, path):
    """Search for a text pattern in the accessibility tree."""
    src = _live_source()
    result = fs_mod.grep_elements(src.session, pattern, path)
    if _json_output:
        output(result)
        return
    if "error" in result:
        click.echo(result["error"], err=True)
        return
    matches = result.get("matches", [])
    if not matches:
        click.echo(f"No matches for '{pattern}'")
        return
    for m in matches:
        click.echo(f"  {m}")


@fs.command("pwd")
@handle_error
def fs_pwd():
    """Print the current working directory in the accessibility tree."""
    src = _live_source()
    click.echo(src.session.working_dir)


# ── session (status only) ────────────────────────────────────────────
@cli.group()
def session():
    """Session state, read-only."""


@session.command("status")
@handle_error
def session_status():
    """Show current session status (URL, working dir, DOMShell lane)."""
    src = _live_source()
    status = src.session.status()
    status["site"] = SITE
    status["path_map"] = _PATH_MAP_SOURCE
    output(status)


# ── REPL ─────────────────────────────────────────────────────────────
@cli.command()
@handle_error
def repl():
    """Start the interactive REPL session."""
    from cli_anything.homes.utils.repl_skin import ReplSkin

    global _repl_mode
    _repl_mode = True

    skin = ReplSkin(SITE, version=__version__)
    # The plugin skin advertises `npx skills add HKUDS/CLI-Anything …`, which does
    # not carry this skill. Show the truthful install line and the packaged SKILL.md.
    skin.skill_install_cmd = (
        "uv pip install --python ~/Applications/CLI-Anything/.venv/bin/python "
        f"<repo>/integrations/cli-anything-harnesses/{SITE}/agent-harness  (README.md)"
    )
    skin.global_skill_path = skin.skill_path or skin.global_skill_path
    skin.print_banner()
    pt_session = skin.create_prompt_session()

    recipe_names = "|".join((_PATH_MAP.get("recipes") or {}).keys())
    _repl_commands = {
        "recipes":  "List read recipes",
        "recipe":   f"{recipe_names} [--url U] [--match T] [--discover]",
        "page":     "open|reload|back|forward|info",
        "fs":       "ls|cd|cat|grep|pwd",
        "paths":    "show|where|init",
        "session":  "status",
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
