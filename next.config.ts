import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql", "@prisma/client"],
  outputFileTracingIncludes: {
    "/*": ["./prisma/migrations/**/*"],
  },
  async rewrites() {
    return [
      { source: "/apple-touch-icon.png", destination: "/apple-icon" },
      { source: "/apple-touch-icon-precomposed.png", destination: "/apple-icon" },
      { source: "/apple-touch-icon-:size.png", destination: "/apple-icon" },
      { source: "/apple-touch-icon-:size-precomposed.png", destination: "/apple-icon" },
    ];
  },
};

export default nextConfig;
