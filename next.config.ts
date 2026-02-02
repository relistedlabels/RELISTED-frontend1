import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.paystack.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
   experimental: {
    serverActions: {
      bodySizeLimit: "20mb", // 👈 FIXES 1MB LIMIT
    },
  },
};

export default nextConfig;
