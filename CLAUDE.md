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
- Semantic tokens only. Raw hex in a component is a defect. The palette is
  mirrored between `src/app/globals.css` and `src/lib/design-tokens.ts` — change
  both together.
- Ask before changing the gaps table, the AutoTrader measurement caveat, or any
  public claim about the work.

## This repository is public

`profile/` and `docs/` are gitignored and must stay that way. They hold resume
sources, application drafts and interview preparation. Never add them.

## Verification before handoff

`npm run lint`, `npm run typecheck`, `npm run build`. All three are CI gates.
