import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@autoklick24/auth",
    "@autoklick24/database",
    "@autoklick24/domain",
    "@autoklick24/providers",
    "@autoklick24/types",
    "@autoklick24/validation",
  ],
};

export default nextConfig;
