#!/usr/bin/env python3
"""cli-anything-zoho — GET-only REST harness for Zoho CRM (API v8).

Usage:
    cli-anything-zoho config check                  # offline: what is configured (names only)
    cli-anything-zoho --json selftest               # the smallest Leads call, mapped to ok|blocked|error
    cli-anything-zoho --json leads list [--all]
    cli-anything-zoho --json leads get 123456789012345678
    cli-anything-zoho --json deals list
    cli-anything-zoho --json fields Leads
    cli-anything-zoho                               # REPL

No POST, PUT, PATCH or DELETE exists in this package. A 403 NO_PERMISSION is
reported as "profile permission not granted — this is a Zoho-side setting, not
a credential problem", with the click path, and is never retried.
"""

from __future__ import annotations

import datetime as _dt
import functools
import json
import shlex
import sys

import click

from cli_anything.zoho import __version__
from cli_anything.zoho.core import crm as crm_mod
from cli_anything.zoho.core import redact as redact_mod
from cli_anything.zoho.utils import zoho_backend as backend

_json_output = False
_full_output = False
_raw_output = False
_repl_mode = False


# ── Output helpers ───────────────────────────────────────────────
def _present(data):
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
        else:
            click.echo(f"{prefix}- {item}")


def _fail(payload: dict, exit_code: int) -> None:
    if _json_output:
        click.echo(json.dumps(payload, indent=2, default=str))
    else:
        click.echo(f"Error: {payload.get('error')}", err=True)
        if payload.get("fix"):
            click.echo(f"Fix: {payload['fix']}", err=True)
    if not _repl_mode:
        sys.exit(exit_code)


def handle_error(func):
    """Every failure is a structured message and an exit code — never a traceback."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except backend.NotConfigured as e:
            _fail({**e.as_dict(), "variables": list(backend.FILE_VARS) + [backend.TOKEN_VAR],
                   "envFile": str(backend.env_file())}, backend.NOT_CONFIGURED_EXIT)
        except backend.ProfilePermissionDenied as e:
            _fail(e.as_dict(), backend.PROFILE_PERMISSION_EXIT)
        except backend.ZohoError as e:
            _fail(e.as_dict(), 1)
        except ValueError as e:
            _fail({"error": str(e), "type": "ValueError"}, 1)
        return None
    return wrapper


def _getter():
    cfg = backend.load_config()
    return lambda path, params: backend.get(cfg, path, params)


# ── Main CLI Group ──────────────────────────────────────────────
@click.group(invoke_without_command=True)
@click.option("--json", "use_json", is_flag=True, help="Output as JSON")
@click.option("--full", "full", is_flag=True,
              help="Do not redact email/phone/address fields (default: redacted)")
@click.option("--raw", "raw", is_flag=True, help="Include the untouched response body")
@click.version_option(__version__, prog_name="cli-anything-zoho")
@click.pass_context
def cli(ctx, use_json, full, raw):
    """Zoho CRM CLI — GET-only reads over the v8 REST API.

    Read-only by construction: no HTTP method other than GET exists in this
    package, so the access token is minted outside it (tools/mint-access-token.sh)
    and arrives as ZOHO_ACCESS_TOKEN for one hour. A 403 NO_PERMISSION is
    reported as a profile permission not granted — a Zoho-side setting, not a
    credential problem. Run without a subcommand to enter the REPL.
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
    """Which of the five file variables and the access token are set — names only."""
    st = backend.config_status()
    output(st, ("configured" if st["configured"] else "not configured") + f" — {st['envFile']}")


@cli.command("selftest")
def selftest():
    """The zoho-crm-sync self-test: one Leads record, mapped to status ok | blocked | error."""
    now = _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds")
    base = {"checkedAt": now, "source": crm_mod.SOURCE, "leads": None, "deals": None}
    try:
        result = crm_mod.selftest(_getter())
    except backend.NotConfigured as e:
        _fail({**base, "status": "not-configured", "httpCode": None, "error": str(e), "fix": None,
               "type": e.kind}, backend.NOT_CONFIGURED_EXIT)
        return
    except backend.ProfilePermissionDenied as e:
        _fail({**base, "status": "blocked", "httpCode": 403, "error": str(e), "fix": e.fix,
               "zohoCode": e.code, "type": e.kind}, backend.PROFILE_PERMISSION_EXIT)
        return
    except backend.ZohoError as e:
        _fail({**base, "status": "error", "httpCode": e.http_status, "error": str(e), "fix": e.fix,
               "type": e.kind}, 1)
        return
    output({**base, **result}, "ok — the profile permission is granted and the token works")


@cli.group()
def leads():
    """Lead reads: list, get."""


def _list_options(f):
    for opt in reversed([
        click.option("--fields", default=None, help="Comma-separated API field names (default: the sync skill's set)"),
        click.option("--per-page", default=crm_mod.MAX_PER_PAGE, show_default=True, type=int),
        click.option("--page-token", default=None, help="Continue from a previous nextPageToken"),
        click.option("--all", "all_pages", is_flag=True, help="Follow page_token until done or --max-pages"),
        click.option("--max-pages", default=10, show_default=True, type=int),
    ]):
        f = opt(f)
    return f


@leads.command("list")
@_list_options
@handle_error
def leads_list(fields, per_page, page_token, all_pages, max_pages):
    """GET /crm/v8/Leads."""
    r = crm_mod.list_records(_getter(), "Leads", fields, per_page, page_token, all_pages, max_pages)
    output(r, f"{r['count']} leads ({r['pages']} page(s); more={r['moreRecords']})")


@leads.command("get")
@click.argument("record_id")
@handle_error
def leads_get(record_id):
    """GET /crm/v8/Leads/{id}."""
    output(crm_mod.get_record(_getter(), "Leads", record_id), f"lead {record_id}")


@cli.group()
def deals():
    """Deal reads: list, get."""


@deals.command("list")
@_list_options
@handle_error
def deals_list(fields, per_page, page_token, all_pages, max_pages):
    """GET /crm/v8/Deals."""
    r = crm_mod.list_records(_getter(), "Deals", fields, per_page, page_token, all_pages, max_pages)
    output(r, f"{r['count']} deals ({r['pages']} page(s); more={r['moreRecords']})")


@deals.command("get")
@click.argument("record_id")
@handle_error
def deals_get(record_id):
    """GET /crm/v8/Deals/{id}."""
    output(crm_mod.get_record(_getter(), "Deals", record_id), f"deal {record_id}")


@cli.command("fields")
@click.argument("module")
@handle_error
def fields(module):
    """GET /crm/v8/settings/fields?module=MODULE — the module's field metadata."""
    r = crm_mod.module_fields(_getter(), module)
    output(r, f"{r['count']} fields on {module}")


# ── REPL ─────────────────────────────────────────────────────────
@cli.command()
def repl():
    """Start the interactive REPL."""
    from cli_anything.zoho.utils.repl_skin import ReplSkin

    global _repl_mode
    _repl_mode = True
    skin = ReplSkin("zoho", version=__version__)
    skin.print_banner()
    pt_session = skin.create_prompt_session()
    commands = {
        "config": "check",
        "selftest": "one Leads record → ok | blocked | error",
        "leads": "list|get ID",
        "deals": "list|get ID",
        "fields": "MODULE",
        "help": "Show this help",
        "quit": "Exit REPL",
    }
    st = backend.config_status()
    (skin.success if st["configured"] else skin.warning)(
        f"{'configured' if st['configured'] else 'not configured'} ({st['envFile']})")
    while True:
        try:
            line = skin.get_input(pt_session, context="zoho")
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
