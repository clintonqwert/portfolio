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
  async headers() {
    return [{ source: "/(.*)", headers: httpHeaders }];
  },
};

export default nextConfig;
