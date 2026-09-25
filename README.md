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
  layout/             Site chrome — rail, page hero, scroll cue, chapter bar, page close
  home/               Homepage-specific sections
  case-study/         Case-study-only sections — stack list, measured figures
  shared/             Cross-page fragments — chapters, tables, screenshots, JSON-LD
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

Below 1024px the constraint is lifted and the page scrolls normally, because a
single viewport on a phone means either three tiles or unreadable type.

### Secondary pages

Everything the deck links to — `/work/[slug]`, `/autotrader`, `/standard`,
`/history`, `/gaps` — is a document that scrolls, deliberately unlike the deck.
The deck is scanned; these are read. The rail stays fixed beside both, and
`<main>` takes the scroll at ≥1024px, so the frame never moves.

Each page is a **hero** that fills the first viewport (kicker with the rail's
index chip, headline, lede, a ruled title block of facts and links, and a
screenshot when a real one exists), then numbered **chapters** with a sticky
head, then a **close** that offers the next page in rail order. Case studies
add a parts-list Stack chapter and an inverted Measured chapter for their
figures. Chapters keep the author's order; a page never grows a section its
content does not have.

A hero that fits its viewport reads as a finished page, so a **scroll cue**
sits at the fold until the reader starts scrolling. At ≥1024px a **chapter
bar** slides in once the hero has gone, naming the current chapter with a
scroll-timeline progress line. Both are small IntersectionObserver clients;
every other motion is CSS — scroll-driven where it tracks reading, off under
`prefers-reduced-motion`, and never gating content that is otherwise
visible.

### CSS conventions

Four class families, documented in full at the top of `src/app/globals.css`:
**surface** (`.panel` `.tile` `.chip` `.rail`), **layout** (`.deck` `.flow`
`.datagrid` `.marquee` `.sheet` `.hero` `.titleblock` `.chapter`
`.flowchart`), **type role** (`.display` `.label` `.meta`
`.figure-value` `.figure-label`) and **media** (`.portrait`).

A type role never sets colour — the same `.label` is accent on a tile head and
faint in a figure — so colour stays a utility at the call site. A hyphen means
"part of" (`.marquee-track`), never "variant of".

Everything on a rhythm uses the scale. Arbitrary values are for genuine
one-offs only and carry a comment saying why.

### Spacing

Tailwind's scale on a 4px base unit (`--spacing`), so `p-2` is 8px and `gap-3`
is 12px.

There used to be a second scale named `--space-1` … `--space-8`. It looked like
the design system but no utility could reach it — `--space-*` is not a Tailwind
namespace — so `p-3` never meant `--space-4`, and components wrote `p-[12px]`
instead. That is where most of 238 arbitrary values came from. A token the
framework cannot see is worse than no token, so there is one scale now.

One rule that is not a rhythm choice: the rail's contact links carry `py-2`
because anything less puts their touch target under the 24px WCAG 2.2 minimum.
A scale sweep took them to 4px once and only Lighthouse noticed.

### Prose is one column

Chapter prose (`.flow`) is one measured column at 17px, never CSS
multi-column. Detail pages once flowed prose into columns to avoid scrolling,
and column balance fills whatever height it is given — so every short case
study became three-line columns over a third of a screen of blank panel.

Fit is measured, not assumed: every route is checked at seven viewports for
tile spill, silently clipped `overflow:hidden` boxes, unreachable fixed
panels and horizontal overflow.

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
