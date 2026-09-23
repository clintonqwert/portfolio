# clintonramonida — portfolio

Engineering portfolio for Clinton Jay Ramonida. Built to the ProjectOS standard —
the same stack, layering and budgets as `driftpilot-site` and
`riflessi-autocare-site`.

## Run it

```sh
nvm use            # Node 22, pinned in .nvmrc
npm install
cp .env.example .env.local
npm run dev
```

| Script | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Claims and contrast checks, then production build |
| `npm run typecheck` | `next typegen` then `tsc --noEmit` |
| `npm run lint` | ESLint, `next/core-web-vitals` + TypeScript |
| `npm run check:claims` | Scans the content layer for retired claims |
| `npm run check:contrast` | WCAG 2.2 AA on both palettes, plus opacity modifiers |
| `npm run check:overflow` | Panel spill and unreachable fixed panels, seven viewports; needs a server |
| `npm run check:logos` | Skill logos match the generator and the skill list |
| `npm run gen:logos` | Regenerate `src/lib/logos.ts` from simple-icons |

`NEXT_PUBLIC_SITE_URL` is required. `src/lib/seo.ts` throws without it in
production rather than emitting wrong canonical URLs silently.

## Architecture

Routes compose, components present, content comes from typed accessors — see
ProjectOS `01-Engineering/coding-standards.md`.

```
src/app/              Routes. Metadata and layout only, no markup that belongs in a component.
src/components/
  layout/             Site chrome — header, footer
  home/               Homepage-specific sections
  shared/             Cross-page fragments — tables, stats, passages, JSON-LD
  ui/                 Primitives and class recipes
src/lib/content/      Typed async accessors. The only place facts live.
src/lib/seo.ts        Central metadata and JSON-LD builders
src/lib/design-tokens.ts  Mirrors the tokens in src/app/globals.css
src/types/content.ts  The contract between content and presentation
```

Every route is statically prerendered. There is no runtime database and no
client-side data fetching.

### Layout

The rail carries the profile — avatar, name, role, location, theme toggle — at
top-left, then navigation, then the résumé download. The workspace is three
bands: headline, a skills marquee, and the tile grid.

### The deck

`/` is a dashboard, not a landing page. At ≥1024px it fills exactly one viewport
and does not scroll: `body` is `overflow-hidden`, the deck is a 12×9 grid of
`100dvh`, and any tile whose content could exceed its cell scrolls inside itself.

Long-form prose lives in detail routes (`/autotrader`, `/gaps`, `/standard`,
`/history`, `/work/[slug]`). Those are viewport-fixed too — the page never
scrolls, the prose panel does. Below 1024px the constraint is lifted and the
page scrolls normally, because a single viewport on a phone means either three
tiles or unreadable type.

### Spacing

A 4pt scale — 2 / 4 / 8 / 12 / 16 / 24 / 32 / 48, exposed as `--space-1` …
`--space-8`. It replaced a Fibonacci run (3 / 5 / 8 / 13 / 21 / 34 / 55) in the
2026-09-21 remodel: Fibonacci was coherent but loose at the top, and the design
this now follows is dense at the small end, where ~1.6x steps are too coarse to
be useful.

One rule that is not a rhythm choice: the rail's contact links carry `py-[8px]`
because anything less puts their touch target under the 24px WCAG 2.2 minimum.
A scale sweep took them to 4px once and only Lighthouse noticed.

### Sections do not scroll

Detail prose flows into CSS columns (`.flow`) that fill the panel across, rather
than running past its bottom edge. Nothing is clipped: `/history` is block grids
rather than paragraphs — columns cannot paginate a grid — so it uses `raw` mode
and lays out three panels instead.

Both properties are measured, not assumed: every route is checked for page
scroll, for column spill, and for silently clipped `overflow:hidden` boxes.

### The marquee

`.marquee-track` renders the skill list twice and translates by exactly `-50%`,
which is what makes the loop seamless. The duplicate is `aria-hidden`, so a
screen reader hears the list once. Motion pauses on hover **and** on
`focus-within`, so a keyboard user can stop it to read. Under
`prefers-reduced-motion` the animation is removed and the strip becomes an
ordinary horizontal scroller — the content stays reachable rather than
disappearing with the motion.

### Themes

Light and dark, toggled from the rail and stored in `localStorage`, defaulting to
`prefers-color-scheme`. An inline script in `<head>` applies the theme before
first paint, so there is no flash. Dark is a separate palette rather than an
inversion, and `npm run check:contrast` verifies both themes independently.

### Deliberately absent

No CMS, no client-state library, no data-fetching library, no component library,
no contact form. ProjectOS lists the first four as absent by decision; the form is
absent because there is no CRM webhook to deliver to, so a `mailto:` is the honest
primitive. Adding any of them needs a written operating need.

## The claims guard

`npm run check:claims` fails the build if the content layer reintroduces a claim
that was retired in September 2026 — "multi-tenant", "conversational AI", the dead
`riflessiautocare.ca` domain, "production" applied to the two live sites, Riflessi
described as client or contract work, or the pipeline described as enforced at the
tool level.

Each was removed because the repositories did not support it. A wrong claim on a
portfolio is worse than a missing one: it is the thing an interviewer probes. The
guard runs before every build and in CI.

A line may quote a retired claim in order to warn against it — that is forgiven
only when the same line, or the one above it, carries an explicit warning cue.

## Measured, not asserted

First real Lighthouse run, 2026-09-20, median of three against a production
build on localhost:

| | `/` | `/work/driftpilot` | Budget |
|---|---|---|---|
| Performance | 1.00 | 1.00 | ≥ 0.95 |
| Accessibility | 1.00 | 1.00 | ≥ 0.98 |
| SEO | 1.00 | 1.00 | ≥ 0.95 |
| Best practices | 0.96 | 0.96 | ≥ 0.90 |
| LCP | 537 ms | 539 ms | < 1500 ms |
| CLS | 0.000 | 0.000 | < 0.05 |
| TBT | 0 ms | 0 ms | < 150 ms |
| Script transfer | 158.0 kB | — | < 260 kB |

The first run **failed**: accessibility came in at 0.92 / 0.91 against the
asserted 0.98. Three defects, all now fixed — see the commit. This is lab data
on localhost; field data will come from Speed Insights after the first deploy.

## Performance budget

`lighthouserc.json` carries the ProjectOS budget: performance ≥ 0.95,
accessibility ≥ 0.98, SEO ≥ 0.95, best practices ≥ 0.90, LCP < 1500 ms,
CLS < 0.05, TBT < 150 ms, script < 260 kB. It runs in CI against a production
build, median of three runs.

Fonts are self-hosted through `next/font`, which removes the only third-party
request and reserves metrics so swapping in the real face causes no layout shift.
