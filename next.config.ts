import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["framer-motion", "motion-dom"],
};

export default nextConfig;
