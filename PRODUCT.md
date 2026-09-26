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
- **Tinted canvases of any kind.** Cream, sand and warm near-white are the
  saturated default of 2026, but the rule here is stricter than that: the
  surface is chroma 0. A tinted neutral would read as a decision the design
  does not make.

- **Rounded corners and drop shadows.** Every box is a ruled rectangle. Radius
  tokens exist but are `0px`; elevation is a hairline, not a shadow. A panel
  that floats contradicts a drawing that is meant to sit flat on the page.
- **Adopting a reference without auditing it.** `portfolio.brewedops.cloud`
  informed the app-shell layout, and a token spec extracted from it informed the
  2026-09-21 remodel: navy ink, soft radii, layered elevation, dense small type.
  That borrowing is deliberate and no longer an anti-reference. What stays
  forbidden is taking such a spec on trust. The extracted one was internally
  unreadable — navy on black at 1.27:1, near-white on white at 1.10:1 — and its
  type, spacing and radius "scales" were histograms of whatever the live site
  computed, not authored ramps. Every value borrowed from anywhere is measured
  against this project's gates before it ships.

## Design Principles

1. **Practice what the copy preaches.** The site is subject to the same
   performance budget, accessibility gate and claims guard it describes. If a
   design choice cannot survive those, it does not ship.
2. **Every claim checkable in one click.** Figures sit next to the live URL or
   public repository that proves them. An unverifiable number is worth less than
   no number.
3. **Dense where it is scanned, paced where it is read.** The reader is
   skimming for evidence, not being courted. The deck is the index: one
   viewport, information per screen over theatre per scroll. Every page it
   opens is a document: a hero that answers what, why and how to check it,
   then chapters at reading size with the room to be read. Motion there
   serves orientation — where you are, that there is more — and never
   performance for its own sake. The two layers are set differently on
   purpose: the deck's headline stays in sentence case, while a secondary
   page's hero headline is set in capitals at a medium weight, alone on its
   screen with room around it (a decision of 2026-09-25, after
   architech-template, whose cursor and scroll cue the site also borrows).
4. **The gaps are load-bearing.** Weaknesses are published in the same visual
   register as strengths. Never soften, hide, or visually demote them.
5. **Identity preservation — monochrome.** The palette is chroma 0 in both
   themes: black ink, white paper, grey for what recedes, and solid black
   blocks for emphasis. This comes from Clinton's own earlier design for this
   site (`profile/PortfolioSiteDesign`), which is strictly monochrome and lets
   colour arrive only through photography. The deep teal `#0F5C6B` that
   preceded it was retired on 2026-09-21 at his request; it was never his
   mark, and this is. Hierarchy is carried by weight, case and rule — never by
   hue. Adding an accent colour would undo the identity, not extend it.

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
