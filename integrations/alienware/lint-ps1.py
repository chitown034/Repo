#!/usr/bin/env python3
"""Static checker for alienware-setup.ps1 (stdlib only).

PowerShell is never executed here. This tokenizer-based check catches the mistakes a Linux sandbox
can catch: unbalanced braces/parens/brackets, unterminated strings and here-strings, non-ASCII
bytes (Windows PowerShell 5.1 reads BOM-less files as ANSI), PowerShell 7-only syntax, and
dangerous patterns (dynamic code, download-and-run, baked-in policy changes, public IPs).

Usage: python3 lint-ps1.py [file.ps1 ...]      (default: alienware-setup.ps1 next to this file)
Exit 0 = clean, 1 = findings.
"""
import re
import sys
from pathlib import Path

PAIRS = {"{": "}", "(": ")", "[": "]"}
CLOSERS = {v: k for k, v in PAIRS.items()}


def strip_and_check(src):
    """Return (code_only_text, findings). Strings/comments are blanked out of code_only_text
    (keeping newlines) so later regex checks do not trip on prose. Brackets are balanced here."""
    findings = []
    out = []
    i, n, line = 0, len(src), 1
    stack = []  # (char, line) for code brackets
    # mode stack for double-quoted strings containing $( ... ): each entry is a bracket depth

    def blank(c):
        return "\n" if c == "\n" else " "

    def scan_dq(i, line, start_line):
        """Scan a double-quoted string starting after the opening quote. May recurse for $( )."""
        nonlocal n
        while i < n:
            c = src[i]
            if c == "\n":
                line += 1
            if c == "`":
                out.append(blank(c))
                if i + 1 < n:
                    out.append(blank(src[i + 1]))
                    if src[i + 1] == "\n":
                        line += 1
                i += 2
                continue
            if c == '"':
                if i + 1 < n and src[i + 1] == '"':
                    out.append("  ")
                    i += 2
                    continue
                out.append(" ")
                return i + 1, line, True
            if c == "$" and i + 1 < n and src[i + 1] == "(":
                out.append("  ")
                i += 2
                i, line = scan_code(i, line, depth_open=1)
                continue
            out.append(blank(c))
            i += 1
        findings.append((start_line, "unterminated double-quoted string"))
        return i, line, False

    def scan_code(i, line, depth_open=0):
        """Scan code. If depth_open>0 we are inside $( ... ) and return when it closes."""
        nonlocal n
        local_depth = depth_open
        while i < n:
            c = src[i]
            if c == "\n":
                line += 1
                out.append("\n")
                i += 1
                continue
            # block comment
            if src.startswith("<#", i):
                j = src.find("#>", i + 2)
                if j < 0:
                    findings.append((line, "unterminated block comment"))
                    j = n - 2
                seg = src[i:j + 2]
                line += seg.count("\n")
                out.append("".join(blank(ch) for ch in seg))
                i = j + 2
                continue
            # line comment (a '#' that starts a token)
            if c == "#" and (i == 0 or src[i - 1] in " \t\n;({"):
                j = src.find("\n", i)
                if j < 0:
                    j = n
                out.append(" " * (j - i))
                i = j
                continue
            # here-strings
            if c == "@" and i + 1 < n and src[i + 1] in "'\"" and re.match(r"[ \t]*\r?\n", src[i + 2:i + 40] or ""):
                q = src[i + 1]
                m = re.compile(r"\r?\n" + q + "@").search(src, i + 2)
                if not m:
                    findings.append((line, "unterminated here-string"))
                    out.append(" " * (n - i))
                    return n, line
                seg = src[i:m.end()]
                line += seg.count("\n")
                out.append("".join(blank(ch) for ch in seg))
                i = m.end()
                continue
            if c == "'":
                start = line
                j = i + 1
                while True:
                    if j >= n:
                        findings.append((start, "unterminated single-quoted string"))
                        break
                    if src[j] == "'":
                        if j + 1 < n and src[j + 1] == "'":
                            j += 2
                            continue
                        break
                    if src[j] == "\n":
                        line += 1
                    j += 1
                seg = src[i:j + 1]
                out.append("".join(blank(ch) for ch in seg))
                i = j + 1
                continue
            if c == '"':
                out.append(" ")
                i, line, _ = scan_dq(i + 1, line, line)
                continue
            if c == "`":
                out.append("  ")
                if i + 1 < n and src[i + 1] == "\n":
                    line += 1
                i += 2
                continue
            if c in PAIRS:
                stack.append((c, line))
                if depth_open and c == "(":
                    local_depth += 1
            elif c in CLOSERS:
                if not stack:
                    findings.append((line, "unmatched closing '%s'" % c))
                else:
                    o, ol = stack.pop()
                    if o != CLOSERS[c]:
                        findings.append((line, "'%s' closes '%s' opened on line %d" % (c, o, ol)))
                if depth_open and c == ")":
                    local_depth -= 1
                    if local_depth == 0:
                        out.append(" ")
                        return i + 1, line
            out.append(c)
            i += 1
        return i, line

    i, line = scan_code(0, 1)
    for o, ol in stack:
        findings.append((ol, "unclosed '%s'" % o))
    return "".join(out), findings


