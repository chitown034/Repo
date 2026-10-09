"use strict";
/* ============================================================================
   dom-shim.js — a pure-Node DOM shim (no npm, no jsdom) good enough to execute
   the Command Deck's single inline <script> end to end.

   It is deliberately small and tolerant: the goal is not spec fidelity, it is
   (1) running every top-level render, (2) catching every exception with a
   usable function name + line, and (3) recording which container ids actually
   received innerHTML.

   Exports: createDom(html, opts) -> { window, document, stats }
   ========================================================================== */

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr"]);
const RAWTEXT = new Set(["script", "style", "textarea", "title"]);

const NAMED_ENTS = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", middot: "·",
  rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
  times: "×", deg: "°", bull: "•", copy: "©",
  trade: "™", reg: "®", check: "✓", cent: "¢", euro: "€"
};
function decodeEntities(s) {
  if (s.indexOf("&") === -1) return s;
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, function (m, body) {
    if (body[0] === "#") {
      const n = body[1] === "x" || body[1] === "X"
        ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!isFinite(n) || n < 0 || n > 0x10ffff) return m;
      try { return String.fromCodePoint(n); } catch (e) { return m; }
    }
    const v = NAMED_ENTS[body];
    return v === undefined ? m : v;
  });
}
function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function escText(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------------------------------------------------------------- selectors */
/* Supports: tag, #id, .class, [attr], [attr=v], [attr^=v] etc, *, :not(simple),
   :checked/:disabled/:first-child/:last-child, descendant and > combinators,
   and comma groups. That covers every selector the deck uses. */
function parseCompound(src) {
  const parts = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "*") { parts.push({ t: "any" }); i++; continue; }
    if (c === "#") {
      const m = /^#([-\w -￿]+)/.exec(src.slice(i));
      if (!m) { i++; continue; }
      parts.push({ t: "id", v: m[1] }); i += m[0].length; continue;
    }
    if (c === ".") {
      const m = /^\.([-\w -￿]+)/.exec(src.slice(i));
      if (!m) { i++; continue; }
      parts.push({ t: "class", v: m[1] }); i += m[0].length; continue;
    }
    if (c === "[") {
      const close = src.indexOf("]", i);
      if (close === -1) { // tolerate the deck's dynamically-built '[data-cpi-' prefixes
        parts.push({ t: "attrprefix", v: src.slice(i + 1) }); i = src.length; continue;
      }
      const body = src.slice(i + 1, close);
      const m = /^\s*([-\w:.]+)\s*(?:([~^$*|]?=)\s*("([^"]*)"|'([^']*)'|[^\]]*?))?\s*$/.exec(body);
      if (m) {
        let val = m[3];
        if (val !== undefined) {
          if (m[4] !== undefined) val = m[4];
          else if (m[5] !== undefined) val = m[5];
        }
        parts.push({ t: "attr", name: m[1], op: m[2] || null, v: val === undefined ? null : val });
      }
      i = close + 1; continue;
    }
    if (c === ":") {
      const m = /^::?([-\w]+)(\(([^()]*)\))?/.exec(src.slice(i));
      if (!m) { i++; continue; }
      parts.push({ t: "pseudo", v: m[1].toLowerCase(), arg: m[3] || null });
      i += m[0].length; continue;
    }
    const m = /^[-\w -￿]+/.exec(src.slice(i));
    if (m) { parts.push({ t: "tag", v: m[0].toUpperCase() }); i += m[0].length; continue; }
    i++;
  }
  return parts;
}
function parseSelector(sel) {
  return String(sel).split(",").map(function (group) {
    const steps = [];
    const toks = group.trim().split(/\s*(>)\s*|\s+/).filter(function (x) { return x; });
    let comb = null;
    toks.forEach(function (tok) {
      if (tok === ">") { comb = "child"; return; }
      steps.push({ comb: comb || (steps.length ? "desc" : null), parts: parseCompound(tok) });
      comb = null;
    });
    return steps;
  }).filter(function (g) { return g.length; });
}
function matchCompound(el, parts) {
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    switch (p.t) {
      case "any": break;
      case "tag": if (el.tagName !== p.v) return false; break;
      case "id": if (el.getAttribute("id") !== p.v) return false; break;
      case "class": if (!el.classList.contains(p.v)) return false; break;
      case "attrprefix": {
        let hit = false;
        for (const k of el._attrs.keys()) if (k.indexOf(p.v) === 0) { hit = true; break; }
        if (!hit) return false;
        break;
      }
      case "attr": {
        if (!el._attrs.has(p.name)) return false;
        if (p.op) {
          const a = String(el._attrs.get(p.name));
          const v = String(p.v);
          if (p.op === "=" && a !== v) return false;
          if (p.op === "^=" && a.indexOf(v) !== 0) return false;
          if (p.op === "$=" && a.slice(-v.length) !== v) return false;
          if (p.op === "*=" && a.indexOf(v) === -1) return false;
          if (p.op === "~=" && a.split(/\s+/).indexOf(v) === -1) return false;
        }
        break;
      }
      case "pseudo": {
        if (p.v === "not") { if (p.arg && matchCompound(el, parseCompound(p.arg))) return false; break; }
        if (p.v === "checked") { if (!el.checked) return false; break; }
        if (p.v === "disabled") { if (!el.disabled) return false; break; }
        if (p.v === "first-child") { const c = el.parentNode && el.parentNode.children; if (!c || c[0] !== el) return false; break; }
        if (p.v === "last-child") { const c = el.parentNode && el.parentNode.children; if (!c || c[c.length - 1] !== el) return false; break; }
        if (p.v === "hover" || p.v === "focus" || p.v === "active") return false;
        break; // unknown pseudo-classes/elements are permissive
      }
    }
  }
  return true;
}
function matchesSelector(el, groups) {
  for (let g = 0; g < groups.length; g++) {
    const steps = groups[g];
    if (matchSteps(el, steps, steps.length - 1)) return true;
  }
  return false;
}
function matchSteps(el, steps, idx) {
  if (!matchCompound(el, steps[idx].parts)) return false;
  if (idx === 0) return true;
  const comb = steps[idx].comb;
  if (comb === "child") {
    const p = el.parentNode;
    return p && p.nodeType === 1 ? matchSteps(p, steps, idx - 1) : false;
  }
  let p = el.parentNode;
  while (p && p.nodeType === 1) {
    if (matchSteps(p, steps, idx - 1)) return true;
    p = p.parentNode;
  }
  return false;
}

