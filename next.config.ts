import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
  basePath: "",
  assetPrefix: "./",
  trailingSlash: true, // Ensure trailing slashes for static export
};

export default nextConfig;
