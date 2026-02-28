import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/home-scheduler',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
