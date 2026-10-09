#!/usr/bin/env python3
"""vanessa-bridge.py — Vanessa answers Steven in his own WhatsApp "Message Yourself" chat.

Written 2026-09-28. Runs on the Mac that runs OpenWA (integrations/openwa/README.md); launchd starts
it (install-bridge.sh). Every --poll seconds it reads the newest messages of Steven's self-chat
through OpenWA with Vanessa's chat-fenced key, keeps the ones Steven wrote since the last poll, asks
Vanessa (Claude Code, headless, as the vanessa-orchestrator agent) to answer each, and posts her
answer back into the same chat. Every part of every answer starts with "[V] ".

What it can reach: one chat. Vanessa's key is fenced to the self-chat by OpenWA itself
(setup-phone.sh proves the fence), and every send names that chat. It never messages anyone but
Steven. Vanessa runs with no command, edit or write tools: from here she can read, research and answer.

Rules — integrations/mac-task-specs.md §5a, on OpenWA's transport instead of whatsapp-cli:
  * Steven's message: a text in the self-chat, sent from his own account, whose body does not start
    with "[V]", whose hash is not one of Vanessa's recent replies, and whose id was never seen;
  * at most 3 answered per poll (the newest 3); at most 20 sends a day, the 20th being a notice;
  * the first poll ever answers nothing — it only marks what is already in the chat as seen;
  * a message older than 12 hours when first seen is not answered (the Mac was off; ask again).

Files — no keys, no phone numbers, no message text. Message ids (which embed the phone number) and
Vanessa's replies are kept only as hashes:
  state  ~/Library/Application Support/vanessa-whatsapp/state.json   (0600)
  log    ~/Library/Logs/vanessa-whatsapp-bridge.log                  (ids, lengths, outcomes)
Secrets come from the Keychain: 'openwa-vanessa-operator-key' (Vanessa's fenced key) and
'openwa-vanessa-bridge' (JSON {"sid", "me"}, written by install-bridge.sh).

Usage:  vanessa-bridge.py --check | --once | --loop  [--repo DIR] [--claude PATH] [--poll SECONDS]
Python 3.9+ standard library only (macOS /usr/bin/python3).
"""
from __future__ import annotations

import argparse
import datetime
import fcntl
import hashlib
import json
import os
import random
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

MARKER = "[V] "
PART_MAX = 1500              # characters per WhatsApp message, marker included
PER_POLL_CAP = 3             # answers per poll (§5a layer 1)
DAILY_CEILING = 20           # sends per local day, the last one a notice (§5a layer 2)
HISTORY_LIMIT = 15           # newest messages read per poll
MAX_AGE_S = 12 * 3600        # older than this when first seen -> not answered
RETRY_LIMIT = 3              # Claude attempts per message
SEEN_KEEP = 500
RECENT_OUT_KEEP = 40         # reply-part hashes kept for echo detection
TEXT_TYPES = ("text", "chat")
EXEC_TOOLS_OFF = "Bash,Edit,Write,NotebookEdit,MultiEdit"
READ_TOOLS = "Read,Glob,Grep,WebSearch,WebFetch"

HOME = os.path.expanduser("~")
STATE_DIR = os.environ.get("VANESSA_BRIDGE_STATE_DIR") or os.path.join(
    HOME, "Library", "Application Support", "vanessa-whatsapp")
LOG_PATH = os.environ.get("VANESSA_BRIDGE_LOG") or os.path.join(
    HOME, "Library", "Logs", "vanessa-whatsapp-bridge.log")
API = os.environ.get("OPENWA_API", "http://127.0.0.1:2785/api").rstrip("/")
RETRY_GAP_S = int(os.environ.get("VANESSA_BRIDGE_RETRY_GAP", "300"))
ANSWER_TIMEOUT_S = int(os.environ.get("VANESSA_BRIDGE_ANSWER_TIMEOUT", "420"))

