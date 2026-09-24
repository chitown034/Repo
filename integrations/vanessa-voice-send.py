#!/usr/bin/env python3
"""vanessa-voice-send.py — deliver one rendered Vanessa voice note to an iMessage thread.

WHY THIS EXISTS
    integrations/mac-task-specs.md §6b (first version) told voice-reply-render to put the MP3's
    base64 straight into `inkbox_media_stage`. Measured 2026-09-24: the one real clip in the store
    (voiceReply_teststeve01_0, 27 s, 108,284 bytes) is 144,380 base64 characters and **135,424
    tokens**. A model cannot emit that in one tool call, and at ~270K tokens per voice note it
    would not be affordable if it could. So the model decides WHAT to voice; this script moves
    the bytes. The model never sees the audio.

HOW (every call below was read from the Inkbox Python SDK 0.7.7 source, MIT, not inferred)
    Inkbox()                                  api key from INKBOX_API_KEY or ~/.inkbox/config
      .get_identity(handle)                   Vanessa's identity ("jasmine")
      .upload_imessage_media(content=bytes)   multipart POST /media -> an Inkbox-hosted media_url
      .send_imessage(conversation_id=,        reply into the existing thread; `to` is mutually
                     media_urls=[url])        exclusive with conversation_id, so no phone number
                                              is ever needed or handled here

    Because Inkbox hosts the uploaded file itself, this avoids the wall R4 hit on 2026-09-23:
    Inkbox cannot fetch a private claude.ai URL, but it can fetch its own.

USAGE (on the Mac, from voice-reply-render — see mac-task-specs.md §6b)
    # the task first saves each part with ArtifactData get + out_dir, so nothing is retyped:
    vanessa-voice-send.py --conversation-id <replyTo> --parts DIR/voiceReply_<id>_*.json
    vanessa-voice-send.py --conversation-id <replyTo> --mp3 /path/clip.mp3
    add --dry-run to do everything except upload and send

SAFETY, enforced here rather than trusted to the queue item
    * The conversation must be listed in ~/.config/inkbox/voice-allow (one UUID per line).
      A queue item is shared-store data that the page and routines can write; this file is
      local to the Mac. A bad or injected `replyTo` is refused before any network call.
    * Exactly one send attempt. A duplicated voice note is worse than a missing one; retries
      are the task's decision, made with the outcome in front of it.
    * Stdout is ONE line of JSON. It never contains audio, the media URL (treat it as a
      capability URL), a phone number, or the API key.

EXIT CODES
    0 sent (or dry-run clean) · 2 usage · 3 bad input · 4 clip too large · 5 conversation not
    allow-listed · 6 Inkbox refused or failed · 7 inkbox SDK not installed

Written 2026-09-24. Tested here against the real 27 s clip with the SDK mocked at its network
boundary; NEVER run against live Inkbox by its author (inkbox.ai is egress-blocked from the cloud
sandbox, and there is no API key there). The first real run is Steven's.
"""
from __future__ import annotations

import argparse
import base64
import binascii
import glob
import json
import os
import re
import sys
from pathlib import Path

IMESSAGE_CAP = 10 * 1024 * 1024          # Inkbox: 10 MiB for purpose "imessage"
ALLOW_FILE = Path(os.environ.get("VANESSA_VOICE_ALLOW",
                                 str(Path.home() / ".config" / "inkbox" / "voice-allow")))
DEFAULT_IDENTITY = os.environ.get("VANESSA_INKBOX_IDENTITY", "jasmine")
UUID_RE = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


def emit(result: dict, code: int) -> "NoReturn":  # type: ignore[name-defined]
    """One line of JSON on stdout, then exit. The task parses this line and nothing else."""
    result.setdefault("ok", code == 0)
    print(json.dumps(result, sort_keys=True))
    sys.exit(code)


def load_allow_list() -> set[str]:
    if not ALLOW_FILE.is_file():
        return set()
    ids = set()
    for line in ALLOW_FILE.read_text().splitlines():
        line = line.split("#", 1)[0].strip()
        if line:
            ids.add(line.lower())
    return ids


def read_part(path: Path) -> tuple[int, int, bytes, float | None]:
    """A part file as ArtifactData `get` + `out_dir` saves it: {"v": {"audio": "data:...;base64,...",
    "part": n, "of": m, "durationSec": s, ...}}. Also tolerates the unwrapped body."""
    try:
        doc = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as e:
        raise ValueError(f"{path.name}: not readable JSON ({e.__class__.__name__})") from None
    body = doc.get("v", doc) if isinstance(doc, dict) else None
    if isinstance(body, dict) and "data" in body and "audio" not in body:
        body = body["data"].get("v", body["data"])
    if not isinstance(body, dict) or not isinstance(body.get("audio"), str):
        raise ValueError(f"{path.name}: no string `audio` field")
    audio = body["audio"]
    # The store keeps a data URI. Inkbox rejects the prefix, and so would base64 decoding.
    b64 = audio.split(",", 1)[1] if audio.startswith("data:") else audio
    try:
        raw = base64.b64decode(b64, validate=True)
    except (binascii.Error, ValueError):
        raise ValueError(f"{path.name}: `audio` is not valid base64") from None
    if not raw:
        raise ValueError(f"{path.name}: `audio` decodes to zero bytes")
    part = int(body.get("part", 0))
    of = int(body.get("of", 1))
    dur = body.get("durationSec")
    return part, of, raw, (float(dur) if isinstance(dur, (int, float)) else None)


