import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { FACTS, LEDE, LOCATION, NAME, ROLE_TITLE } from "@/lib/content/profile";

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
 * sRGB values of the light theme's --color-canvas, --color-ink, --color-muted,
 * --color-accent and --color-line. If the palette moves, these move with it —
 * they did not when it went monochrome, and the card stayed navy and teal
 * until 2026-09-26, when the brand mark joined it and would have clashed.
 *
 * The mark is the negative-space CR from the brand sheet (public/brand), read
 * at build time and inlined: the card is prerendered, so nothing is fetched.
 */
export const runtime = "nodejs";
export const alt = `${NAME} — ${ROLE_TITLE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CANVAS = "#ffffff";
const INK = "#0f0f0f";
const MUTED = "#5d5d5d";
const ACCENT = "#0f0f0f";
const LINE = "#bebebe";

export default async function OpengraphImage() {
  const mark = `data:image/png;base64,${readFileSync(join(process.cwd(), "public/brand/cr-mark.png")).toString("base64")}`;

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
            {/* The position, not the headline: the card already names the
                role above, and the headline starts with it. */}
            {LEDE}
          </div>
        </div>
          <img src={mark} width={120} height={101} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ height: 1, backgroundColor: LINE }} />
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