/* ------------------------------------------------------------------- nodes */
let NODE_SEQ = 0;

class TextNode {
  constructor(data, doc) {
    this.nodeType = 3; this.nodeName = "#text"; this.data = String(data);
    this.parentNode = null; this.ownerDocument = doc;
  }
  get textContent() { return this.data; }
  set textContent(v) { this.data = String(v); }
  get nodeValue() { return this.data; }
  set nodeValue(v) { this.data = String(v); }
  cloneNode() { return new TextNode(this.data, this.ownerDocument); }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
}

class ClassList {
  constructor(el) { Object.defineProperty(this, "_el", { value: el, enumerable: false }); }
  _list() { const c = this._el._attrs.get("class"); return c ? String(c).split(/\s+/).filter(Boolean) : []; }
  _write(a) { this._el.setAttribute("class", a.join(" ")); }
  get length() { return this._list().length; }
  contains(c) { return this._list().indexOf(c) !== -1; }
  add() { const a = this._list(); for (const c of arguments) if (a.indexOf(c) === -1) a.push(c); this._write(a); }
  remove() { let a = this._list(); for (const c of arguments) a = a.filter(function (x) { return x !== c; }); this._write(a); }
  toggle(c, force) {
    const has = this.contains(c);
    const on = force === undefined ? !has : !!force;
    if (on) this.add(c); else this.remove(c);
    return on;
  }
  replace(a, b) { if (this.contains(a)) { this.remove(a); this.add(b); return true; } return false; }
  item(i) { return this._list()[i] || null; }
  toString() { return this._list().join(" "); }
}

class Style {
  constructor() { this.cssText = ""; }
  setProperty(k, v) { this[k] = v; }
  removeProperty(k) { delete this[k]; }
  getPropertyValue(k) { return this[k] === undefined ? "" : String(this[k]); }
}

