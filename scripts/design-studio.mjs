#!/usr/bin/env node
/**
 * Design Studio — edit this site's design tokens in the browser, against the
 * real running site, and write the result back to source.
 *
 * A preview-only panel would be a toy: you would still hand-copy every value
 * into globals.css afterwards, and the two token files would drift. This one
 * saves, rewrites both mirrors together, and runs the same checks the build
 * runs, so a session ends with source that is already green.
 *
 * It is a standalone script on purpose. Nothing here is imported by the app,
 * so the production bundle and the performance budget are untouched, and the
 * file can be dropped into another project whose tokens live the same way.
 *
 * How it works: the studio serves itself at /__studio and proxies everything
 * else to the running site, so the preview iframe is same-origin and its
 * custom properties can be written directly. Edits are applied by injecting a
 * stylesheet — not inline styles — because the dark palette lives on a
 * [data-theme="dark"] selector that an inline style on <html> would override
 * in both themes at once.
 *
 *   npm run design              # against http://127.0.0.1:3000
 *   npm run design -- 3111      # against another port
 *
 * Binds to 127.0.0.1 only. It writes source files, so it must never be
 * reachable from the network.
 */
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { promisify } from "node:util";

const run = promisify(execFile);

const PORT = 4321;
const arg = process.argv[2] ?? "3000";
const TARGET = arg.startsWith("http") ? arg.replace(/\/$/, "") : `http://127.0.0.1:${arg}`;

const CSS_PATH = "src/app/globals.css";
const TS_PATH = "src/lib/design-tokens.ts";

/** `--color-rail-ink` ↔ `railInk`, the same mapping check-tokens.mjs uses. */
const camel = (kebab) => kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** The token groups the studio exposes, in the order they are shown. */
const GROUPS = [
  { key: "color", label: "Colour", prefix: "--color-", themed: true },
  { key: "text", label: "Type scale", prefix: "--text-", themed: false },
  { key: "space", label: "Spacing", prefix: "--space-", themed: false },
  { key: "radius", label: "Radius", prefix: "--radius-", themed: false },
  { key: "surface", label: "Surface", prefix: "--surface-", themed: false },
];

/** Declarations inside one flat CSS block, in source order. */
function readBlock(css, start) {
  const from = css.indexOf(start);
  if (from === -1) throw new Error(`block not found: ${start}`);
  const body = css.slice(from, css.indexOf("\n}", from));
  const out = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim().replace(/\s+/g, " ");
  }
  return out;
}

/** Current token values, read from source rather than from the browser. */
function readTokens() {
  const css = readFileSync(CSS_PATH, "utf8");
  const light = readBlock(css, "@theme {");
  const dark = readBlock(css, '[data-theme="dark"] {');
  const groups = GROUPS.map((g) => ({
    ...g,
    tokens: Object.keys(light)
      .filter((name) => name.startsWith(g.prefix))
      .map((name) => ({
        name,
        short: name.slice(g.prefix.length),
        light: light[name],
        dark: g.themed ? (dark[name] ?? light[name]) : null,
      })),
  })).filter((g) => g.tokens.length > 0);
  return { target: TARGET, groups };
}

/** Replace one declaration inside one block, leaving everything else byte-identical. */
function setInBlock(css, blockStart, name, value) {
  const from = css.indexOf(blockStart);
  if (from === -1) throw new Error(`block not found: ${blockStart}`);
  const to = css.indexOf("\n}", from);
  const block = css.slice(from, to);
  const re = new RegExp(`(${name}:\\s*)([^;]+)(;)`);
  if (!re.test(block)) return css;
  return css.slice(0, from) + block.replace(re, `$1${value}$3`) + css.slice(to);
}

/** Replace a value in a `const <name> = { ... }` object literal. */
function setInObject(ts, objName, key, value) {
  const from = ts.indexOf(`export const ${objName}`);
  if (from === -1) return ts;
  const ends = ["\n} as const;", "\n};"].map((t) => ts.indexOf(t, from)).filter((i) => i !== -1);
  if (ends.length === 0) return ts;
  const to = Math.min(...ends);
  const body = ts.slice(from, to);
  // Keys are bare (canvas:) or quoted ("2xs":) depending on whether they are
  // valid identifiers, and both forms appear in this file.
  const re = new RegExp(`((?:"${key}"|${key}):\\s*")([^"]*)(")`);
  if (!re.test(body)) return ts;
  return ts.slice(0, from) + body.replace(re, `$1${value}$3`) + ts.slice(to);
}

