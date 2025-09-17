import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "svkroboticsedu.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  turbopack: {
    root: join(__dirname), // ✅ Εδώ ξεκαθαρίζεις το σωστό workspace root
  },
};

export default nextConfig;