class El {
  constructor(tag, doc) {
    this.nodeType = 1;
    this.tagName = String(tag).toUpperCase();
    this.nodeName = this.tagName;
    this.ownerDocument = doc;
    this.parentNode = null;
    this.childNodes = [];
    this._attrs = new Map();
    this._listeners = new Map();
    this._seq = ++NODE_SEQ;
    this.style = new Style();
    this.classList = new ClassList(this);
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.selected = false;
    this.value = "";
    this.scrollTop = 0; this.scrollLeft = 0;
    this.offsetTop = 0; this.offsetLeft = 0;
    this.offsetWidth = 0; this.offsetHeight = 0;
    this.scrollHeight = 0; this.scrollWidth = 0;
    this.clientHeight = 0; this.clientWidth = 0;
    this.width = 600; this.height = 600;   // canvas defaults
    this.isContentEditable = false;
    this.src = ""; this.href = "";
    // media-element surface (the deck pokes these on <video>/<audio> presence clips)
    this.paused = true; this.muted = false; this.currentTime = 0; this.volume = 1;
    this.readyState = 0; this.loop = false; this.autoplay = false; this.playsInline = false;
    this.selectedIndex = -1; this.files = null;
  }
  /* <select>.options — a real HTMLSelectElement always has it; renderZohoBoard and the
     market-category filler both read .options.length before filling. */
  get options() {
    return this.tagName === "SELECT" ? this.querySelectorAll("option") : undefined;
  }
  get rows() {
    return (this.tagName === "TABLE" || this.tagName === "TBODY" || this.tagName === "THEAD")
      ? this.querySelectorAll("tr") : undefined;
  }
  /* ---- attributes ---- */
  getAttribute(n) { const v = this._attrs.get(n); return v === undefined ? null : v; }
  setAttribute(n, v) {
    const prev = this._attrs.get(n);
    this._attrs.set(n, String(v));
    if (n === "id" && this.ownerDocument) this.ownerDocument._reindexId(this, prev, String(v));
  }
  hasAttribute(n) { return this._attrs.has(n); }
  removeAttribute(n) {
    const prev = this._attrs.get(n);
    this._attrs.delete(n);
    if (n === "id" && this.ownerDocument) this.ownerDocument._reindexId(this, prev, undefined);
  }
  get attributes() {
    const out = [];
    for (const [k, v] of this._attrs) out.push({ name: k, value: v });
    return out;
  }
  get id() { return this.getAttribute("id") || ""; }
  set id(v) { this.setAttribute("id", v); }
  get className() { return this.getAttribute("class") || ""; }
  set className(v) { this.setAttribute("class", v); }
  get dataset() {
    const d = {};
    for (const [k, v] of this._attrs) {
      if (k.indexOf("data-") === 0) {
        d[k.slice(5).replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); })] = v;
      }
    }
    return d;
  }
  /* ---- tree ---- */
  get children() { return this.childNodes.filter(function (n) { return n.nodeType === 1; }); }
  get firstChild() { return this.childNodes[0] || null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
  get firstElementChild() { return this.children[0] || null; }
  get lastElementChild() { const c = this.children; return c[c.length - 1] || null; }
  get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }
  get nextElementSibling() {
    if (!this.parentNode) return null;
    const c = this.parentNode.children, i = c.indexOf(this);
    return i === -1 ? null : (c[i + 1] || null);
  }
  get previousElementSibling() {
    if (!this.parentNode) return null;
    const c = this.parentNode.children, i = c.indexOf(this);
    return i <= 0 ? null : c[i - 1];
  }
  get isConnected() {
    let n = this;
    while (n) { if (n === this.ownerDocument || n._isRoot) return true; n = n.parentNode; }
    return false;
  }
  appendChild(node) {
    if (!node) return node;
    if (node.nodeType === 11) { // fragment
      node.childNodes.slice().forEach((c) => this.appendChild(c));
      return node;
    }
    if (node.parentNode) node.parentNode.removeChild(node);
    node.parentNode = this;
    this.childNodes.push(node);
    if (this.ownerDocument && this.isConnected) this.ownerDocument._connect(node);
    return node;
  }
  insertBefore(node, ref) {
    if (!ref) return this.appendChild(node);
    const i = this.childNodes.indexOf(ref);
    if (i === -1) return this.appendChild(node);
    if (node.parentNode) node.parentNode.removeChild(node);
    node.parentNode = this;
    this.childNodes.splice(i, 0, node);
    if (this.ownerDocument && this.isConnected) this.ownerDocument._connect(node);
    return node;
  }
  replaceChild(nu, old) { this.insertBefore(nu, old); this.removeChild(old); return old; }
  removeChild(node) {
    const i = this.childNodes.indexOf(node);
    if (i !== -1) this.childNodes.splice(i, 1);
    node.parentNode = null;
    if (this.ownerDocument) this.ownerDocument._disconnect(node);
    return node;
  }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  contains(n) { while (n) { if (n === this) return true; n = n.parentNode; } return false; }
  cloneNode(deep) {
    const c = new El(this.tagName, this.ownerDocument);
    for (const [k, v] of this._attrs) c._attrs.set(k, v);
    c.value = this.value; c.checked = this.checked; c.hidden = this.hidden;
    if (deep) this.childNodes.forEach(function (n) { c.appendChild(n.cloneNode(true)); });
    return c;
  }
  /* ---- content ---- */
  get textContent() {
    let s = "";
    const walk = function (n) {
      if (n.nodeType === 3) { s += n.data; return; }
      if (n.childNodes) n.childNodes.forEach(walk);
    };
    this.childNodes.forEach(walk);
    return s;
  }
  set textContent(v) {
    this._clearChildren();
    if (v !== "" && v !== null && v !== undefined) {
      this.appendChild(new TextNode(String(v), this.ownerDocument));
    }
  }
  get innerText() { return this.textContent; }
  set innerText(v) { this.textContent = v; }
  _clearChildren() {
    const doc = this.ownerDocument;
    this.childNodes.forEach(function (n) { n.parentNode = null; if (doc) doc._disconnect(n); });
    this.childNodes = [];
  }
  get innerHTML() { return this.childNodes.map(serialize).join(""); }
  set innerHTML(html) {
    const doc = this.ownerDocument;
    if (doc && doc._recordInnerHtml) doc._recordInnerHtml(this, html);
    this._clearChildren();
    const nodes = parseFragment(String(html == null ? "" : html), doc, RAWTEXT.has(this.tagName.toLowerCase()));
    const self = this;
    nodes.forEach(function (n) { self.appendChild(n); });
  }
  get outerHTML() { return serialize(this); }
  insertAdjacentHTML(pos, html) {
    const nodes = parseFragment(String(html), this.ownerDocument, false);
    const p = String(pos).toLowerCase();
    if (p === "beforeend") nodes.forEach((n) => this.appendChild(n));
    else if (p === "afterbegin") nodes.reverse().forEach((n) => this.insertBefore(n, this.firstChild));
    else if (p === "beforebegin" && this.parentNode) nodes.forEach((n) => this.parentNode.insertBefore(n, this));
    else if (p === "afterend" && this.parentNode) {
      const next = this.nextSibling;
      nodes.forEach((n) => this.parentNode.insertBefore(n, next));
    }
  }
  get nextSibling() {
    if (!this.parentNode) return null;
    const i = this.parentNode.childNodes.indexOf(this);
    return this.parentNode.childNodes[i + 1] || null;
  }
  /* ---- query ---- */
  querySelectorAll(sel) {
    const groups = parseSelector(sel);
    const out = [];
    const walk = function (n) {
      n.childNodes.forEach(function (c) {
        if (c.nodeType !== 1) return;
        if (matchesSelector(c, groups)) out.push(c);
        walk(c);
      });
    };
    walk(this);
    return out;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  matches(sel) { return matchesSelector(this, parseSelector(sel)); }
  closest(sel) {
    const groups = parseSelector(sel);
    let n = this;
    while (n && n.nodeType === 1) { if (matchesSelector(n, groups)) return n; n = n.parentNode; }
    return null;
  }
  getElementsByTagName(t) { return this.querySelectorAll(t); }
  getElementsByClassName(c) { return this.querySelectorAll("." + c); }
  /* ---- events / layout ---- */
  addEventListener(type, fn) {
    if (typeof fn !== "function") return;
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(fn);
  }
  removeEventListener(type, fn) {
    const a = this._listeners.get(type);
    if (!a) return;
    const i = a.indexOf(fn);
    if (i !== -1) a.splice(i, 1);
  }
  dispatchEvent(ev) {
    const type = ev && ev.type;
    let node = this;
    if (ev && !ev.target) ev.target = this;
    while (node) {
      const a = node._listeners && node._listeners.get(type);
      if (a) a.slice().forEach((fn) => { fn.call(node, ev); });
      node = node.parentNode;
    }
    return true;
  }
  click() { this.dispatchEvent({ type: "click", target: this, preventDefault: function () {}, stopPropagation: function () {} }); }
  focus() { if (this.ownerDocument) this.ownerDocument.activeElement = this; }
  blur() { if (this.ownerDocument && this.ownerDocument.activeElement === this) this.ownerDocument.activeElement = this.ownerDocument.body; }
  getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }; }
  scrollIntoView() {}
  getContext(kind) {
    if (String(kind).indexOf("2d") !== 0) return null;
    if (!this._ctx) this._ctx = makeCtx2d();
    return this._ctx;
  }
  toDataURL() { return "data:image/png;base64,"; }
  play() { return Promise.resolve(); }
  pause() {}
  load() {}
  select() {}
  setSelectionRange() {}
  submit() {}
}

