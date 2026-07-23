import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bite/contracts'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.admin.getabite.co',
        pathname: '/items/olo/**',
      },
    ],
  },
  turbopack: {
    root: path.resolve(process.cwd(), '../..'),
  },
};

export default nextConfig;
