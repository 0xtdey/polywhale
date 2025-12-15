import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server-side rendering for API routes
  serverExternalPackages: ["better-sqlite3"],
  
  // Allow service worker
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Service-Worker-Allowed", value: "/" },
        { key: "Cache-Control", value: "no-cache" },
      ],
    },
  ],
};

export default nextConfig;
