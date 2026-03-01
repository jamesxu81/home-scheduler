import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Removed 'output: export' since we now need server-side API routes for database access
  // basePath: '/home-scheduler',
  // images: {
  //   unoptimized: true,
  // },
};

export default nextConfig;