PROMPT = """Steven wrote this to you in his own WhatsApp "Message Yourself" chat at {when}:

<message>
{body}
</message>

Answer him as Vanessa, with the AI team, exactly as you would an iMessage from him. The HALT list in
CLAUDE.md applies: a licensed decision, a send to a client, a credential, or anything that spends
money becomes a short "Needs Steven" note, never an attempt. From here you can read and research, but
you cannot send messages, run commands or change files, so do not offer to.

Your whole reply goes straight back into that WhatsApp chat as plain text: no tables, no headings, no
preamble, phone-sized (aim for under 1,200 characters). Do not start it with "[V]" (the bridge adds it)."""

NOTICE_NONTEXT = ("Voice notes, photos and files don't reach me on WhatsApp yet. Please type the "
                  "question and I'll answer here.")
NOTICE_FAILED = ("I couldn't answer your message from {when} ({why}). Please send it again in a "
                 "little while.")
NOTICE_CEILING = ("I've sent today's limit of {n} WhatsApp replies, so I'm pausing here until "
                  "tomorrow. If you didn't send that many messages, something is looping: the log "
                  "on the Mac is ~/Library/Logs/vanessa-whatsapp-bridge.log.")

_OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))  # loopback only, never a proxy


# ---- small helpers -------------------------------------------------------------------------------

