# Portfolio — Claude Code instructions

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
- **The deck must not scroll at ≥1024px wide and ≥760px tall.** Anything added
  to `/` has to fit its grid cell; tiles clip or scroll internally. If content
  does not fit, it belongs in a detail route, not in a taller tile. Below 760px
  of height the rows grow to their content and `<main>` scrolls — a 1440x700
  window is desktop-wide and laptop-short, and eight rows of it gave each tile
  ~145px, which clipped by up to 78px. The promise holds wherever there is room
  to keep it honestly.
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

## This repository is public

`profile/` and `docs/` are gitignored and must stay that way. They hold resume
sources, application drafts and interview preparation. Never add them.

## Verification before handoff

`npm run lint`, `npm run typecheck`, `npm run build`. All three are CI gates.
