import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_DESIGNSPACE_REVISION: process.env.VERCEL_GIT_COMMIT_SHA || "local working tree" },
};

export default nextConfig;
