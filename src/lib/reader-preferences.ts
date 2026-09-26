/**
 * Settings a reader has made in their browser rather than on this site, read
 * where motion or bytes are spent on their behalf. Browser-only: call these
 * from an effect or an event handler, never during render.
 */

/**
 * Whether the reader has asked to save data: Save-Data, or the media feature
 * where a browser ships it. Loading something because it scrolled into view
 * is not the reader asking for it, so under this nothing loads that way —
 * the deck's whole-page previews and the case-study recordings alike.
 */
export function savingData(): boolean {
  const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
  return connection?.saveData === true || window.matchMedia("(prefers-reduced-data: reduce)").matches;
}

/** Whether the reader has asked for less motion. */
export function reducingMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
