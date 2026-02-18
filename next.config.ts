import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // For static export (e.g. GitHub Pages), set NEXT_PUBLIC_STATIC_EXPORT=1.
  // Note: Server Actions and API routes are not supported with static export.
  ...(process.env.NEXT_PUBLIC_STATIC_EXPORT === "1" && {
    output: "export",
    distDir: "dist",
    images: { unoptimized: true },
    trailingSlash: true,
  }),
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  async headers() {
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