function makeCtx2d() {
  const noop = function () {};
  return {
    canvas: null,
    fillStyle: "#000", strokeStyle: "#000", lineWidth: 1, font: "10px sans-serif",
    textAlign: "start", textBaseline: "alphabetic", globalAlpha: 1, lineCap: "butt",
    lineJoin: "miter", shadowBlur: 0, shadowColor: "transparent",
    beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop, arc: noop,
    arcTo: noop, bezierCurveTo: noop, quadraticCurveTo: noop, rect: noop,
    fill: noop, stroke: noop, clip: noop, save: noop, restore: noop,
    translate: noop, rotate: noop, scale: noop, setTransform: noop, transform: noop,
    clearRect: noop, fillRect: noop, strokeRect: noop, fillText: noop, strokeText: noop,
    setLineDash: noop, getLineDash: function () { return []; },
    drawImage: noop, putImageData: noop,
    createLinearGradient: function () { return { addColorStop: noop }; },
    createRadialGradient: function () { return { addColorStop: noop }; },
    measureText: function (t) { return { width: String(t).length * 6, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }; },
    getImageData: function (x, y, w, h) { return { data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }; }
  };
}

function serialize(n) {
  if (n.nodeType === 3) return escText(n.data);
  if (n.nodeType === 8) return "<!--" + n.data + "-->";
  const tag = n.tagName.toLowerCase();
  let s = "<" + tag;
  for (const [k, v] of n._attrs) s += " " + k + '="' + escAttr(v) + '"';
  s += ">";
  if (VOID.has(tag)) return s;
  s += n.childNodes.map(serialize).join("");
  return s + "</" + tag + ">";
}

