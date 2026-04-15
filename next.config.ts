import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure the app root is this project directory.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
