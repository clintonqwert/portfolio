import type { NextConfig } from "next";

// Set in code rather than in the Vercel dashboard so the security posture is
// reviewable in the diff and travels with the repository.
const httpHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Next 16 serves only listed qualities. 90 is for the deck's screenshot
    // windows: a whole desktop page shown ~400px wide is almost all fine
    // text, and at the default 75 a second lossy pass over an already-lossy
    // source was what turned it to mush. Everything else stays at 75.
    qualities: [75, 90],
  },
  async headers() {
    return [{ source: "/(.*)", headers: httpHeaders }];
  },
};

export default nextConfig;