/** Write both mirrors together. Changing one without the other is the defect. */
function save(payload) {
  let css = readFileSync(CSS_PATH, "utf8");
  let ts = readFileSync(TS_PATH, "utf8");
  let changed = 0;

  for (const [name, value] of Object.entries(payload.light ?? {})) {
    css = setInBlock(css, "@theme {", name, value);
    if (name.startsWith("--color-")) {
      ts = setInObject(ts, "colors", camel(name.slice("--color-".length)), value);
    }
    for (const g of GROUPS) {
      if (g.themed || !name.startsWith(g.prefix)) continue;
      ts = setInObject(ts, g.key, name.slice(g.prefix.length), value);
    }
    changed += 1;
  }

  for (const [name, value] of Object.entries(payload.dark ?? {})) {
    css = setInBlock(css, '[data-theme="dark"] {', name, value);
    if (name.startsWith("--color-")) {
      ts = setInObject(ts, "darkColors", camel(name.slice("--color-".length)), value);
    }
    changed += 1;
  }

  writeFileSync(CSS_PATH, css);
  writeFileSync(TS_PATH, ts);
  return changed;
}

/**
 * Swap one class string for another in a source file.
 *
 * Grid placement is Tailwind classes in JSX, not a token, so a tile resized by
 * dragging cannot be saved through the token path. This replaces the exact
 * class string instead — and refuses unless it appears exactly once, because a
 * near-miss in a file like deck.tsx is a silent layout change somewhere else.
 */
function applyClass({ file, from, to }) {
  const allowed = ["src/components/home/deck.tsx", "src/components/home/tile.tsx"];
  if (!allowed.includes(file)) throw new Error(`refusing to edit ${file}`);
  const src = readFileSync(file, "utf8");
  const hits = src.split(from).length - 1;
  if (hits === 0) throw new Error("class string not found — edit it by hand");
  if (hits > 1) throw new Error(`class string appears ${hits} times — too ambiguous to edit safely`);
  writeFileSync(file, src.replace(from, to));
  return { file, hits };
}

/** The checks that would gate this change in CI, run immediately. */
async function verify() {
  const results = [];
  for (const script of ["check-tokens.mjs", "check-contrast.mjs"]) {
    try {
      const { stdout } = await run("node", [`scripts/${script}`]);
      results.push({ script, ok: true, output: stdout.trim().split("\n").slice(-1)[0] });
    } catch (e) {
      const text = `${e.stdout ?? ""}${e.stderr ?? ""}`.trim();
      results.push({
        script,
        ok: false,
        output: text.split("\n").filter((l) => l.startsWith("FAIL") || l.startsWith("FAILED")).join(" · ") || text.slice(-300),
      });
    }
  }
  return results;
}

