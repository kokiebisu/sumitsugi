import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.mensnonno.jp',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
        pathname: '/im/pictures/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4566',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
