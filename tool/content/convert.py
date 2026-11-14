"""Convert downloaded site pages into structured JSON content for the Flutter app.

Usage: python3 -I convert.py <pages_dir> <out_json>
"""
import json
import os
import re
import sys
from urllib.parse import urljoin

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

BASE = "https://www.veteransresourcenetwork.org"
BLOCK = {"p", "div", "li", "ul", "ol", "section", "table", "tr", "td", "th", "details",
         "iframe", "form", "h1", "h2", "h3", "h4", "h5", "h6", "article", "header",
         "footer", "nav", "figure", "blockquote", "dl", "dt", "dd"}
HEAD = {"h1", "h2", "h3", "h4", "h5", "h6"}
CTA = re.compile(r"^(learn more|visit site|open|read|read more|start|go|view|click here|more|"
                 r"apply|sign up|register|watch|details|see more|visit|explore|get started)\W*$", re.I)
SITEWIDE = [
    "Verified 501(c)(3) on Candid",
    "Active Duty Veteran and Hometown Hero Home-Owners Club, Inc. is a Temecula",
    "Benefits Finder · Career Command Center",
    "Call Active Duty Veteran And Hometown Hero",
    "Terms and Conditions of Use",
    "Thanks! Your form has been sent.",
    "By placing this call you agree",
    "this call may be recorded by",
]
FOOTER_LINKS = {"Benefits Finder", "Career Command Center", "Housing & Utility Help",
                "VA Home Buying Webinar", "Calculators"}
SKIP_PAGES = {"sitemap", "veteran-benefits-finder", "career-command-center"}


def clean(t):
    t = re.sub(r"\s+", " ", t or "").replace("\xa0", " ").strip()
    return t


def norm_url(href):
    if not href:
        return None
    href = href.strip()
    if href.startswith("#") or href.lower().startswith("javascript"):
        return None
    if href.startswith(("tel:", "mailto:", "sms:")):
        return href
    u = urljoin(BASE + "/", href)
    if u.startswith(BASE):
        path = u[len(BASE):].split("?")[0]
        frag = ""
        if "#" in path:
            path, frag = path.split("#", 1)
        slug = path.strip("/") or "home"
        return "app://" + slug + (("#" + frag) if frag else "")
    return u


def has_block(el):
    return any(isinstance(d, Tag) and d.name in BLOCK for d in el.descendants)


def yt_id(src):
    m = re.search(r"(?:embed/|v=|youtu\.be/)([A-Za-z0-9_-]{11})", src or "")
    return m.group(1) if m else None


def parse_form(form):
    fields = []
    seen = set()
    for ctl in form.find_all(["input", "select", "textarea"]):
        name = ctl.get("name") or ""
        typ = ctl.get("type") or ctl.name
        if typ in ("hidden", "submit", "button") or name.startswith("__") or name in seen:
            continue
        seen.add(name)
        label = ""
        if ctl.get("id"):
            lab = form.find("label", attrs={"for": ctl["id"]})
            if lab:
                label = clean(lab.get_text(" "))
        if not label:
            grp = ctl.find_parent(class_=re.compile("form-group|field|form-item"))
            lab = grp.find("label") if grp else None
            if not lab:
                prev = ctl.find_previous(["label", "legend", "p", "span", "div"])
                lab = prev
            label = clean(lab.get_text(" ")) if lab else name
        f = {"name": name, "label": label, "type": typ,
             "required": ctl.has_attr("required") or "required" in " ".join(ctl.get("class") or [])}
        if ctl.get("placeholder"):
            f["placeholder"] = ctl["placeholder"]
        if ctl.name == "select":
            f["type"] = "select"
            f["options"] = [clean(o.get_text(" ")) for o in ctl.find_all("option") if clean(o.get_text(" "))]
        if typ in ("radio", "checkbox"):
            opts = [clean((r.find_next(string=True) or "")) for r in form.find_all("input", attrs={"name": name})]
            f["options"] = [o for o in opts if o]
            grp = ctl.find_parent(class_=re.compile("form-group|field|form-item"))
            lab = grp.find(["label", "legend"]) if grp else None
            if lab:
                f["label"] = clean(lab.get_text(" "))
        fields.append(f)
    return fields


