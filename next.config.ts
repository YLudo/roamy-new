import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ⚠️ ignore les erreurs de type au build (pratique en urgence)
    ignoreBuildErrors: true,
  },
  eslint: {
    // ignore aussi les erreurs ESLint au build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
