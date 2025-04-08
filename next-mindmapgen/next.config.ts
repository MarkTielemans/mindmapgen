import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  assetPrefix: isProd ? '/mindmapgen/' : '',
  basePath: isProd ? '/mindmapgen' : '',
  output: 'export',
};

export default nextConfig;