const PANEL = /* html */ `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Design Studio</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root { color-scheme: light dark; --ui: #111; --ui-bg: #fff; --ui-line: #d8d8d8; --ui-muted: #5d5d5d; }
  @media (prefers-color-scheme: dark) {
    :root { --ui: #f2f2f2; --ui-bg: #141414; --ui-line: #333; --ui-muted: #a0a0a0; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; height: 100dvh; display: grid; grid-template-columns: 320px 1fr;
         font: 13px/1.45 ui-sans-serif, system-ui, sans-serif; color: var(--ui); background: var(--ui-bg); }
  aside { border-right: 1px solid var(--ui-line); display: flex; flex-direction: column; min-height: 0; }
  header { padding: 12px 14px; border-bottom: 1px solid var(--ui-line); }
  h1 { margin: 0; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
  .sub { color: var(--ui-muted); font-size: 11px; margin-top: 2px; }
  .scroll { overflow-y: auto; flex: 1; padding: 6px 14px 14px; }
  fieldset { border: 0; border-top: 1px solid var(--ui-line); margin: 12px 0 0; padding: 10px 0 0; }
  legend { font-size: 11px; text-transform: uppercase; letter-spacing: .07em; color: var(--ui-muted); padding-right: 8px; }
  .row { display: grid; grid-template-columns: 1fr 96px 22px; gap: 6px; align-items: center; margin-bottom: 5px; }
  label { font-size: 11.5px; font-family: ui-monospace, Menlo, monospace; overflow: hidden; text-overflow: ellipsis; }
  input[type=text] { width: 100%; font: 11px ui-monospace, Menlo, monospace; padding: 3px 5px;
                     border: 1px solid var(--ui-line); background: transparent; color: inherit; border-radius: 3px; }
  input[type=text]:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
  .sw { width: 20px; height: 20px; border: 1px solid var(--ui-line); border-radius: 3px; }
  .bar { display: flex; gap: 6px; padding: 12px 14px; border-top: 1px solid var(--ui-line); }
  button { flex: 1; font: inherit; font-size: 12px; padding: 7px 10px; cursor: pointer;
           border: 1px solid var(--ui-line); background: transparent; color: inherit; border-radius: 4px; }
  button.primary { background: var(--ui); color: var(--ui-bg); border-color: var(--ui); }
  button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
  .seg { display: flex; gap: 0; margin-top: 8px; }
  .seg button { border-radius: 0; flex: 1; }
  .seg button:first-child { border-radius: 4px 0 0 4px; }
  .seg button:last-child { border-radius: 0 4px 4px 0; border-left: 0; }
  .seg button[aria-pressed=true] { background: var(--ui); color: var(--ui-bg); border-color: var(--ui); }
  #log { padding: 8px 14px; font: 11px ui-monospace, Menlo, monospace; white-space: pre-wrap;
         border-top: 1px solid var(--ui-line); max-height: 140px; overflow-y: auto; color: var(--ui-muted); }
  iframe { width: 100%; height: 100%; border: 0; display: block; background: #fff; }
  .none { color: var(--ui-muted); font-size: 11.5px; padding: 10px 0; }
  .who { font: 11.5px ui-monospace, Menlo, monospace; word-break: break-all;
         padding: 8px 0 10px; border-bottom: 1px solid var(--ui-line); }
  .who b { display: block; font-size: 12.5px; margin-bottom: 3px; }
  .metric { display: grid; grid-template-columns: 1fr auto; gap: 6px; align-items: center;
            padding: 3px 0; font: 11.5px ui-monospace, Menlo, monospace; }
  .metric span:last-child { color: var(--ui-muted); }
  .scrub { cursor: ew-resize; user-select: none; border-bottom: 1px dotted currentColor; }
  .hint { font-size: 11px; color: var(--ui-muted); padding: 6px 0 0; line-height: 1.4; }
  code { font: 11px ui-monospace, Menlo, monospace; background: color-mix(in srgb, currentColor 8%, transparent);
         padding: 1px 4px; border-radius: 3px; }
</style></head><body>
<aside>
  <header>
    <h1>Design Studio</h1>
    <div class="sub" id="target"></div>
    <div class="seg" role="group" aria-label="Preview theme">
      <button id="t-light" aria-pressed="true">Light</button>
      <button id="t-dark" aria-pressed="false">Dark</button>
    </div>
  </header>
  <div class="seg" role="group" aria-label="Mode" style="padding:0 14px 10px">
    <button id="m-tokens" aria-pressed="true">Tokens</button>
    <button id="m-pick" aria-pressed="false">Pick element</button>
  </div>
  <div class="scroll" id="fields"></div>
  <div class="scroll" id="element" hidden></div>
  <div class="bar">
    <button id="revert">Revert</button>
    <button id="save" class="primary">Save to source</button>
  </div>
  <div id="log">Ready.</div>
</aside>
<iframe id="site" src="/" title="Site preview"></iframe>

<script type="module">
const $ = (s) => document.querySelector(s);
const log = (m) => { $("#log").textContent = m; };
let data, theme = "light";
const edits = { light: {}, dark: {} };

const res = await fetch("/__studio/tokens");
data = await res.json();
$("#target").textContent = "proxying " + data.target;

// Values are edited per theme. A colour token has two, everything else has one
// and is shared, so the dark column is simply absent for those groups.
const valueOf = (t) => (theme === "dark" && t.dark !== null ? t.dark : t.light);

function render() {
  const host = $("#fields");
  host.innerHTML = "";
  for (const g of data.groups) {
    const fs = document.createElement("fieldset");
    const lg = document.createElement("legend");
    lg.textContent = g.themed ? g.label + " · " + theme : g.label;
    fs.append(lg);
    for (const t of g.tokens) {
      const row = document.createElement("div");
      row.className = "row";
      const lab = document.createElement("label");
      lab.textContent = t.short;
      lab.htmlFor = "f-" + t.name;
      const inp = document.createElement("input");
      inp.type = "text";
      inp.id = "f-" + t.name;
      inp.value = valueOf(t);
      inp.spellcheck = false;
      const sw = document.createElement("span");
      sw.className = "sw";
      sw.style.background = g.key === "color" ? valueOf(t) : "transparent";
      inp.addEventListener("input", () => {
        const scope = g.themed ? theme : "light";
        edits[scope][t.name] = inp.value;
        if (g.key === "color") sw.style.background = inp.value;
        apply();
      });
      row.append(lab, inp, sw);
      fs.append(row);
    }
    host.append(fs);
  }
}

/**
 * Applied as a stylesheet, not inline styles: the dark palette lives on a
 * [data-theme="dark"] selector, and an inline style on <html> would override
 * light and dark at the same time.
 */
function apply() {
  const doc = $("#site").contentDocument;
  if (!doc) return;
  let tag = doc.getElementById("__studio-overrides");
  if (!tag) {
    tag = doc.createElement("style");
    tag.id = "__studio-overrides";
    doc.head.append(tag);
  }
  const decl = (o) => Object.entries(o).map(([k, v]) => k + ":" + v + ";").join("");
  tag.textContent =
    ":root{" + decl(edits.light) + "}" +
    '[data-theme="dark"]{' + decl(edits.dark) + "}";
}

function setTheme(next) {
  theme = next;
  $("#t-light").setAttribute("aria-pressed", String(next === "light"));
  $("#t-dark").setAttribute("aria-pressed", String(next === "dark"));
  const doc = $("#site").contentDocument;
  if (doc) doc.documentElement.setAttribute("data-theme", next);
  render();
}

$("#t-light").addEventListener("click", () => setTheme("light"));
$("#t-dark").addEventListener("click", () => setTheme("dark"));
$("#site").addEventListener("load", () => { setTheme(theme); apply(); wirePicker(); selected = null; if (picking) renderElement(); });


// ── pick mode ───────────────────────────────────────────────────────────────
// The reason this exists: a token list tells you a value but not what it does.
// Pick an element and the panel names it, shows its box, and lists only the
// tokens that element's own cascade actually reads.

let picking = false, selected = null, justDragged = false;

function overlay(doc, id, style) {
  let el = doc.getElementById(id);
  if (!el) {
    el = doc.createElement("div");
    el.id = id;
    el.style.cssText =
      "position:absolute;pointer-events:none;z-index:2147483646;" + style;
    doc.body.append(el);
  }
  return el;
}

function place(box, r, doc) {
  const sx = doc.defaultView.scrollX, sy = doc.defaultView.scrollY;
  box.style.left = r.left + sx + "px";
  box.style.top = r.top + sy + "px";
  box.style.width = r.width + "px";
  box.style.height = r.height + "px";
}

/** Custom properties this element's matched rules actually reference. */
function tokensFor(el, doc) {
  const found = new Set();
  for (const sheet of doc.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) walkRule(rule, el, found);
  }
  return [...found].sort();
}
function walkRule(rule, el, found) {
  // Test the selector BEFORE recursing. CSSStyleRule now carries its own
  // (usually empty) cssRules list for CSS nesting, so an "if (rule.cssRules)"
  // guard returns before ever looking at selectorText — which silently skipped
  // every style rule on the page and reported that nothing used any token.
  if (rule.selectorText) {
    let matches = false;
    try { matches = el.matches(rule.selectorText); } catch { matches = false; }
    // Doubled backslash on purpose: this lives inside the PANEL template
    // literal, where \( would be eaten as an escape and leave an unterminated
    // group. It took the whole panel script down with a parse error once.
    if (matches) {
      for (const m of rule.style.cssText.matchAll(/var\\((--[a-z0-9-]+)/g)) found.add(m[1]);
    }
  }
  if (rule.cssRules) for (const r of rule.cssRules) walkRule(r, el, found);
}

/** A readable name for what was clicked, favouring the tokens' own classes. */
function describe(el) {
  const known = ["tile", "panel", "deck", "flow", "chip", "display", "marquee", "rail"];
  const hit = known.filter((c) => el.classList.contains(c));
  return el.tagName.toLowerCase() + (hit.length ? "." + hit.join(".") : "");
}

function renderElement() {
  const host = $("#element");
  host.innerHTML = "";
  if (!selected) {
    host.innerHTML = '<p class="none">Click anything in the preview to inspect it.</p>';
    return;
  }
  const doc = $("#site").contentDocument;
  const cs = doc.defaultView.getComputedStyle(selected);
  const r = selected.getBoundingClientRect();

  const who = document.createElement("div");
  who.className = "who";
  who.innerHTML = "<b>" + describe(selected) + "</b>" +
    (selected.className ? String(selected.className).slice(0, 220) : "<i>no classes</i>");
  host.append(who);

  // A click lands on the deepest element, which is usually a label rather than
  // the card it sits in. The breadcrumb climbs out without hunting for a gap
  // between the child elements to click on.
  const trail = document.createElement("div");
  trail.className = "hint";
  const chain = [];
  for (let n = selected.parentElement; n && n.tagName !== "BODY"; n = n.parentElement) {
    chain.push(n);
    if (chain.length >= 4) break;
  }
  if (chain.length) {
    trail.append("Select parent: ");
    chain.forEach((n, i) => {
      const a = document.createElement("button");
      a.textContent = describe(n);
      a.style.cssText = "flex:0 0 auto;padding:1px 6px;margin:2px 4px 0 0;font-size:11px;";
      a.addEventListener("click", () => {
        selected = n;
        const d = $("#site").contentDocument;
        const sel = d.getElementById("__studio-sel");
        if (sel) { sel.style.display = "block"; place(sel, n.getBoundingClientRect(), d); }
        renderElement();
      });
      trail.append(a);
      if (i < chain.length - 1) trail.append("");
    });
  }
  host.append(trail);

  const fs = document.createElement("fieldset");
  fs.innerHTML = "<legend>Box</legend>";
  const metrics = [
    ["size", Math.round(r.width) + " x " + Math.round(r.height)],
    ["padding", cs.padding],
    ["border-radius", cs.borderRadius],
    ["font-size", cs.fontSize],
    ["line-height", cs.lineHeight],
    ["color", cs.color],
  ];
  for (const [k, v] of metrics) {
    const row = document.createElement("div");
    row.className = "metric";
    row.innerHTML = "<span>" + k + "</span><span>" + v + "</span>";
    fs.append(row);
  }
  host.append(fs);

  const used = tokensFor(selected, doc);
  const fs2 = document.createElement("fieldset");
  fs2.innerHTML = "<legend>Tokens this element reads</legend>";
  if (used.length === 0) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent =
      "None. Its values are hard-coded Tailwind classes, not tokens — change them in the component, or promote them to tokens first.";
    fs2.append(p);
  }
  for (const name of used) {
    const g = data.groups.find((x) => name.startsWith(x.prefix));
    const tok = g && g.tokens.find((t) => t.name === name);
    if (!tok) continue;
    const scope = g.themed ? theme : "light";
    const row = document.createElement("div");
    row.className = "row";
    const lab = document.createElement("label");
    // Qualified by group here, unlike the Tokens tab. In a mixed list "lg" and
    // "border" could be a radius, a text size or a surface weight, and this
    // panel exists precisely so you know what you are about to change.
    lab.textContent = g.key + " \u00b7 " + tok.short;
    lab.title = name;
    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = edits[scope][name] ?? (scope === "dark" ? tok.dark : tok.light);
    inp.spellcheck = false;
    inp.addEventListener("input", () => {
      edits[scope][name] = inp.value;
      apply();
      sync();
    });
    const sw = document.createElement("span");
    sw.className = "sw";
    if (g.key === "color") sw.style.background = inp.value;
    row.append(lab, inp, sw);
    fs2.append(row);
  }
  host.append(fs2);

  if (selected.classList.contains("tile")) host.append(gridPanel(selected, doc));
}

/**
 * Grid resize. A tile's size is Tailwind placement classes in deck.tsx, not a
 * token, so dragging cannot go through the save path — the panel works out the
 * class change and applies it to source as an exact string swap.
 */
function gridPanel(el, doc) {
  const fs = document.createElement("fieldset");
  fs.innerHTML = "<legend>Grid span</legend>";
  const deck = el.closest(".deck");
  if (!deck) {
    fs.innerHTML += '<p class="hint">Not inside the deck grid.</p>';
    return fs;
  }
  const cs = doc.defaultView.getComputedStyle(deck);
  const cols = cs.gridTemplateColumns.split(" ").length;
  const rows = cs.gridTemplateRows.split(" ").length;
  const es = doc.defaultView.getComputedStyle(el);
  const p = document.createElement("p");
  p.className = "hint";
  p.innerHTML =
    "Grid is <code>" + cols + " x " + rows + "</code>. This tile sits at column <code>" +
    es.gridColumnStart + " / " + es.gridColumnEnd + "</code>, row <code>" +
    es.gridRowStart + " / " + es.gridRowEnd + "</code>.<br>" +
    "Drag its right or bottom edge in the preview to resize by whole grid tracks.";
  fs.append(p);
  const out = document.createElement("p");
  out.className = "hint";
  out.id = "grid-out";
  fs.append(out);
  return fs;
}

/** Keep the token tab's inputs in step when the element tab edits one. */
function sync() {
  if ($("#fields").hidden) return;
  for (const g of data.groups) {
    for (const t of g.tokens) {
      const i = document.getElementById("f-" + t.name);
      if (!i) continue;
      const scope = g.themed ? theme : "light";
      if (edits[scope][t.name] !== undefined) i.value = edits[scope][t.name];
    }
  }
}

function setMode(next) {
  picking = next === "pick";
  $("#m-tokens").setAttribute("aria-pressed", String(!picking));
  $("#m-pick").setAttribute("aria-pressed", String(picking));
  $("#fields").hidden = picking;
  $("#element").hidden = !picking;
  const doc = $("#site").contentDocument;
  if (doc) {
    const hov = doc.getElementById("__studio-hover");
    if (hov) hov.style.display = "none";
    doc.body.style.cursor = picking ? "crosshair" : "";
  }
  if (picking) renderElement();
}

$("#m-tokens").addEventListener("click", () => setMode("tokens"));
$("#m-pick").addEventListener("click", () => setMode("pick"));

function wirePicker() {
  const doc = $("#site").contentDocument;
  // The body check has to come before the flag. Called once at script end, the
  // iframe often has no body yet; setting __studioWired first and then throwing
  // in overlay() left the document marked as wired with no listeners on it, so
  // picking silently did nothing depending on how fast the frame loaded.
  if (!doc || !doc.body || doc.__studioWired) return;
  doc.__studioWired = true;

  const hover = overlay(doc, "__studio-hover",
    "outline:1px dashed rgba(0,0,0,.45);background:rgba(0,120,255,.08);display:none;");
  const sel = overlay(doc, "__studio-sel",
    "outline:2px solid #0a84ff;display:none;");

  doc.addEventListener("mousemove", (e) => {
    if (!picking) return;
    const el = e.target;
    if (!el || el.id?.startsWith("__studio")) return;
    hover.style.display = "block";
    place(hover, el.getBoundingClientRect(), doc);
  }, true);

  doc.addEventListener("click", (e) => {
    if (!picking) return;
    e.preventDefault(); e.stopPropagation();
    // A drag ends with a click wherever the pointer stopped, which is usually
    // outside the tile being resized. Without this the selection jumped to the
    // deck on mouseup and took the panel — including the Apply button — with it.
    if (justDragged) { justDragged = false; return; }
    selected = e.target;
    sel.style.display = "block";
    place(sel, selected.getBoundingClientRect(), doc);
    renderElement();
  }, true);

  // Edge drag: snap the selected tile to whole grid tracks.
  let drag = null;
  doc.addEventListener("mousedown", (e) => {
    if (!picking || !selected || !selected.classList.contains("tile")) return;
    const r = selected.getBoundingClientRect();
    const nearRight = Math.abs(e.clientX - r.right) < 8;
    const nearBottom = Math.abs(e.clientY - r.bottom) < 8;
    if (!nearRight && !nearBottom) return;
    e.preventDefault();
    drag = { edge: nearRight ? "right" : "bottom" };
  }, true);

  doc.addEventListener("mousemove", (e) => {
    if (!drag || !selected) return;
    const deck = selected.closest(".deck");
    if (!deck) return;
    const dr = deck.getBoundingClientRect();
    const view = doc.defaultView;
    const dcs = view.getComputedStyle(deck);
    const track = (list, size) => {
      const parts = list.split(" ").map(parseFloat);
      const gap = parseFloat(dcs.gap) || 0;
      let acc = 0, i = 0;
      for (; i < parts.length; i++) { acc += parts[i] + gap; if (acc > size) break; }
      return i + 2; // grid lines are 1-based and we want the closing line
    };
    if (drag.edge === "right") {
      const line = track(dcs.gridTemplateColumns, e.clientX - dr.left);
      selected.style.gridColumnEnd = String(Math.max(2, line));
    } else {
      const line = track(dcs.gridTemplateRows, e.clientY - dr.top);
      selected.style.gridRowEnd = String(Math.max(2, line));
    }
    place(sel, selected.getBoundingClientRect(), doc);
    reportGrid();
  }, true);

  doc.addEventListener("mouseup", () => {
    if (drag) justDragged = true;
    drag = null;
  }, true);
}

/**
 * Rewrite the last "variant:prop-N" class in a class string.
 *
 * Deliberately no regex. This code lives inside a template literal that is
 * itself a JS string, so a pattern written as min-backslash-bracket survives one unescape
 * and is eaten by the next — the earlier version compiled to min-[d+px] and
 * matched nothing while looking correct. String work has no such trap.
 *
 * The last occurrence is the one rewritten: placement classes are written in
 * ascending breakpoint order, so the last is the one winning at the width you
 * are looking at.
 */
function lastPlacementToken(cls, prop) {
  const needle = ":" + prop + "-";
  let found = null;
  for (const part of cls.split(" ")) {
    const at = part.indexOf(needle);
    if (at === -1) continue;
    const tail = part.slice(at + needle.length);
    if (tail === "" || !/^[0-9]+$/.test(tail)) continue;
    found = part;
  }
  return found;
}

/** Show the class change a drag implies, and offer to write it. */
function reportGrid() {
  const out = document.getElementById("grid-out");
  if (!out || !selected) return;
  const doc = $("#site").contentDocument;
  const es = doc.defaultView.getComputedStyle(selected);
  const wanted = [];
  if (selected.style.gridColumnEnd) wanted.push(["col-end", es.gridColumnEnd]);
  if (selected.style.gridRowEnd) wanted.push(["row-end", es.gridRowEnd]);
  if (wanted.length === 0) { out.textContent = ""; return; }
  // Send the single class token that changed, not the rendered className.
  // The rendered string carries what cn() prepends and is assembled across a
  // ternary in source, so it never appears verbatim in the file — the endpoint
  // correctly refused every time until this sent "lg:col-end-7" instead.
  const cls = String(selected.className);
  const changes = [];
  for (const [prop, val] of wanted) {
    const tok = lastPlacementToken(cls, prop);
    if (!tok) continue;
    const next = tok.slice(0, tok.lastIndexOf("-") + 1) + val;
    if (next !== tok) changes.push([tok, next]);
  }
  if (changes.length === 0) {
    out.innerHTML = '<span class="hint">Dragged, but no placement class to rewrite.</span>';
    return;
  }
  out.innerHTML = "";
  const pre = document.createElement("div");
  pre.className = "hint";
  pre.innerHTML = changes
    .map(([f, t]) => "<code>" + f + "</code> to <code>" + t + "</code>")
    .join("<br>");
  const btn = document.createElement("button");
  btn.textContent = "Apply to deck.tsx";
  btn.style.marginTop = "6px";
  btn.addEventListener("click", async () => {
    const done = [];
    for (const [f, t] of changes) {
      const r = await fetch("/__studio/apply-class", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ file: "src/components/home/deck.tsx", from: f, to: t }),
      });
      const j = await r.json();
      done.push((j.ok ? "wrote " : "skipped ") + f + (j.ok ? "" : " (" + j.error + ")"));
    }
    log(done.join(" \u00b7 "));
  });
  out.append(pre, btn);
}

$("#revert").addEventListener("click", () => {
  edits.light = {}; edits.dark = {};
  apply(); render();
  log("Reverted to the values currently in source.");
});

$("#save").addEventListener("click", async () => {
  const n = Object.keys(edits.light).length + Object.keys(edits.dark).length;
  if (n === 0) return log("Nothing changed.");
  log("Saving " + n + " token(s)…");
  const r = await fetch("/__studio/save", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(edits),
  });
  const out = await r.json();
  const lines = out.checks.map((c) => (c.ok ? "PASS" : "FAIL") + "  " + c.script + "  " + c.output);
  log("Wrote " + out.changed + " token(s).\\n" + lines.join("\\n") +
      (out.checks.every((c) => c.ok)
        ? "\\n\\nSource is green. The dev server will hot-reload."
        : "\\n\\nSource was written but a check failed — fix or revert in git."));
  // Re-read so the panel reflects what is actually on disk now.
  data = await (await fetch("/__studio/tokens")).json();
  edits.light = {}; edits.dark = {};
  render();
});

render();
wirePicker();
</script></body></html>`;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");

  if (url.pathname === "/__studio") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(PANEL);
  }

  if (url.pathname === "/__studio/tokens") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify(readTokens()));
  }

  if (url.pathname === "/__studio/save" && req.method === "POST") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    let changed = 0;
    try {
      changed = save(JSON.parse(Buffer.concat(chunks).toString()));
    } catch (e) {
      res.writeHead(500, { "content-type": "application/json" });
      return res.end(JSON.stringify({ changed: 0, checks: [{ script: "save", ok: false, output: String(e.message) }] }));
    }
    const checks = await verify();
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ changed, checks }));
  }

  if (url.pathname === "/__studio/apply-class" && req.method === "POST") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    try {
      const out = applyClass(JSON.parse(Buffer.concat(chunks).toString()));
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ ok: true, ...out }));
    } catch (e) {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ ok: false, error: String(e.message) }));
    }
  }

  // Everything else is the site, proxied so the preview iframe is same-origin
  // and its custom properties are reachable from the panel.
  try {
    const upstream = await fetch(TARGET + req.url, {
      method: req.method,
      headers: { ...req.headers, host: new URL(TARGET).host },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
      duplex: "half",
      redirect: "manual",
    });
    const headers = Object.fromEntries(upstream.headers);
    // The site sets SAMEORIGIN for its own origin; the proxy is a different
    // one, and this is a local tool, so the frame guard comes off here.
    delete headers["x-frame-options"];
    delete headers["content-encoding"];
    delete headers["content-length"];
    res.writeHead(upstream.status, headers);
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end(`Design Studio cannot reach ${TARGET}.\nStart the site first, e.g. npm run dev.`);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Design Studio  http://127.0.0.1:${PORT}/__studio`);
  console.log(`Previewing     ${TARGET}`);
  console.log("Writes src/app/globals.css and src/lib/design-tokens.ts together.");
});
