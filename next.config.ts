import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The /docs pages read markdown from src/content/docs at request time. File tracing
  // does not follow a runtime path join, so the directory is included explicitly or the
  // docs are empty in production.
  outputFileTracingIncludes: {
    "/docs": ["./src/content/docs/**/*"],
    "/docs/[slug]": ["./src/content/docs/**/*"],
  },
};

export default nextConfig;
