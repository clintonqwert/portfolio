# Release notes

Each release is tagged `vX.Y.Z` on `main` and published as a GitHub release,
the same way as `driftpilot-site`. Milestones are listed under the release that
shipped them, newest first.

- **Numbering** follows SemVer as it applies to a website: a patch for fixes,
  copy and docs; a minor for new capability, such as a new page or a new check;
  a major for a redesign or a change in what the site is for.
- **`package.json`** carries the latest release's version.
- **The version bump and its notes** go through a normal pull request. The tag
  and the GitHub release are created only after the owner merges it, on that
  merge commit, with the release's section below as the release notes.

## Unreleased

Nothing yet.

## v1.0.0 — 2026-10-06

The first numbered release: the portfolio as it stands at clintonramonida.ca,
after every pull request from #1 to #26.

- **Ten routes.**
  - The overview, a deck of tiles.
  - AutoTrader.ca and its three case studies: Tadvantage, myGarage and Luxury
    tax.
  - The studio's two sites: DriftPilot and Riflessi.
  - History; How I use AI (the Project OS standard); and the Roadmap.
- **One reading path.** Every page carries its number from the rail, and each
  page's close offers the next one in rail order.
- **The overview fits one screen.** At 1024×760 and up it never scrolls. Below
  760px of height its rows grow to their content, and on a phone the tiles
  stack and the page scrolls.
- **Light and dark themes,** each checked independently for WCAG AA contrast.
- **Every claim checks out** against a repository or a live URL. The build
  fails if a retired claim comes back.
- **CI on every pull request:**
  - retired claims and contrast;
  - lint and typecheck;
  - the production build;
  - the fit and behaviour checks across viewports;
  - Lighthouse budgets on desktop and mobile.

### 2026-10-06 — The last changes before the tag (#24–#26)

- **#24:** a phone's page ends at the Résumé button instead of 64px of blank
  page past it. The Project OS counts and the repository URLs each live in one
  place.
- **#25:** the phone page-end check measures whichever element scrolls, so it
  can't pass without measuring. The role counts come from the role list. The
  GitHub handle is written once.
- **#26:** the README links the live site and says which budget it holds.