/* ------------------------------------------------------------------ parser */
function parseFragment(html, doc, raw) {
  const frag = [];
  if (raw) { frag.push(new TextNode(html, doc)); return frag; }
  const rootChildren = frag;
  const stack = [];
  let i = 0;
  const len = html.length;
  const push = function (node) {
    if (stack.length) stack[stack.length - 1].appendChild(node);
    else { node.parentNode = null; rootChildren.push(node); }
  };
  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      const t = html.slice(i);
      if (t) push(new TextNode(decodeEntities(t), doc));
      break;
    }
    if (lt > i) push(new TextNode(decodeEntities(html.slice(i, lt)), doc));
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt + 4);
      i = end === -1 ? len : end + 3;
      continue;
    }
    if (html.startsWith("<!", lt) || html.startsWith("<?", lt)) {
      const end = html.indexOf(">", lt);
      i = end === -1 ? len : end + 1;
      continue;
    }
    if (html.startsWith("</", lt)) {
      const end = html.indexOf(">", lt);
      if (end === -1) { i = len; continue; }
      const name = html.slice(lt + 2, end).trim().toLowerCase();
      for (let s = stack.length - 1; s >= 0; s--) {
        if (stack[s].tagName.toLowerCase() === name) { stack.length = s; break; }
      }
      i = end + 1;
      continue;
    }
    // open tag
    const nm = /^<([A-Za-z][-\w:]*)/.exec(html.slice(lt, lt + 64));
    if (!nm) { push(new TextNode("<", doc)); i = lt + 1; continue; }
    const name = nm[1].toLowerCase();
    let j = lt + nm[0].length;
    const el = new El(name, doc);
    // attributes
    let selfClose = false;
    while (j < len) {
      while (j < len && /\s/.test(html[j])) j++;
      if (html[j] === ">") { j++; break; }
      if (html[j] === "/" && html[j + 1] === ">") { selfClose = true; j += 2; break; }
      const am = /^([^\s=/>"']+)\s*(=\s*("([^"]*)"|'([^']*)'|[^\s>]*))?/.exec(html.slice(j));
      if (!am) { j++; continue; }
      let v = "";
      if (am[2] !== undefined) {
        v = am[4] !== undefined ? am[4] : (am[5] !== undefined ? am[5] : (am[3] || ""));
      }
      el._attrs.set(am[1], decodeEntities(v));
      j += am[0].length;
      if (am[0].length === 0) j++;
    }
    if (el._attrs.has("value")) el.value = el._attrs.get("value");
    if (el._attrs.has("checked")) el.checked = true;
    if (el._attrs.has("disabled")) el.disabled = true;
    if (el._attrs.has("hidden")) el.hidden = true;
    if (el._attrs.has("width")) el.width = parseInt(el._attrs.get("width"), 10) || el.width;
    if (el._attrs.has("height")) el.height = parseInt(el._attrs.get("height"), 10) || el.height;
    push(el);
    i = j;
    if (VOID.has(name) || selfClose) continue;
    if (RAWTEXT.has(name)) {
      const closeRe = new RegExp("</" + name + "\\s*>", "i");
      const rest = html.slice(i);
      const m = closeRe.exec(rest);
      const body = m ? rest.slice(0, m.index) : rest;
      if (body) el.appendChild(new TextNode(body, doc));
      i = m ? i + m.index + m[0].length : len;
      continue;
    }
    stack.push(el);
  }
  return rootChildren;
}

