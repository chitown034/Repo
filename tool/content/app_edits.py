"""App-specific edits applied after convert.py, so a site refresh keeps them.

- No street address in the app.
- "Temecula" is kept as a place name (relocation, Vet Center) but not where it says where
  the organization is based.
- The Contact page's day-by-day hours become one line.
- Empty category-heading lists left by the website's search widget are dropped.
- Sentences split around links are rejoined; "[link] description" pairs become resource rows;
  stray one-letter lines and headings with nothing under them are dropped.

Usage: python3 -I app_edits.py <site.json>   (edits the file in place)
"""
import json
import re
import sys

ORG_LOCATION = [
    (" · Temecula, CA · ", " · "),
    ("a 501(c)(3) nonprofit based in Temecula, California (EIN", "a 501(c)(3) nonprofit (EIN"),
    ("is a Temecula, California 501(c)(3) nonprofit", "is a Southern California 501(c)(3) nonprofit"),
    ("proud to be a Temecula, California 501(c)(3) nonprofit", "proud to be a Southern California 501(c)(3) nonprofit"),
    ("based in Temecula, California", "based in Southern California"),
]
ADDRESS = re.compile(r"41150 Crooked Stick|Temecula, CA 92591", re.I)
DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


def fix_text(s):
    for a, b in ORG_LOCATION:
        s = s.replace(a, b)
    return s


def walk(x):
    if isinstance(x, dict):
        return {k: walk(v) for k, v in x.items()}
    if isinstance(x, list):
        return [walk(v) for v in x]
    if isinstance(x, str):
        return fix_text(x)
    return x


def compact_hours(blocks):
    out, i = [], 0
    while i < len(blocks):
        b = blocks[i]
        if b.get("t") == "text" and b.get("text") == "Hours":
            seq = blocks[i + 1:i + 15]
            pairs = [(seq[k].get("text"), seq[k + 1].get("text")) for k in range(0, len(seq) - 1, 2)]
            if len(pairs) == 7 and [d for d, _ in pairs] == DAYS:
                open_days = [(d, h) for d, h in pairs if h != "Closed"]
                hours = {h for _, h in open_days}
                if len(hours) == 1 and open_days:
                    h = hours.pop().replace(" - ", " to ").replace("PST", "Pacific")
                    closed = [d for d, t in pairs if t == "Closed"]
                    if closed == ["Sunday", "Saturday"]:
                        closed = ["Saturday", "Sunday"]
                    line = f"Hours: {open_days[0][0]} to {open_days[-1][0]}, {h}."
                    if closed:
                        line += " Closed " + " and ".join(closed) + "."
                    out.append({"t": "text", "text": line})
                    i += 15
                    continue
        out.append(b)
        i += 1
    return out


def drop_empty_heading_lists(blocks):
    """Website search widgets leave a list of category headings with nothing under them
    (and a "Resources Search" label). Drop runs of 4+ same-level headings with no content."""
    blocks = [b for b in blocks if not (b.get("t") == "h" and b.get("text", "").strip() == "Resources Search")]
    out, i = [], 0
    while i < len(blocks):
        j = i
        while j < len(blocks) and blocks[j].get("t") == "h" and blocks[j].get("level") == blocks[i].get("level"):
            j += 1
        if blocks[i].get("t") == "h" and j - i >= 4:
            i = j
            continue
        out.append(blocks[i])
        i += 1
    return out


CONTINUES = re.compile(r"^[,.;:)!?]|^(or|and|to|for|at|on|in|with|then|so)\b|^[a-z]")


def link_descriptions(blocks):
    """'[Hire Heroes USA] free mock interviews with a career coach' becomes one resource row."""
    out, i = [], 0
    while i < len(blocks):
        b = blocks[i]
        nxt = blocks[i + 1] if i + 1 < len(blocks) else None
        if (b.get("t") == "link" and nxt and nxt.get("t") == "text"
                and re.match(r"^[a-z]", nxt["text"].strip()) and len(nxt["text"].strip()) > 20):
            d = nxt["text"].strip()
            out.append({"t": "card", "title": b["text"], "desc": d[0].upper() + d[1:], "url": b["url"]})
            i += 2
            continue
        out.append(b)
        i += 1
    return out


def merge_link_sentences(blocks):
    """'Join our free' [VA Home Buying Webinar] ', or' [contact us] becomes one sentence,
    with the links as buttons right after it."""
    out, i = [], 0
    while i < len(blocks):
        j = i
        while (j < len(blocks) and blocks[j].get("t") in ("text", "link")
               and (j == i or blocks[j]["t"] != blocks[j - 1]["t"])):
            j += 1
        seg = blocks[i:j]
        ok = (len(seg) >= 3 and any(b["t"] == "link" for b in seg)
              and not (seg[0]["t"] == "text" and (re.search(r"[.!?]$", seg[0]["text"].strip())
                                                  or CONTINUES.match(seg[0]["text"].strip())))
              and all(len(b["text"].strip()) <= 20 for b in seg[1:] if b["t"] == "text")
              and any(b["t"] == "text" and CONTINUES.match(b["text"].strip()) for b in seg[1:]))
        if not ok:
            out.append(blocks[i])
            i += 1
            continue
        sentence = re.sub(r"\s+([,.;:!?)])", r"\1", " ".join(b["text"].strip() for b in seg))
        if not re.search(r"[.!?]$", sentence):
            sentence += "."
        out.append({"t": "text", "text": sentence})
        out.extend(dict(b, text=b["text"][:1].upper() + b["text"][1:]) for b in seg if b["t"] == "link")
        i = j
    return out


def drop_stray_letters(blocks):
    """Big decorative letters (the S, T, A, R of the STAR method) arrive as one-letter lines."""
    return [b for b in blocks if not (b.get("t") == "text" and re.fullmatch(r"[A-Z]", b.get("text", "").strip()))]


def drop_empty_headings(blocks):
    """A heading with nothing under it (the next block is a heading of the same or higher level)."""
    out = []
    for i, b in enumerate(blocks):
        nxt = blocks[i + 1] if i + 1 < len(blocks) else None
        if b.get("t") == "h" and (nxt is None or (nxt.get("t") == "h" and nxt.get("level", 9) <= b.get("level", 9))):
            continue
        out.append(b)
    return out


# Pages whose screens read headings directly (people, quotes, home sections).
KEEP_HEADINGS = {"board-members", "testimonials", "home"}


def main(path):
    site = json.load(open(path, encoding="utf-8"))
    site = walk(site)
    for slug, page in site.items():
        blocks = compact_hours(page["blocks"])
        if slug.endswith("-county") or slug.startswith("clark-county"):  # county guides only
            blocks = drop_empty_heading_lists(blocks)
        blocks = drop_stray_letters(merge_link_sentences(link_descriptions(blocks)))
        if slug not in KEEP_HEADINGS:
            blocks = drop_empty_headings(blocks)
        page["blocks"] = [b for b in blocks
                          if not ADDRESS.search(json.dumps(b, ensure_ascii=False))]
    json.dump(site, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    main(sys.argv[1])
