import { ImageResponse } from "next/og";

import { FACTS, HEADLINE, LOCATION, NAME, ROLE_TITLE } from "@/lib/content/profile";

/**
 * The Open Graph card, generated at build time rather than shipped as a PNG.
 *
 * Every share of this site previously unfurled blank in Slack, LinkedIn and
 * iMessage. Generating it here means it can never drift from the content —
 * the name, role and facts come from the same module the page renders.
 *
 * Next reuses this for `twitter:image` given `summary_large_image`, so there is
 * no second file to keep in sync.
 *
 * Colours are literal hex, which is a defect anywhere else in this codebase.
 * Satori resolves neither CSS custom properties nor `oklch()`, so these are the
 * sRGB values of --color-canvas, --color-ink, --color-muted and --color-accent.
 * If the palette moves, these move with it.
 */
export const runtime = "nodejs";
export const alt = `${NAME} — ${ROLE_TITLE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CANVAS = "#f5f7fa";
const INK = "#0b1e3f";
const MUTED = "#4f5b72";
const ACCENT = "#0e5c6b";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: CANVAS,
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            {ROLE_TITLE}
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              color: INK,
            }}
          >
            {NAME}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 31,
              lineHeight: 1.35,
              color: MUTED,
              maxWidth: 940,
            }}
          >
            {HEADLINE}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ height: 1, backgroundColor: "#d8dde6" }} />
          <div
            style={{
              marginTop: 22,
              display: "flex",
              fontSize: 23,
              color: MUTED,
            }}
          >
            {/* The two facts a recruiter screens hardest on; the full four are
                on the page itself, where there is room for them. */}
            {[LOCATION, FACTS[3]].join("   ·   ")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
