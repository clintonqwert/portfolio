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
  <div class="scroll" id="fields"></div>
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
$("#site").addEventListener("load", () => { setTheme(theme); apply(); });

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
