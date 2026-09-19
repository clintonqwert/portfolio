# Product

## Register

brand

Design IS the product here. The site's form is part of its argument: a portfolio
claiming engineering rigour has to demonstrate it, not assert it.

## Users

Hiring managers, engineering leads and technical recruiters evaluating Clinton
for senior and staff full-stack roles. Context matters more than demographics:
they open this on a laptop between other things, skim for evidence they can
verify, and decide inside ninety seconds whether to book a call. A meaningful
share arrive from a resume PDF or a LinkedIn profile, already half-persuaded,
looking for a reason to disqualify.

The job to be done: **let a skeptical technical reader confirm, quickly, that the
claims are real** — then give them something specific to open the conversation
with.

## Product Purpose

Convert an evaluation into a conversation. Success is a reply that quotes
something specific from the page — the performance budget, the 89% asset
reduction, or an item from the gaps table. A visit that ends in "looks nice" has
failed.

Secondary purpose: give Clinton one URL that replaces explaining himself. The
resume is the summary; this is the evidence.

## Brand Personality

**Rigorous · Senior · Direct.**

Someone who sets standards rather than someone demonstrating that they can meet
them. The voice states a mechanism and its consequence, then stops. It does not
sell, hedge, or reach for adjectives where a number would do.

The distinguishing move is candour as a strength signal: the site publishes its
own unfixed weaknesses — no test runner, silent lead loss on webhook failure — in
the same visual instrument as the wins. That is not modesty. It is the claim that
this person's self-assessment can be trusted, which is the thing the reader
actually cannot verify from code.

## Anti-references

- **Template resume sites.** Timeline dots, skill bars, pie charts of competence.
  Any visualisation that renders an unmeasurable thing as a measured one directly
  contradicts the site's argument.
- **Corporate consultancy.** Stock photography, blue-and-grey safety, vague
  capability statements with nothing checkable underneath.
- **Generic AI-SaaS landing pages.** Gradient heroes, the big-number-plus-small-
  label stat row as decoration, identical icon cards, uppercase tracked eyebrows
  above every section.
- **Cream / sand / warm near-white body backgrounds.** The saturated default of
  2026. Warmth, if wanted, comes from accent and typography — never from tinting
  the canvas.
- **Cloning the structural reference.** `portfolio.brewedops.cloud` informed the
  app-shell layout. Its palette, type and surface treatment are deliberately not
  reused; a portfolio arguing for deliberate decisions cannot be a recognisable
  copy of a peer's.

## Design Principles

1. **Practice what the copy preaches.** The site is subject to the same
   performance budget, accessibility gate and claims guard it describes. If a
   design choice cannot survive those, it does not ship.
2. **Every claim checkable in one click.** Figures sit next to the live URL or
   public repository that proves them. An unverifiable number is worth less than
   no number.
3. **Density over drama.** The reader is skimming for evidence, not being
   courted. Information per screen beats theatre per scroll.
4. **The gaps are load-bearing.** Weaknesses are published in the same visual
   register as strengths. Never soften, hide, or visually demote them.
5. **Identity preservation.** The deep teal `#0F5C6B` predates this redesign and
   stays. New surfaces are composed around it rather than replacing it.

## Accessibility & Inclusion

WCAG 2.2 AA, verified in CI. Lighthouse accessibility ≥ 0.98 is already asserted
in `lighthouserc.json` and remains a merge gate.

- Body text ≥ 4.5:1; large text ≥ 3:1. Verified, not assumed.
- Full keyboard path with visible focus on every interactive element.
- Every animation has a `prefers-reduced-motion: reduce` alternative.
- Content is never gated behind a scroll-triggered reveal: sections render
  visible by default and animation enhances, so headless renderers and hidden
  tabs still show everything.
- Colour is never the sole carrier of meaning — assertion states pair colour with
  text.