class Walker:
    def __init__(self):
        self.out = []

    def emit(self, **kw):
        self.out.append(kw)

    def walk(self, el):
        for ch in el.children:
            if isinstance(ch, Comment):
                continue
            if isinstance(ch, NavigableString):
                t = clean(str(ch))
                if t and el.name not in ("ul", "ol", "table", "tr"):
                    self.emit(t="text", text=t)
                continue
            if not isinstance(ch, Tag):
                continue
            self.node(ch)

    def node(self, el):
        n = el.name
        if n in ("script", "style", "noscript", "svg", "img", "button", "select", "input",
                 "textarea", "label", "option", "br", "hr", "picture", "source"):
            return
        if n == "details":
            s = el.find("summary")
            q = clean(s.get_text(" ")) if s else ""
            if s:
                s.extract()
            a = clean(el.get_text(" "))
            if q and a:
                self.emit(t="faq", q=q, a=a)
            return
        if n == "iframe":
            vid = yt_id(el.get("src") or el.get("data-src"))
            if vid:
                self.emit(t="video", id=vid, title=clean(el.get("title")))
            return
        if n == "form":
            self.emit(t="form", fields=parse_form(el))
            return
        if n == "a":
            url = norm_url(el.get("href"))
            if has_block(el):
                heads = el.find_all(list(HEAD))
                title = clean(heads[0].get_text(" ")) if heads else ""
                tag = el.find(class_=re.compile("tag|eyebrow|badge|label"))
                more = el.find(class_=re.compile("more|cta"))
                badge = clean(tag.get_text(" ")) if tag else ""
                ps = [clean(p.get_text(" ")) for p in el.find_all(["p", "small"]) if clean(p.get_text(" "))]
                if url and (title or ps):
                    self.emit(t="card", title=title or ps.pop(0), badge=badge,
                              desc=" ".join(ps), url=url,
                              cta=clean(more.get_text(" ")) if more else "")
                return
            text = clean(el.get_text(" "))
            if url:
                self.emit(t="link", text=text, url=url)
            return
        if n in HEAD:
            t = clean(el.get_text(" "))
            if t:
                self.emit(t="h", level=int(n[1]), text=t)
            return
        if n in ("ul", "ol"):
            for li in el.find_all("li", recursive=False):
                if has_block(li) or li.find("a"):
                    self.walk(li)
                else:
                    t = clean(li.get_text(" "))
                    if t:
                        self.emit(t="bullet", text=t)
            return
        if not has_block(el) and not el.find("a"):
            t = clean(el.get_text(" "))
            if t:
                cls = " ".join(el.get("class") or [])
                if "eyebrow" in cls:
                    self.emit(t="eyebrow", text=t)
                elif "ah-stat" in cls:
                    b = el.find("b")
                    s = el.find("span")
                    self.emit(t="stat", value=clean(b.get_text()) if b else t,
                              label=clean(s.get_text()) if s else "")
                else:
                    self.emit(t="text", text=t)
            return
        self.walk(el)


def postprocess(tokens):
    # drop sitewide boilerplate
    # Drop site-wide header/footer text, but never a FAQ answer that happens to repeat it.
    toks = [x for x in tokens
            if x.get("t") == "faq" or not any(s in json.dumps(x, ensure_ascii=False) for s in SITEWIDE)]
    # drop trailing footer quick links
    while toks and ((toks[-1]["t"] == "text" and toks[-1]["text"] == "·") or
                    (toks[-1]["t"] == "link" and toks[-1]["text"] in FOOTER_LINKS)):
        toks.pop()
    toks = [x for x in toks if not (x["t"] == "text" and x["text"] in ("·", "|"))]
    # drop empty-text links (image links) and their dupes
    toks = [x for x in toks if not (x["t"] == "link" and not x["text"])]
    out = []
    i = 0
    while i < len(toks):
        x = toks[i]
        # heading (+ small heading / texts) followed by CTA link => card
        if x["t"] == "h" and x["level"] >= 2:
            j = i + 1
            badge, desc = "", []
            while j < len(toks) and j - i <= 6:
                y = toks[j]
                if y["t"] == "h" and y["level"] >= 4 and y["level"] > x["level"] and not badge:
                    badge = y["text"]
                elif y["t"] == "text" and len(y["text"]) < 400:
                    desc.append(y["text"])
                else:
                    break
                j += 1
            if j < len(toks) and toks[j]["t"] == "link" and CTA.match(toks[j]["text"] or ""):
                out.append(dict(t="card", title=x["text"], badge=badge, desc=" ".join(desc),
                                url=toks[j]["url"], cta=toks[j]["text"].title()))
                i = j + 1
                # swallow repeated CTA links to same url
                while i < len(toks) and toks[i]["t"] == "link" and toks[i]["url"] == out[-1]["url"]:
                    i += 1
                continue
        # video followed by its caption heading/text
        if x["t"] == "video":
            j = i + 1
            if j < len(toks) and toks[j]["t"] == "h":
                x = dict(x, title=toks[j]["text"])
                j += 1
                if j < len(toks) and toks[j]["t"] == "text" and len(toks[j]["text"]) < 80:
                    x["source"] = toks[j]["text"]
                    j += 1
            out.append(x)
            i = j
            continue
        out.append(x)
        i += 1
    # merge consecutive identical tokens
    final = []
    for x in out:
        if final and final[-1] == x:
            continue
        if x["t"] == "text" and final and final[-1]["t"] == "card" and x["text"] in (final[-1]["desc"], final[-1]["title"]):
            continue
        final.append(x)
    return final


def convert_page(path):
    soup = BeautifulSoup(open(path, encoding="utf-8", errors="ignore"), "html.parser")
    for t in soup(["script", "style", "noscript", "head"]):
        t.decompose()
    for t in soup.select("header, footer, nav"):
        t.decompose()
    body = soup.body or soup
    title_el = body.find("h1")
    w = Walker()
    w.walk(body)
    toks = postprocess(w.out)
    title = clean(title_el.get_text(" ")) if title_el else ""
    # remove the h1 itself from blocks, keep an intro
    toks = [x for x in toks if not (x["t"] == "h" and x["level"] == 1)]
    return {"title": title, "blocks": toks}


def main():
    src, out = sys.argv[1], sys.argv[2]
    pages = {}
    for f in sorted(os.listdir(src)):
        if not f.endswith(".html"):
            continue
        slug = f[:-5]
        if slug in SKIP_PAGES:
            continue
        pages[slug] = convert_page(os.path.join(src, f))
    json.dump(pages, open(out, "w"), ensure_ascii=False, indent=0)
    for k, v in pages.items():
        c = {}
        for b in v["blocks"]:
            c[b["t"]] = c.get(b["t"], 0) + 1
        print(f"{k:45s} {v['title'][:40]:40s} {c}")


if __name__ == "__main__":
    main()