/* ---------------------------------------------------------------- storage */
function makeStorage(opts) {
  const map = new Map();
  const state = { throwOnSet: false, throwOnGet: false, quotaBytes: Infinity, bytes: 0 };
  const api = {
    _map: map,
    _state: state,
    get length() { return map.size; },
    key(i) { return Array.from(map.keys())[i] === undefined ? null : Array.from(map.keys())[i]; },
    getItem(k) {
      if (state.throwOnGet) throw new Error("SecurityError: storage disabled");
      const v = map.get(String(k));
      return v === undefined ? null : v;
    },
    setItem(k, v) {
      if (state.throwOnSet) { const e = new Error("QuotaExceededError: storage full"); e.name = "QuotaExceededError"; throw e; }
      const s = String(v);
      if (state.quotaBytes !== Infinity) {
        let total = s.length + String(k).length;
        for (const [kk, vv] of map) if (kk !== String(k)) total += kk.length + vv.length;
        if (total > state.quotaBytes) { const e = new Error("QuotaExceededError: storage full"); e.name = "QuotaExceededError"; throw e; }
      }
      map.set(String(k), s);
    },
    removeItem(k) { map.delete(String(k)); },
    clear() { map.clear(); }
  };
  if (opts && opts.seed) for (const k of Object.keys(opts.seed)) map.set(k, opts.seed[k]);
  return api;
}

