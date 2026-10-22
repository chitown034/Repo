#!/usr/bin/env python3
"""cli-anything-dotloop — GET-only REST harness for the dotloop Public API v2.

Usage:
    cli-anything-dotloop config check                    # offline: what is configured (names only)
    cli-anything-dotloop --json selftest                 # GET /account, mapped to ok|blocked|error
    cli-anything-dotloop --json account
    cli-anything-dotloop --json profiles list
    cli-anything-dotloop --json profiles get 123456
    cli-anything-dotloop --json loops list 123456 [--param key=value ...]
    cli-anything-dotloop --json loops get 123456 987654
    cli-anything-dotloop --json loops detail 123456 987654
    cli-anything-dotloop --json participants list 123456 987654
    cli-anything-dotloop --json documents list 123456 987654
    cli-anything-dotloop --json activity list 123456 987654
    cli-anything-dotloop                                 # REPL

No POST, PUT, PATCH or DELETE exists in this package. A 403 is reported as "forbidden" with
whatever detail dotloop's own body carries, and is never retried.
"""

from __future__ import annotations

import functools
import json
import shlex
import sys

import click

from cli_anything.dotloop import __version__
from cli_anything.dotloop.core import loops as loops_mod
from cli_anything.dotloop.core import redact as redact_mod
from cli_anything.dotloop.utils import dotloop_backend as backend

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
        except backend.Forbidden as e:
            _fail(e.as_dict(), backend.FORBIDDEN_EXIT)
        except backend.DotloopError as e:
            _fail(e.as_dict(), 1)
        except ValueError as e:
            _fail({"error": str(e), "type": "ValueError"}, 1)
        return None
    return wrapper


def _getter():
    cfg = backend.load_config()
    return lambda path, params: backend.get(cfg, path, params)


def _parse_params(pairs):
    out = {}
    for p in pairs or ():
        if "=" not in p:
            raise ValueError(f"--param {p!r} is not KEY=VALUE")
        k, v = p.split("=", 1)
        out[k] = v
    return out or None


# ── Main CLI Group ──────────────────────────────────────────────
@click.group(invoke_without_command=True)
@click.option("--json", "use_json", is_flag=True, help="Output as JSON")
@click.option("--full", "full", is_flag=True,
              help="Do not redact email/phone/address fields (default: redacted)")
