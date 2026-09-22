#!/usr/bin/env python3
"""cli-anything-lofty — GET-only REST harness for Lofty's Open API.

Usage:
    cli-anything-lofty config check                 # offline: is LOFTY_API_KEY configured (names only)
    cli-anything-lofty --json me                    # GET /v1.0/me — the self-test
    cli-anything-lofty --json leads list --page 1 --page-size 50
    cli-anything-lofty --json leads get LEAD_ID
    cli-anything-lofty --json leads stage-totals
    cli-anything-lofty --json leads timeline LEAD_ID
    cli-anything-lofty                              # REPL

No POST, PUT, PATCH or DELETE exists in this package. The lofty-bridge MCP on
the Mac remains the primary Lofty path; this is the CLI-Anything-shaped front.
"""

from __future__ import annotations

import functools
import json
import shlex
import sys
from typing import Optional

import click

from cli_anything.lofty import __version__
from cli_anything.lofty.core import leads as leads_mod
from cli_anything.lofty.core import redact as redact_mod
from cli_anything.lofty.utils import lofty_backend as backend

_json_output = False
_full_output = False
_raw_output = False
_repl_mode = False


# ── Output helpers ───────────────────────────────────────────────
def _present(data):
    """Apply the output policy: drop raw unless asked, redact unless --full."""
    if isinstance(data, dict) and not _raw_output:
        data = {k: v for k, v in data.items() if k != "raw"}
    return data if _full_output else redact_mod.redact(data)


def output(data, message: str = ""):
    data = _present(data)
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
        elif isinstance(item, list):
            click.echo(f"{prefix}- {' · '.join(str(x) for x in item)}")
        else:
            click.echo(f"{prefix}- {item}")


def _fail(payload: dict, exit_code: int) -> None:
    if _json_output:
        click.echo(json.dumps(payload, indent=2, default=str))
    else:
        click.echo(f"Error: {payload.get('error')}", err=True)
    if not _repl_mode:
        sys.exit(exit_code)


def handle_error(func):
    """Every failure is a structured message and an exit code — never a traceback."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except backend.NotConfigured as e:
            _fail({**e.as_dict(), "variable": backend.KEY_VAR,
                   "envFile": str(backend.env_file())}, backend.NOT_CONFIGURED_EXIT)
        except backend.LoftyError as e:
            _fail(e.as_dict(), 1)
        except ValueError as e:
            _fail({"error": str(e), "type": "ValueError"}, 1)
        return None
    return wrapper


def _getter():
    cfg = backend.load_config()
    return lambda path, params: backend.get(cfg, path, params)


def _parse_params(pairs) -> dict:
    out = {}
    for p in pairs or ():
        if "=" not in p:
            raise ValueError(f"--param expects key=value, got {p!r}")
        k, v = p.split("=", 1)
        out[k.strip()] = v.strip()
    return out


# ── Main CLI Group ──────────────────────────────────────────────
@click.group(invoke_without_command=True)
@click.option("--json", "use_json", is_flag=True, help="Output as JSON")
@click.option("--full", "full", is_flag=True,
              help="Do not redact phone/email/address fields (default: redacted)")
@click.option("--raw", "raw", is_flag=True, help="Include the untouched response body")
@click.version_option(__version__, prog_name="cli-anything-lofty")
@click.pass_context
def cli(ctx, use_json, full, raw):
    """Lofty CLI — GET-only reads over Lofty's Open API (api.lofty.com/v1.0).

    Read-only by construction: no HTTP method other than GET exists in this
    package. The key is read from ~/.config/lofty/.env as LOFTY_API_KEY and is
    never printed. lofty-bridge on the Mac remains the primary path.
    Run without a subcommand to enter the REPL.
    """
    global _json_output, _full_output, _raw_output
    _json_output, _full_output, _raw_output = use_json, full, raw
    if ctx.invoked_subcommand is None:
        ctx.invoke(repl)


@cli.group()
def config():
    """Configuration checks (offline)."""


@config.command("check")
def config_check():
    """Is LOFTY_API_KEY configured? Names and locations only — never the value."""
    st = backend.config_status()
    output(st, ("configured" if st["configured"] else "not configured") + f" — {st['envFile']}")


@cli.command("me")
@handle_error
def me():
    """GET /v1.0/me — proves the key works (the skill's self-test)."""
    output(leads_mod.whoami(_getter()), "key accepted")


@cli.group()
def leads():
    """Lead reads: list, get, stage-totals, timeline."""


@leads.command("list")
@click.option("--page", default=1, show_default=True, type=int)
@click.option("--page-size", default=leads_mod.DEFAULT_PAGE_SIZE, show_default=True, type=int)
@click.option("--param", "params", multiple=True, help="Extra query parameter key=value (repeatable)")
@handle_error
def leads_list(page, page_size, params):
    """GET /v1.0/leads — one page of leads."""
    result = leads_mod.list_leads(_getter(), page, page_size, _parse_params(params))
    output(result, f"{result['count']} leads on page {page}")


@leads.command("get")
@click.argument("lead_id")
@handle_error
def leads_get(lead_id):
    """GET /v1.0/leads/{id} — one lead."""
    output(leads_mod.get_lead(_getter(), lead_id), f"lead {lead_id}")


@leads.command("stage-totals")
@click.option("--page-size", default=leads_mod.DEFAULT_PAGE_SIZE, show_default=True, type=int)
@click.option("--max-pages", default=20, show_default=True, type=int)
@click.option("--stage-field", default=None, help="Field holding the stage (default: auto-detect)")
@click.option("--param", "params", multiple=True, help="Extra query parameter key=value (repeatable)")
@handle_error
def leads_stage_totals(page_size, max_pages, stage_field, params):
    """Count leads per Lofty stage across pages of GET /v1.0/leads."""
    result = leads_mod.stage_totals(_getter(), page_size, max_pages, stage_field, _parse_params(params))
    output(result, f"{result['leadsScanned']} leads over {result['pages']} pages (truncated={result['truncated']})")


@leads.command("timeline")
@click.argument("lead_id")
@click.option("--param", "params", multiple=True, help="Extra query parameter key=value (repeatable)")
@handle_error
def leads_timeline(lead_id, params):
    """GET /v1.0/leads/{id}/activities — a lead's activity timeline."""
    result = leads_mod.timeline(_getter(), lead_id, _parse_params(params))
    output(result, f"{result['count']} activities for lead {lead_id}")


# ── REPL ─────────────────────────────────────────────────────────
@cli.command()
def repl():
    """Start the interactive REPL."""
    from cli_anything.lofty.utils.repl_skin import ReplSkin

    global _repl_mode
    _repl_mode = True
    skin = ReplSkin("lofty", version=__version__)
    skin.print_banner()
    pt_session = skin.create_prompt_session()
    commands = {
        "config": "check",
        "me": "GET /v1.0/me self-test",
        "leads": "list|get ID|stage-totals|timeline ID",
        "help": "Show this help",
        "quit": "Exit REPL",
    }
    st = backend.config_status()
    (skin.success if st["configured"] else skin.warning)(
        f"{backend.KEY_VAR}: {'configured' if st['configured'] else 'not configured'} ({st['envFile']})")
    while True:
        try:
            line = skin.get_input(pt_session, context="lofty")
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


def main():
    cli()


if __name__ == "__main__":
    main()
