# Portfolio — agent instructions

Codex reads this file directly; Claude Code reads it through `CLAUDE.md`, which
imports it. Edit the rules here, so both agents keep reading the same ones.

Read `README.md` and the ProjectOS standard at `../ProjectOS/` before planning
material work. The repository is the technical source of truth.

## Working rules

- Preserve the static-first App Router architecture and the typed
  content-accessor layering. Components receive data as props; they never import
  content modules.
- **Do not invent claims.** Every fact on this site is verifiable against a
  repository or a live URL. `src/lib/content/profile.ts` holds the wording rules
  that are easy to get wrong — read them before editing prose.
- `npm run check:claims` must pass. It is not a formality: it exists because
  earlier drafts of this material drifted into claims the repositories did not
  support.
- Reuse the token, content, SEO and component systems before adding alternatives.
- **`/` is a landing page that scrolls** (v2, 2026-10-31): a hero with the two
  actions and four proof points, then numbered chapters. It replaced the
  one-screen deck, which Project OS keeps as a template
  (`06-Templates/dashboard-deck`). Keep the landing to what proves the
  headline: each proof point links to the page that owns its fact, and
  secondary figures belong on that page, not on `/`. The accent goes on the
  primary action, the one key figure and link hover only.
- **The rail must never hide its own content.** It is `position: fixed`, so
  anything past its edge cannot be scrolled to by the page. It carries
  `overflow-y-auto` for that reason; do not remove it to tidy a scrollbar away.
- Both themes are first-class. Never add a raw colour; both palettes are checked
  by `npm run check:contrast` and dark is not inferred from light.
- Semantic tokens only. Raw hex in a component is a defect. The palette is
  mirrored between `src/app/globals.css` and `src/lib/design-tokens.ts` — change
  both together. `npm run check:tokens` compares them and fails the build on a
  mismatch; it exists because the mirror silently drifted on twelve colours.
- Ask before changing the gaps table, the AutoTrader measurement caveat, or any
  public claim about the work.

## Releases

Record each merged milestone in `RELEASE-NOTES.md` under **Unreleased**. A
release is a normal pull request: it bumps `package.json` and the lockfile,
moves those notes under the new version, and updates the README's release line.
Tag `vX.Y.Z` on its merge commit and publish the GitHub release only after the
owner merges it. The numbering rules are at the top of `RELEASE-NOTES.md`.

## This repository is public

`profile/` and `docs/` are gitignored and must stay that way. They hold resume
sources, application drafts and interview preparation. Never add them.

## Verification before handoff

`npm run lint`, `npm run typecheck`, `npm run build`. All three are CI gates.