@click.option("--raw", "raw", is_flag=True, help="Include the untouched response body")
@click.version_option(__version__, prog_name="cli-anything-dotloop")
@click.pass_context
def cli(ctx, use_json, full, raw):
    """dotloop CLI — GET-only reads over the Public API v2.

    Read-only by construction: no HTTP method other than GET exists in this package, so both
    OAuth exchanges (the one-time authorization-code consent, the repeatable refresh-token grant)
    live outside it (tools/exchange-auth-code.sh, tools/mint-access-token.sh) and the access
    token arrives as DOTLOOP_ACCESS_TOKEN. Run without a subcommand to enter the REPL.
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
    """The smallest call: GET /account, mapped to status ok | blocked | error | not-configured."""
    try:
        result = loops_mod.selftest(_getter())
    except backend.NotConfigured as e:
        _fail({"status": "not-configured", "httpCode": None, "error": str(e), "fix": None,
               "type": e.kind, "source": loops_mod.SOURCE}, backend.NOT_CONFIGURED_EXIT)
        return
    except backend.Forbidden as e:
        _fail({"status": "blocked", "httpCode": 403, "error": str(e), "fix": e.fix,
               "type": e.kind, "source": loops_mod.SOURCE}, backend.FORBIDDEN_EXIT)
        return
    except backend.DotloopError as e:
        _fail({"status": "error", "httpCode": e.http_status, "error": str(e), "fix": e.fix,
               "type": e.kind, "source": loops_mod.SOURCE}, 1)
        return
    output(result, "ok — the token works")


@cli.command("account")
@handle_error
def account():
    """GET /account."""
    output(loops_mod.account_get(_getter()), "account")


@cli.group()
def profiles():
    """Profile reads: list, get."""


@profiles.command("list")
@handle_error
def profiles_list():
    """GET /profile."""
    r = loops_mod.list_profiles(_getter())
    output(r, f"{r['count']} profile(s)")


@profiles.command("get")
@click.argument("profile_id")
@handle_error
def profiles_get(profile_id):
    """GET /profile/{id}."""
    output(loops_mod.get_profile(_getter(), profile_id), f"profile {profile_id}")


@cli.group()
def loops():
    """Loop reads: list, get, detail."""


@loops.command("list")
@click.argument("profile_id")
@click.option("--param", "params", multiple=True,
              help="dotloop's own filter/sort/batch query params, KEY=VALUE — repeatable. "
                   "Names are dotloop's, not guessed by this CLI; see the vendor docs.")
@handle_error
def loops_list(profile_id, params):
    """GET /profile/{id}/loop."""
    r = loops_mod.list_loops(_getter(), profile_id, _parse_params(params))
    output(r, f"{r['count']} loop(s) for profile {profile_id}")


@loops.command("get")
@click.argument("profile_id")
@click.argument("loop_id")
@handle_error
def loops_get(profile_id, loop_id):
    """GET /profile/{id}/loop/{id}."""
    output(loops_mod.get_loop(_getter(), profile_id, loop_id), f"loop {loop_id}")


@loops.command("detail")
@click.argument("profile_id")
@click.argument("loop_id")
@handle_error
def loops_detail(profile_id, loop_id):
    """GET /profile/{id}/loop/{id}/loop-detail."""
    output(loops_mod.get_loop_detail(_getter(), profile_id, loop_id), f"loop {loop_id} detail")


@cli.group()
def participants():
    """Participant reads: list."""


@participants.command("list")
@click.argument("profile_id")
@click.argument("loop_id")
@handle_error
def participants_list(profile_id, loop_id):
    """GET /profile/{id}/loop/{id}/participant."""
    r = loops_mod.list_participants(_getter(), profile_id, loop_id)
    output(r, f"{r['count']} participant(s) on loop {loop_id}")


@cli.group()
def documents():
    """Document reads: list."""


@documents.command("list")
@click.argument("profile_id")
@click.argument("loop_id")
@handle_error
def documents_list(profile_id, loop_id):
    """GET /profile/{id}/loop/{id}/document."""
    r = loops_mod.list_documents(_getter(), profile_id, loop_id)
    output(r, f"{r['count']} document(s) on loop {loop_id}")


@cli.group()
def activity():
    """Activity reads: list."""


@activity.command("list")
@click.argument("profile_id")
@click.argument("loop_id")
@handle_error
def activity_list(profile_id, loop_id):
    """GET /profile/{id}/loop/{id}/activity."""
    r = loops_mod.list_activities(_getter(), profile_id, loop_id)
    output(r, f"{r['count']} activity record(s) on loop {loop_id}")


# ── REPL ─────────────────────────────────────────────────────────
@cli.command()
def repl():
    """Start the interactive REPL."""
    from cli_anything.dotloop.utils.repl_skin import ReplSkin

    global _repl_mode
    _repl_mode = True
    skin = ReplSkin("dotloop", version=__version__)
    skin.print_banner()
    pt_session = skin.create_prompt_session()
    commands = {
        "config": "check",
        "selftest": "GET /account -> ok | blocked | error",
        "account": "GET /account",
        "profiles": "list|get ID",
        "loops": "list PROFILE_ID|get PROFILE_ID LOOP_ID|detail PROFILE_ID LOOP_ID",
        "participants": "list PROFILE_ID LOOP_ID",
        "documents": "list PROFILE_ID LOOP_ID",
        "activity": "list PROFILE_ID LOOP_ID",
        "help": "Show this help",
        "quit": "Exit REPL",
    }
    st = backend.config_status()
    (skin.success if st["configured"] else skin.warning)(
        f"{'configured' if st['configured'] else 'not configured'} ({st['envFile']})")
    while True:
        try:
            line = skin.get_input(pt_session, context="dotloop")
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