/* -------------------------------------------------------------- createDom */
function createDom(html, opts) {
  opts = opts || {};
  const stats = {
    innerHtmlWrites: new Map(),   // key -> {id, tag, writes, bytes, lastBytes}
    missingIds: new Map(),        // id -> count  (getElementById miss)
    getByIdHits: 0,
    timersScheduled: 0,
    timersRun: 0,
    reloads: 0,
    consoleWarn: [],
    consoleError: [],
    clipboardWrites: 0
  };

  const doc = {
    nodeType: 9,
    _isRoot: true,
    _ids: new Map(),
    _listeners: new Map(),
    title: "Command Deck",
    hidden: false,
    visibilityState: "visible",
    readyState: "complete",
    cookie: "",
    characterSet: "UTF-8"
  };
  doc.ownerDocument = doc;
  doc._recordInnerHtml = function (el, htmlStr) {
    const id = el.getAttribute("id");
    const key = id ? "#" + id : el.tagName.toLowerCase() + "." + (el.getAttribute("class") || "") + "@" + el._seq;
    let rec = stats.innerHtmlWrites.get(key);
    if (!rec) { rec = { key: key, id: id || null, tag: el.tagName.toLowerCase(), writes: 0, bytes: 0, lastBytes: 0 }; stats.innerHtmlWrites.set(key, rec); }
    rec.writes++;
    const n = String(htmlStr == null ? "" : htmlStr).length;
    rec.bytes += n;
    rec.lastBytes = n;
  };
  doc._reindexId = function (el, prev, next) {
    if (prev && doc._ids.get(prev) === el) doc._ids.delete(prev);
    if (next && el.isConnected && !doc._ids.has(next)) doc._ids.set(next, el);
  };
  doc._connect = function (node) {
    if (!node || node.nodeType !== 1) return;
    const id = node.getAttribute("id");
    if (id && !doc._ids.has(id)) doc._ids.set(id, node);
    node.childNodes.forEach(doc._connect);
  };
  doc._disconnect = function (node) {
    if (!node || node.nodeType !== 1) return;
    const id = node.getAttribute("id");
    if (id && doc._ids.get(id) === node) doc._ids.delete(id);
    node.childNodes.forEach(doc._disconnect);
  };

  // ---- parse the page
  const nodes = parseFragment(html, doc, false);
  const htmlEl = nodes.filter(function (n) { return n.nodeType === 1 && n.tagName === "HTML"; })[0] ||
    (function () { const e = new El("html", doc); nodes.forEach(function (n) { e.appendChild(n); }); return e; })();
  htmlEl.parentNode = doc;
  doc.documentElement = htmlEl;
  doc.childNodes = [htmlEl];
  doc.children = [htmlEl];
  doc.head = htmlEl.querySelector("head") || htmlEl.appendChild(new El("head", doc));
  doc.body = htmlEl.querySelector("body") || htmlEl.appendChild(new El("body", doc));
  doc.activeElement = doc.body;
  doc._connect(htmlEl);

  doc.getElementById = function (id) {
    const el = doc._ids.get(String(id));
    if (el) { stats.getByIdHits++; return el; }
    stats.missingIds.set(String(id), (stats.missingIds.get(String(id)) || 0) + 1);
    return null;
  };
  doc.querySelector = function (s) { return htmlEl.matches(s) ? htmlEl : htmlEl.querySelector(s); };
  doc.querySelectorAll = function (s) {
    const out = htmlEl.querySelectorAll(s);
    if (htmlEl.matches(s)) out.unshift(htmlEl);
    return out;
  };
  doc.getElementsByTagName = function (t) { return doc.querySelectorAll(t); };
  doc.getElementsByClassName = function (c) { return doc.querySelectorAll("." + c); };
  doc.createElement = function (t) { return new El(t, doc); };
  doc.createElementNS = function (ns, t) { return new El(t, doc); };
  doc.createTextNode = function (t) { return new TextNode(t, doc); };
  doc.createComment = function (t) { return { nodeType: 8, data: String(t), parentNode: null }; };
  doc.createDocumentFragment = function () {
    const f = new El("#fragment", doc); f.nodeType = 11; return f;
  };
  doc.addEventListener = function (t, fn) {
    if (typeof fn !== "function") return;
    if (!doc._listeners.has(t)) doc._listeners.set(t, []);
    doc._listeners.get(t).push(fn);
  };
  doc.removeEventListener = function (t, fn) {
    const a = doc._listeners.get(t); if (!a) return;
    const i = a.indexOf(fn); if (i !== -1) a.splice(i, 1);
  };
  doc.dispatchEvent = function (ev) {
    const a = doc._listeners.get(ev && ev.type);
    if (a) a.slice().forEach(function (fn) { fn.call(doc, ev); });
    return true;
  };
  doc.execCommand = function () { return false; };
  doc.contains = function (n) { return htmlEl.contains(n); };
  doc.write = function () {};
  doc.close = function () {};

  // ---- timers
  const timers = [];
  let timerSeq = 0;
  const cancelled = new Set();
  function schedule(fn, ms, kind, args) {
    const id = ++timerSeq;
    if (typeof fn !== "function") return id;
    stats.timersScheduled++;
    timers.push({ id: id, fn: fn, ms: Number(ms) || 0, kind: kind, args: args || [], seq: timerSeq });
    return id;
  }
  const win = {
    name: "",
    closed: false,
    innerWidth: 1440, innerHeight: 900, outerWidth: 1440, outerHeight: 900,
    pageYOffset: 0, pageXOffset: 0, scrollY: 0, scrollX: 0, devicePixelRatio: 2,
    isSecureContext: true,
    document: doc,
    _timers: timers,
    _cancelled: cancelled,
    _stats: stats
  };
  win.setTimeout = function (fn, ms) { return schedule(fn, ms, "timeout", Array.prototype.slice.call(arguments, 2)); };
  win.setInterval = function (fn, ms) { return schedule(fn, ms, "interval", Array.prototype.slice.call(arguments, 2)); };
  win.clearTimeout = function (id) { cancelled.add(id); };
  win.clearInterval = function (id) { cancelled.add(id); };
  win.requestAnimationFrame = function (fn) { return schedule(fn, 16, "raf", [Date.now()]); };
  win.cancelAnimationFrame = function (id) { cancelled.add(id); };
  win.queueMicrotask = function (fn) { Promise.resolve().then(fn); };

  win.localStorage = makeStorage(opts.localStorage);
  win.sessionStorage = makeStorage(opts.sessionStorage);

  win.navigator = {
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) node-dom-shim",
    platform: "MacIntel",
    language: "en-US", languages: ["en-US"],
    onLine: true,
    userAgentData: { platform: "macOS", brands: [{ brand: "Chromium", version: "140" }], mobile: false },
    clipboard: {
      writeText: function () { stats.clipboardWrites++; return Promise.resolve(); },
      readText: function () { return Promise.resolve(""); }
    },
    share: function () { return Promise.reject(new Error("not supported")); },
    sendBeacon: function () { return false; }
  };
  win.location = {
    href: "https://claude.ai/code/artifact/command-deck",
    origin: "https://claude.ai", protocol: "https:", host: "claude.ai",
    hostname: "claude.ai", pathname: "/code/artifact/command-deck", search: "", hash: "",
    reload: function () { stats.reloads++; },
    assign: function () {}, replace: function () {}, toString: function () { return this.href; }
  };
  win.history = { length: 1, state: null, pushState: function () {}, replaceState: function () {}, back: function () {}, forward: function () {}, go: function () {} };
  win.screen = { width: 1440, height: 900, availWidth: 1440, availHeight: 860, colorDepth: 24 };

  win.matchMedia = function (q) {
    return {
      matches: false, media: String(q),
      addListener: function () {}, removeListener: function () {},
      addEventListener: function () {}, removeEventListener: function () {},
      dispatchEvent: function () { return false; },
      onchange: null
    };
  };
  win.getComputedStyle = function () {
    return {
      getPropertyValue: function () { return ""; },
      setProperty: function () {},
      length: 0
    };
  };
  win.scrollTo = function () {};
  win.scrollBy = function () {};
  win.print = function () {};
  win.open = function () { return null; };
  win.focus = function () {};
  win.alert = function () {};
  win.confirm = function () { return false; };
  win.prompt = function () { return null; };
  win.close = function () {};
  win.btoa = function (s) { return Buffer.from(String(s), "binary").toString("base64"); };
  win.atob = function (s) { return Buffer.from(String(s), "base64").toString("binary"); };
  win.fetch = function () { return Promise.reject(new Error("network disabled in harness")); };

  win._winListeners = new Map();
  win.addEventListener = function (t, fn) {
    if (typeof fn !== "function") return;
    if (!win._winListeners.has(t)) win._winListeners.set(t, []);
    win._winListeners.get(t).push(fn);
  };
  win.removeEventListener = function (t, fn) {
    const a = win._winListeners.get(t); if (!a) return;
    const i = a.indexOf(fn); if (i !== -1) a.splice(i, 1);
  };
  win.dispatchEvent = function (ev) {
    const a = win._winListeners.get(ev && ev.type);
    if (a) a.slice().forEach(function (fn) { fn.call(win, ev); });
    return true;
  };

  class MutationObserverShim {
    constructor(cb) { this._cb = cb; }
    observe() {} disconnect() {} takeRecords() { return []; }
  }
  class IntersectionObserverShim {
    constructor(cb) { this._cb = cb; }
    observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
  }
  class ResizeObserverShim {
    constructor(cb) { this._cb = cb; }
    observe() {} unobserve() {} disconnect() {}
  }
  win.MutationObserver = MutationObserverShim;
  win.IntersectionObserver = IntersectionObserverShim;
  win.ResizeObserver = ResizeObserverShim;

  win.speechSynthesis = {
    speaking: false, pending: false, paused: false,
    getVoices: function () { return []; },
    speak: function () {}, cancel: function () {}, pause: function () {}, resume: function () {},
    addEventListener: function () {}, removeEventListener: function () {}
  };
  win.SpeechSynthesisUtterance = function (t) { this.text = t || ""; this.voice = null; this.rate = 1; this.pitch = 1; };

  class FileReaderShim {
    constructor() { this.result = null; this.onload = null; this.onerror = null; }
    readAsText() { const self = this; win.setTimeout(function () { self.result = ""; if (self.onload) self.onload({ target: self }); }, 0); }
    readAsDataURL() { const self = this; win.setTimeout(function () { self.result = "data:,"; if (self.onload) self.onload({ target: self }); }, 0); }
    readAsArrayBuffer() { const self = this; win.setTimeout(function () { self.result = new ArrayBuffer(0); if (self.onload) self.onload({ target: self }); }, 0); }
    abort() {}
    addEventListener(t, fn) { this["on" + t] = fn; }
  }
  win.FileReader = FileReaderShim;

  class DOMParserShim {
    parseFromString(str, type) {
      const d2 = createDom(String(type).indexOf("xml") !== -1
        ? "<html><body>" + String(str) + "</body></html>"
        : String(str), { quiet: true }).document;
      return d2;
    }
  }
  win.DOMParser = DOMParserShim;

  win.Event = function (type, init) { this.type = type; Object.assign(this, init || {}); this.preventDefault = function () {}; this.stopPropagation = function () {}; };
  win.CustomEvent = win.Event;
  win.Element = El;
  win.HTMLElement = El;
  win.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3, COMMENT_NODE: 8, DOCUMENT_NODE: 9 };
  win.XMLHttpRequest = function () {
    this.open = function () {}; this.send = function () { if (this.onerror) this.onerror(new Error("network disabled")); };
    this.setRequestHeader = function () {}; this.abort = function () {};
    this.addEventListener = function () {};
  };

  win.claude = undefined;   // local mode by default

  return { window: win, document: doc, stats: stats, El: El, TextNode: TextNode, parseFragment: parseFragment };
}

module.exports = { createDom, parseFragment, parseSelector, matchesSelector, El, TextNode, decodeEntities, makeStorage };
