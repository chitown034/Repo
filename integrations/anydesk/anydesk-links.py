#!/usr/bin/env python3
"""anydesk-links.py - labels + AnyDesk IDs -> anydesk: deep links, a markdown table, a dashboard JSON blob.

Reads a LOCAL file (default ~/.config/anydesk-links/devices.json) that must never live in the repo:
    {"devices": [{"label": "Mac 1", "id": "123 456 789"}, ...]}
It stores and prints NO passwords. A file that contains a key named like a password, pwd, secret
or token is refused outright (not read past the check). Stdlib only, Python 3.8+.

Commands:
    links  (default)   one line per device:  <label>  anydesk:<id>
    table              markdown table for pasting into notes (labels, ids, links)
    json               one JSON blob for the dashboard (labels + ids + links, nothing else)
    open <label>       open that device's anydesk: link in the OS default handler (needs AnyDesk installed)
    check              validate the file and say what is wrong, change nothing
Options:  --file PATH   use another devices file (still must be outside the repo)
          --dry-run     with `open`: print what would be opened, open nothing
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

DEFAULT_FILE = Path("~/.config/anydesk-links/devices.json").expanduser()
MAX_BYTES = 64 * 1024
ID_RE = re.compile(r"^[0-9]{9,10}$")  # AnyDesk numeric IDs; aliases like name@ad are rejected on purpose
FORBIDDEN_KEY_RE = re.compile(r"(pass(word|wd|code)?|pwd|secret|token|credential|apikey|api_key)", re.I)
ALLOWED_DEVICE_KEYS = {"label", "id"}


class LinkError(ValueError):
    """Bad input. The message is safe to print (never contains file contents beyond a label/id)."""


def normalize_id(raw):
    """'123 456 789' -> '123456789'. Only digits and plain spaces are accepted in the input."""
    if not isinstance(raw, str):
        raise LinkError("id must be a string like '123 456 789'")
    if re.search(r"[^0-9 ]", raw):
        raise LinkError("id may contain only digits and spaces")
    digits = raw.replace(" ", "")
    if not ID_RE.match(digits):
        raise LinkError("id must be 9 or 10 digits")
    return digits


def format_id(digits):
    if len(digits) == 9:
        return "%s %s %s" % (digits[0:3], digits[3:6], digits[6:9])
    return "%s %s %s" % (digits[0:4], digits[4:7], digits[7:10])


def make_link(raw_id):
    """The only link shape this tool ever produces: anydesk:<digits>."""
    return "anydesk:" + normalize_id(raw_id)


def clean_label(raw):
    if not isinstance(raw, str):
        raise LinkError("label must be a string")
    label = " ".join(re.sub(r"[^A-Za-z0-9 ._()+-]", "", raw).split())
    if not label:
        raise LinkError("label is empty after removing unsupported characters")
    return label[:40]


def _walk_keys(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield (path + "/" + str(k)), str(k)
            for item in _walk_keys(v, path + "/" + str(k)):
                yield item
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            for item in _walk_keys(v, "%s[%d]" % (path, i)):
                yield item


def reject_secret_keys(data):
    for path, key in _walk_keys(data):
        if FORBIDDEN_KEY_RE.search(key):
            raise LinkError("refused: the file has a key named like a secret (%s). "
                            "This tool never reads or stores passwords - remove it." % key[:30])


def repo_root_of(start):
    p = Path(start).resolve()
    for cand in [p] + list(p.parents):
        if (cand / ".git").exists():
            return cand
    return None


def refuse_if_in_repo(path):
    """The real devices file must not sit inside a git working tree (it could be committed)."""
    here_repo = repo_root_of(Path(__file__).parent)
    target = Path(path).resolve()
    if here_repo is not None and (target == here_repo or here_repo in target.parents):
        if target.name == "devices.example.json":
            return
        raise LinkError("refused: %s is inside the repo. Keep the real file in ~/.config/anydesk-links/." % target.name)


def load_devices(path=None):
    path = Path(path).expanduser() if path else DEFAULT_FILE
    refuse_if_in_repo(path)
    if not path.exists():
        raise LinkError("no devices file at %s. Copy devices.example.json there and fill in your real IDs." % path)
    if path.stat().st_size > MAX_BYTES:
        raise LinkError("devices file is unexpectedly large; refusing")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise LinkError("cannot read devices file as JSON: %s" % exc.__class__.__name__)
    reject_secret_keys(data)
    if not isinstance(data, dict) or not isinstance(data.get("devices"), list):
        raise LinkError('devices file must look like {"devices": [{"label": "...", "id": "..."}]}')
    out, seen = [], set()
    for i, d in enumerate(data["devices"], 1):
        if not isinstance(d, dict):
            raise LinkError("device #%d is not an object" % i)
        extra = set(d) - ALLOWED_DEVICE_KEYS
        if extra:
            raise LinkError("device #%d has unsupported key(s): %s (only label and id are allowed)"
                            % (i, ", ".join(sorted(str(k)[:20] for k in extra))))
        label = clean_label(d.get("label"))
        digits = normalize_id(d.get("id"))
        if label.lower() in seen:
            raise LinkError("duplicate label: %s" % label)
        seen.add(label.lower())
        out.append({"label": label, "id": format_id(digits), "link": "anydesk:" + digits})
    return out


def warn_if_open_permissions(path):
    if os.name != "posix" or Path(path).name == "devices.example.json":
        return
    try:
        mode = Path(path).expanduser().stat().st_mode & 0o077
    except OSError:
        return
    if mode:
        sys.stderr.write("note: %s is readable by other users; run: chmod 600 %s\n" % (path, path))


def render_links(devices):
    return "\n".join("%-14s %s" % (d["label"], d["link"]) for d in devices)


def render_table(devices):
    rows = ["| Device | AnyDesk ID | Link |", "|---|---|---|"]
    for d in devices:
        rows.append("| %s | %s | `%s` |" % (d["label"].replace("|", "/"), d["id"], d["link"]))
    return "\n".join(rows)


def render_json(devices):
    blob = {
        "kind": "anydeskLinks",
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "devices": [{"label": d["label"], "id": d["id"], "link": d["link"]} for d in devices],
    }
    return json.dumps(blob, separators=(",", ":"))


def open_link(devices, label, dry_run=False):
    match = [d for d in devices if d["label"].lower() == label.strip().lower()]
    if not match:
        raise LinkError("no device labelled %r. Known: %s" % (label[:40], ", ".join(d["label"] for d in devices)))
    link = match[0]["link"]
    if not re.match(r"^anydesk:[0-9]{9,10}$", link):
        raise LinkError("internal check failed: bad link")
    if dry_run:
        return "DRY-RUN would open " + link
    if sys.platform.startswith("win"):
        os.startfile(link)  # noqa: S606 - fixed anydesk:<digits> shape only
    elif sys.platform == "darwin":
        subprocess.run(["open", link], check=False)
    else:
        subprocess.run(["xdg-open", link], check=False)
    return "Opened " + link + " (AnyDesk will ask for the password itself; this tool never handles it)"


def main(argv=None):
    ap = argparse.ArgumentParser(description="AnyDesk deep links from a local devices file. No passwords, ever.")
    ap.add_argument("command", nargs="?", default="links", choices=["links", "table", "json", "open", "check"])
    ap.add_argument("label", nargs="?", help="device label for `open`")
    ap.add_argument("--file", help="devices file (default ~/.config/anydesk-links/devices.json)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)
    try:
        devices = load_devices(args.file)
        warn_if_open_permissions(args.file or DEFAULT_FILE)
        if args.command == "links":
            print(render_links(devices))
        elif args.command == "table":
            print(render_table(devices))
        elif args.command == "json":
            print(render_json(devices))
        elif args.command == "check":
            print("ok: %d device(s), no secrets keys, ids valid" % len(devices))
        else:
            if not args.label:
                raise LinkError("usage: anydesk-links.py open <label>")
            print(open_link(devices, args.label, args.dry_run))
    except LinkError as exc:
        sys.stderr.write("anydesk-links: %s\n" % exc)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