def assemble(paths: list[Path]) -> tuple[bytes, int, float | None]:
    parts = [read_part(p) for p in paths]
    parts.sort(key=lambda t: t[0])
    ofs = {t[1] for t in parts}
    if len(ofs) != 1:
        raise ValueError(f"parts disagree on their total count: {sorted(ofs)}")
    of = ofs.pop()
    nums = [t[0] for t in parts]
    # Accept 0-based or 1-based numbering, but never a gap or a duplicate: a voice note missing
    # its middle is worse than no voice note.
    if nums not in (list(range(of)), list(range(1, of + 1))):
        raise ValueError(f"expected {of} parts numbered consecutively, got {nums}")
    # MP3 is a stream of self-contained frames, so byte concatenation plays as one clip.
    # Each part may carry its own ID3 header; players skip a mid-stream tag.
    clip = b"".join(t[2] for t in parts)
    durs = [t[3] for t in parts]
    total = sum(durs) if all(d is not None for d in durs) else None
    return clip, len(parts), total


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n", 1)[0])
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--parts", nargs="+", help="part JSON files saved by ArtifactData get + out_dir (globs ok)")
    src.add_argument("--mp3", help="a finished MP3 on disk")
    ap.add_argument("--conversation-id", required=True, help="the queue item's replyTo")
    ap.add_argument("--identity", default=DEFAULT_IDENTITY, help="Inkbox agent handle (default: %(default)s)")
    ap.add_argument("--filename", default="vanessa.mp3")
    ap.add_argument("--dry-run", action="store_true", help="validate and assemble; never upload or send")
    a = ap.parse_args()

    conv = a.conversation_id.strip()
    if not UUID_RE.match(conv):
        emit({"error": "conversation-id is not a UUID", "stage": "input"}, 2)

    # --- allow-list first: nothing else runs for a thread that is not Steven's --------------
    allowed = load_allow_list()
    if not allowed:
        emit({"error": f"no allow-list at {ALLOW_FILE} — refusing to send anywhere. Put Steven's "
                       "Vanessa-thread conversation UUID in it, one per line.",
              "stage": "allow-list"}, 5)
    if conv.lower() not in allowed:
        emit({"error": "conversation is not in the voice allow-list", "stage": "allow-list"}, 5)

    # --- assemble ------------------------------------------------------------------------------
    try:
        if a.mp3:
            clip = Path(a.mp3).read_bytes()
            nparts, dur = 1, None
        else:
            files: list[Path] = []
            for pat in a.parts:
                hits = sorted(glob.glob(pat))
                files.extend(Path(h) for h in (hits or [pat]))
            clip, nparts, dur = assemble(files)
    except (OSError, ValueError) as e:
        emit({"error": str(e), "stage": "assemble"}, 3)

    if not clip[:3] == b"ID3" and not (clip[0] == 0xFF and (clip[1] & 0xE0) == 0xE0):
        emit({"error": "assembled bytes do not start like an MP3 (no ID3 tag, no frame sync)",
              "stage": "assemble", "bytes": len(clip)}, 3)
    if len(clip) > IMESSAGE_CAP:
        # Never truncate mid-sentence: a clipped voice note says something she did not say.
        emit({"error": "clip too large for imessage", "stage": "assemble",
              "bytes": len(clip), "cap": IMESSAGE_CAP}, 4)

    summary = {"bytes": len(clip), "parts": nparts, "durationSec": dur, "identity": a.identity}
    if a.dry_run:
        emit({**summary, "dryRun": True, "sent": False}, 0)

    # --- upload, then exactly one send --------------------------------------------------------
    try:
        from inkbox import Inkbox  # imported late so --dry-run and the tests need no SDK
    except ImportError:
        emit({**summary, "error": "inkbox SDK not installed — pip install 'inkbox==0.7.7'",
              "stage": "import"}, 7)

    try:
        with Inkbox() as ib:  # INKBOX_API_KEY or ~/.inkbox/config; this script never reads it
            ident = ib.get_identity(a.identity)
            up = ident.upload_imessage_media(content=clip, filename=a.filename,
                                             content_type="audio/mpeg")
            if up.size is not None and int(up.size) != len(clip):
                emit({**summary, "error": f"upload size mismatch: sent {len(clip)}, Inkbox holds "
                                          f"{up.size} — not sending a clip that is not ours",
                      "stage": "upload"}, 6)
            msg = ident.send_imessage(conversation_id=conv, media_urls=[up.media_url])
    except Exception as e:  # the SDK raises InkboxError / InkboxAPIError and httpx errors
        # Verbatim class and message, but scrub anything that looks like a key.
        text = re.sub(r"ApiKey_[A-Za-z0-9_\-]+", "ApiKey_[redacted]", str(e))[:400]
        emit({**summary, "error": f"{e.__class__.__name__}: {text}", "stage": "inkbox"}, 6)

    emit({**summary, "sent": True, "messageId": str(getattr(msg, "id", "") or "") or None}, 0)


if __name__ == "__main__":
    main()