def log(event: str, **fields) -> None:
    """One JSON line per event. Callers pass ids, counts and reasons — never a message body."""
    row = {"ts": datetime.datetime.now().isoformat(timespec="seconds"), "event": event}
    row.update(fields)
    try:
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        with open(LOG_PATH, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")
    except OSError:
        pass


def digest(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()[:32]


def local_day(now: float) -> str:
    return datetime.datetime.fromtimestamp(now).strftime("%Y-%m-%d")


def when_text(ts: float) -> str:
    return datetime.datetime.fromtimestamp(ts).strftime("%a %b %-d, %-I:%M %p")


def keychain(item: str) -> str:
    """Read one Keychain item. Tests set VANESSA_BRIDGE_KEY / VANESSA_BRIDGE_CONFIG instead."""
    override = {"openwa-vanessa-operator-key": "VANESSA_BRIDGE_KEY",
                "openwa-vanessa-bridge": "VANESSA_BRIDGE_CONFIG"}.get(item)
    if override and os.environ.get(override):
        return os.environ[override]
    try:
        out = subprocess.run(["security", "find-generic-password", "-a", os.environ.get("USER", ""),
                              "-s", item, "-w"], capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return out.stdout.strip() if out.returncode == 0 else ""


_CONFIG_CACHE = {"at": 0.0, "value": ("", "", "")}


def load_config(max_age: float = 600) -> tuple:
    """(key, sid, me) from the Keychain, re-read at most every 10 minutes while running."""
    if _CONFIG_CACHE["value"][0] and time.time() - _CONFIG_CACHE["at"] < max_age:
        return _CONFIG_CACHE["value"]
    key = keychain("openwa-vanessa-operator-key")
    try:
        cfg = json.loads(keychain("openwa-vanessa-bridge") or "{}")
    except ValueError:
        cfg = {}
    value = (key, str(cfg.get("sid") or ""), str(cfg.get("me") or ""))
    _CONFIG_CACHE.update(at=time.time(), value=value)
    return value


def call(method: str, path: str, key: str = "", body=None, timeout: int = 30) -> tuple:
    """(http_status, parsed_json). Status 0 means OpenWA could not be reached at all."""
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(API + path, data=data, method=method)
    if key:
        req.add_header("X-API-Key", key)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with _OPENER.open(req, timeout=timeout) as resp:
            code, raw = resp.status, resp.read()
    except urllib.error.HTTPError as err:
        return err.code, None
    except (urllib.error.URLError, OSError, ValueError):
        return 0, None
    try:
        return code, json.loads(raw.decode("utf-8") or "null")
    except ValueError:
        return code, None


def quote(part: str) -> str:
    return urllib.parse.quote(part, safe="@.")


def read_history(key: str, sid: str, me: str) -> tuple:
    code, data = call("GET", "/sessions/%s/messages/%s/history?limit=%d"
                      % (quote(sid), quote(me), HISTORY_LIMIT), key)
    if isinstance(data, dict):  # tolerate a wrapped shape
        data = data.get("messages") or data.get("data")
    if code != 200 or not isinstance(data, list):
        return None, code
    rows = [m for m in data if isinstance(m, dict) and m.get("id")]
    rows.sort(key=lambda m: (m.get("timestamp") or 0))
    return rows, code


def split_parts(text: str) -> list:
    """Split a reply into WhatsApp messages of at most PART_MAX characters, each led by the marker."""
    text = re.sub(r"^\s*\[V\]\s*", "", text.strip())
    room = PART_MAX - len(MARKER)
    parts, rest = [], text
    while rest:
        if len(rest) <= room:
            parts.append(rest)
            break
        cut = max(rest.rfind("\n\n", 0, room), rest.rfind("\n", 0, room))
        if cut < room // 2:
            cut = max(rest.rfind(". ", 0, room) + 1, rest.rfind(" ", 0, room))
        if cut < room // 2:
            cut = room
        parts.append(rest[:cut].rstrip())
        rest = rest[cut:].lstrip()
    return [MARKER + p for p in parts if p.strip()]


# ---- state ---------------------------------------------------------------------------------------

def load_state() -> dict:
    try:
        with open(os.path.join(STATE_DIR, "state.json"), encoding="utf-8") as fh:
            state = json.load(fh)
    except (OSError, ValueError):
        state = {}
    state.setdefault("initialized", False)
    state.setdefault("seen", [])
    state.setdefault("recentOut", [])
    state.setdefault("pending", [])
    state.setdefault("sentToday", {"date": "", "count": 0})
    state.setdefault("ceilingNoticeDate", "")
    return state


def save_state(state: dict) -> None:
    os.makedirs(STATE_DIR, mode=0o700, exist_ok=True)
    state["seen"] = state["seen"][-SEEN_KEEP:]
    state["recentOut"] = state["recentOut"][-RECENT_OUT_KEEP:]
    path = os.path.join(STATE_DIR, "state.json")
    tmp = path + ".tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=1)
    os.replace(tmp, path)


def classify(msg: dict, state: dict, now: float) -> str:
    body = msg.get("body") or ""
    if body.lstrip().startswith("[V]") or digest(body) in state["recentOut"]:
        return "own-reply"
    if msg.get("fromMe") is False:
        return "not-from-steven"  # a self-chat only ever holds his own messages
    if now - float(msg.get("timestamp") or 0) > MAX_AGE_S:
        return "stale"
    if (msg.get("type") or "text") not in TEXT_TYPES:
        return "not-text"
    if not body.strip():
        return "empty"
    return "steven"


# ---- Vanessa -------------------------------------------------------------------------------------

def ask_vanessa(body: str, sent_ts: float, args) -> tuple:
    """(reply_text, None) or (None, short_reason). The message goes in on stdin, never on argv."""
    cmd = [args.claude, "-p", "--output-format", "json", "--permission-mode", "dontAsk",
           "--allowedTools", READ_TOOLS, "--disallowedTools", EXEC_TOOLS_OFF,
           "--no-session-persistence"]
    agent = os.environ.get("VANESSA_BRIDGE_AGENT", "vanessa-orchestrator")
    if agent and os.path.exists(os.path.join(HOME, ".claude", "agents", agent + ".md")):
        cmd += ["--agent", agent]
    if os.environ.get("VANESSA_BRIDGE_MODEL"):
        cmd += ["--model", os.environ["VANESSA_BRIDGE_MODEL"]]
    prompt = PROMPT.format(when=when_text(sent_ts), body=body)
    try:
        out = subprocess.run(cmd, input=prompt, capture_output=True, text=True,
                             timeout=ANSWER_TIMEOUT_S, cwd=args.repo or None)
    except subprocess.TimeoutExpired:
        return None, "Claude took longer than %d minutes" % (ANSWER_TIMEOUT_S // 60)
    except OSError:
        return None, "Claude Code is not reachable on the Mac"
    res = {}
    raw = out.stdout.strip()
    for candidate in (raw, raw.splitlines()[-1] if raw else ""):
        try:
            res = json.loads(candidate)
            break
        except ValueError:
            continue
    text = res.get("result") if isinstance(res, dict) else None
    if out.returncode == 0 and isinstance(text, str) and text.strip() and not res.get("is_error"):
        return text.strip(), None
    why = (isinstance(text, str) and text) or out.stderr or "no answer"
    why = " ".join(why.split())[:120]
    if re.search(r"limit|rate|usage|quota", why, re.I):
        why = "Claude usage limit: " + why
    return None, why


# ---- one poll ------------------------------------------------------------------------------------

class Poll:
    def __init__(self, args, key: str, sid: str, me: str, now: float):
        self.args, self.key, self.sid, self.me, self.now = args, key, sid, me, now
        self.sent = 0

    def send(self, state: dict, text: str) -> bool:
        """Send one part. Enforces the daily ceiling; the last slot of the day is the notice."""
        day = local_day(self.now)
        if state["sentToday"].get("date") != day:
            state["sentToday"] = {"date": day, "count": 0}
        count = state["sentToday"]["count"]
        if count >= DAILY_CEILING:
            return False
        if count == DAILY_CEILING - 1:
            text = MARKER + NOTICE_CEILING.format(n=DAILY_CEILING)
        state["recentOut"].append(digest(text))  # before the send: the echo must never look new
        state["sentToday"]["count"] = count + 1
        save_state(state)
        code, _ = call("POST", "/sessions/%s/messages/send-text" % quote(self.sid), self.key,
                       {"chatId": self.me, "text": text})
        ok = 200 <= code < 300
        log("send", ok=ok, http=code, chars=len(text), sentToday=count + 1)
        if ok:
            self.sent += 1
        if count + 1 >= DAILY_CEILING:
            state["ceilingNoticeDate"] = day
            log("ceiling", sentToday=count + 1)
            return False
        return ok

    def reply(self, state: dict, text: str) -> bool:
        for part in split_parts(text):
            if not self.send(state, part):
                return False
        return True

    def run(self, state: dict, rows: list) -> None:
        seen = set(state["seen"])
        if not state["initialized"]:
            state["seen"] = [digest(m["id"]) for m in rows]
            state["initialized"] = True
            save_state(state)
            log("initialized", backlog=len(rows))
            return
        by_id = {digest(m["id"]): m for m in rows}
        fresh = []
        for m in rows:
            hid = digest(m["id"])
            if hid in seen:
                continue
            state["seen"].append(hid)
            kind = classify(m, state, self.now)
            if kind in ("steven", "not-text"):
                fresh.append((hid, m, kind))
            else:
                log("ignored", id=hid[:10], reason=kind)
        if len(fresh) > PER_POLL_CAP:
            for hid, _, _ in fresh[:-PER_POLL_CAP]:
                log("skipped", id=hid[:10], reason="per-poll cap")
            fresh = fresh[-PER_POLL_CAP:]
        for hid, m, kind in fresh:
            state["pending"].append({"id": hid, "ts": float(m.get("timestamp") or self.now),
                                     "kind": kind, "attempts": 0, "next": 0})
        save_state(state)

        answered = 0
        for item in list(state["pending"]):
            if answered >= PER_POLL_CAP or item["next"] > self.now:
                continue
            msg = by_id.get(item["id"])
            if msg is None:  # scrolled out of the window: say so once, then drop it
                state["pending"].remove(item)
                log("dropped", id=item["id"][:10], reason="no longer in the recent history")
                self.reply(state, NOTICE_FAILED.format(when=when_text(item["ts"]),
                                                       why="it scrolled out of the recent history"))
                continue
            if item["kind"] == "not-text":
                state["pending"].remove(item)
                answered += 1
                self.reply(state, NOTICE_NONTEXT)
                continue
            item["attempts"] += 1
            started = time.time()
            text, why = ask_vanessa(msg.get("body") or "", item["ts"], self.args)
            answered += 1
            if text:
                state["pending"].remove(item)
                log("answered", id=item["id"][:10], chars=len(text), secs=round(time.time() - started))
                self.reply(state, text)
            elif item["attempts"] >= RETRY_LIMIT:
                state["pending"].remove(item)
                log("failed", id=item["id"][:10], attempts=item["attempts"], why=why)
                self.reply(state, NOTICE_FAILED.format(when=when_text(item["ts"]), why=why))
            else:
                item["next"] = self.now + RETRY_GAP_S
                log("retry-later", id=item["id"][:10], attempts=item["attempts"], why=why)
            save_state(state)
        save_state(state)


def run_once(args) -> int:
    """One poll. Returns the seconds to wait before the next one."""
    key, sid, me = load_config()
    if not (key and sid and me):
        log("not-configured", key=bool(key), sid=bool(sid), me=bool(me))
        return 300
    rows, code = read_history(key, sid, me)
    if rows is None:
        log("read-failed", http=code)
        if code in (401, 403):
            _CONFIG_CACHE["at"] = 0.0
        return 60 if code in (0, 409, 503) else 300
    state = load_state()
    if state["sentToday"].get("date") == local_day(time.time()) and \
            state["sentToday"].get("count", 0) >= DAILY_CEILING:
        # Ceiling reached: keep the cursor moving so nothing piles up, answer nothing until tomorrow.
        known = set(state["seen"])
        state["seen"].extend(digest(m["id"]) for m in rows if digest(m["id"]) not in known)
        save_state(state)
        return args.poll
    Poll(args, key, sid, me, time.time()).run(state, rows)
    return args.poll


# ---- entry points --------------------------------------------------------------------------------

def check(args) -> int:
    """Self-test. Prints PASS/FAIL lines, never a key, a number or a message, and sends nothing."""
    ok = True

    def line(label: str, passed: bool, note: str = "") -> None:
        nonlocal ok
        ok = ok and passed
        print("   %-34s %s%s" % (label, "PASS" if passed else "FAIL", (" — " + note) if note else ""))

    key, sid, me = load_config()
    line("Vanessa's key in the Keychain", bool(key), "" if key else "run setup-phone.sh first")
    line("bridge settings in the Keychain", bool(sid and me), "" if sid and me else "run install-bridge.sh")
    code, data = call("GET", "/health")
    line("OpenWA answers on this Mac", code == 200, "" if code == 200 else "http %s" % code)
    if key and sid and me:
        rows, code = read_history(key, sid, me)
        line("reads your self-chat", rows is not None,
             "%d recent messages" % len(rows) if rows is not None else "http %s" % code)
    found = bool(args.claude) and os.access(args.claude, os.X_OK)
    line("Claude Code found", found, args.claude if found else "pass --claude /path/to/claude")
    agent = os.path.exists(os.path.join(HOME, ".claude", "agents", "vanessa-orchestrator.md"))
    print("   %-34s %s" % ("vanessa-orchestrator agent", "found" if agent else
                           "not found — answers without the agent (CLAUDE.md still loads)"))
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="self-test, sends nothing")
    mode.add_argument("--once", action="store_true", help="one poll, then exit")
    mode.add_argument("--loop", action="store_true", help="poll forever (launchd)")
    ap.add_argument("--repo", default=os.getcwd(), help="Steven's Repo folder (CLAUDE.md loads from here)")
    ap.add_argument("--claude", default=os.environ.get("VANESSA_BRIDGE_CLAUDE", ""),
                    help="absolute path to the claude CLI")
    ap.add_argument("--poll", type=int, default=20, help="seconds between polls (default 20)")
    args = ap.parse_args()
    if not args.claude:
        for cand in ("~/.local/bin/claude", "~/.claude/local/claude", "/opt/homebrew/bin/claude",
                     "/usr/local/bin/claude"):
            path = os.path.expanduser(cand)
            if os.access(path, os.X_OK):
                args.claude = path
                break
    if args.check:
        return check(args)

    os.makedirs(STATE_DIR, mode=0o700, exist_ok=True)
    lock = open(os.path.join(STATE_DIR, "bridge.lock"), "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        print("another vanessa-bridge is already running", file=sys.stderr)
        return 0
    if args.once:
        run_once(args)
        return 0
    log("started", poll=args.poll)
    wait = args.poll
    while True:
        try:
            wait = run_once(args)
        except Exception as err:  # keep the bridge alive; the log says what broke
            log("error", kind=type(err).__name__, detail=str(err)[:160])
            wait = 60
        time.sleep(wait + random.uniform(0, 3))


if __name__ == "__main__":
    sys.exit(main())
