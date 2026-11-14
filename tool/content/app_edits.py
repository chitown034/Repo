"""App-specific edits applied after convert.py, so a site refresh keeps them.

- No street address in the app.
- "Temecula" is kept as a place name (relocation, Vet Center) but not where it says where
  the organization is based.
- The Contact page's day-by-day hours become one line.

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


def main(path):
    site = json.load(open(path, encoding="utf-8"))
    site = walk(site)
    for page in site.values():
        page["blocks"] = [b for b in compact_hours(page["blocks"])
                          if not ADDRESS.search(json.dumps(b, ensure_ascii=False))]
    json.dump(site, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    main(sys.argv[1])