FORBIDDEN = [
    (r"\bInvoke-Expression\b", "Invoke-Expression is forbidden"),
    (r"(?i)(?<![A-Za-z0-9_-])iex(?![A-Za-z0-9_-])", "iex alias is forbidden"),
    (r"(?i)Bypass", "execution-policy Bypass must not appear"),
    (r"(?i)-ExecutionPolicy", "do not pass -ExecutionPolicy to child processes"),
    (r"(?i)Set-ExecutionPolicy", "Set-ExecutionPolicy must only appear in printed text"),
    (r"(?i)\bStart-Transcript\b", "Start-Transcript would capture typed secrets"),
    (r"(?i)DownloadString|DownloadFile|\birm\b|Invoke-RestMethod[^\n]*\|\s*(iex|Invoke-Expression)", "download-and-run pattern"),
    (r"(?i)\bInvoke-WebRequest\b[^\n]*-OutFile", "do not download files directly; use winget/git/pip"),
    (r"&&|\|\|", "&& and || are PowerShell 7 only"),
    (r"\?\?|\?\.", "?? and ?. are PowerShell 7 only"),
    (r"(?i)ForEach-Object\s+-Parallel", "-Parallel is PowerShell 7 only"),
    (r"(?i)-AsPlainText", "-AsPlainText must not be used"),
    (r"(?i)\bAdd-Type\b", "no Add-Type (compiles code at run time)"),
    (r"(?i)\[scriptblock\]::Create|\.Invoke\(\)", "no dynamic scriptblocks"),
    (r"(?i)-EncodedCommand|\s-enc\s", "no encoded commands"),
    (r"(?i)Remove-Item[^\n]*-Recurse", "no recursive deletes"),
    (r"(?i)--dangerously", "no dangerous flags"),
]


def lint(path):
    src = Path(path).read_text(encoding="utf-8")
    findings = []
    for ln, text in enumerate(src.split("\n"), 1):
        if re.search(r"[^\x00-\x7F]", text):
            findings.append((ln, "non-ASCII character (PS 5.1 would misread it)"))
    code, f2 = strip_and_check(src)
    findings.extend(f2)
    lines = code.split("\n")
    for ln, text in enumerate(lines, 1):
        for pat, msg in FORBIDDEN:
            if re.search(pat, text):
                findings.append((ln, msg))
    # strings-only checks on the original text
    orig = src.split("\n")
    for ln, text in enumerate(orig, 1):
        s = text.strip()
        if s.startswith("#") or s.startswith("<#"):
            continue
        # Set-ExecutionPolicy may appear only inside printed messages (single-quoted) or comments
        if re.search(r"(?i)Invoke-Expression|\biex\b", text) and not text.strip().startswith(("#", ".")):
            findings.append((ln, "dynamic-execution word in text"))
        for m in re.finditer(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", text):
            ip = m.group(0)
            o = [int(x) for x in ip.split(".")]
            if any(x > 255 for x in o):
                continue
            private = (o[0] in (10, 127, 0) or (o[0] == 172 and 16 <= o[1] <= 31)
                       or (o[0] == 192 and o[1] == 168) or (o[0] == 100 and 64 <= o[1] <= 127)
                       or (o[0] == 169 and o[1] == 254))
            if not private:
                findings.append((ln, "possible public IP literal: " + ip))
    # required safety settings
    need = [
        (r"Set-StrictMode\s+-Version\s+Latest", "Set-StrictMode -Version Latest missing"),
        (r"\$ErrorActionPreference\s*=\s*'Stop'", "$ErrorActionPreference = 'Stop' missing"),
        (r"ValidateSet\('Doctor',\s*'Install',\s*'Report',\s*'OrcaServe',\s*'OrcaPair'\)", "Action ValidateSet missing"),
        (r"\[switch\]\$DryRun", "-DryRun switch missing"),
        (r"-AsSecureString", "hidden prompt (-AsSecureString) missing for pairing link"),
        (r"REFUSED", "refusal messages missing"),
        (r"Test-PrivateAddress", "address policy missing"),
    ]
    for pat, msg in need:
        if not re.search(pat, src):
            findings.append((0, msg))
    # the grant flag must never be passed to orca: only appear as the refusal switch
    for ln, text in enumerate(code.split("\n"), 1):
        if re.search(r"grant-desktop-control", text):
            findings.append((ln, "--grant-desktop-control used in code (must only appear in messages)"))
    # every pattern "Say 'literal' + $x" (unparenthesised concatenation as command args)
    for ln, text in enumerate(orig, 1):
        if re.match(r"\s*(Say|Say-Ok|Say-Warn|Say-Info|Say-Bad)\s+'[^']*'\s*\+", text):
            findings.append((ln, "unparenthesised string concatenation in a command call"))
    return sorted(set(findings))


def main(argv):
    files = argv[1:] or [str(Path(__file__).with_name("alienware-setup.ps1"))]
    bad = 0
    for f in files:
        res = lint(f)
        if not res:
            print("lint-ps1: %s: clean" % f)
        else:
            bad += len(res)
            for ln, msg in res:
                print("lint-ps1: %s:%s: %s" % (f, ln if ln else "-", msg))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
