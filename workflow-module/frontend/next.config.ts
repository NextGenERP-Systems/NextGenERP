import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.7.8'],
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL || 'http://workflow-backend:8082/api/v1';
    return [{
      source: '/api/v1/:path*',
      destination: `${backendUrl}/:path*`,
    }];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/workflows/dashboard',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/workflows/dashboard',
        permanent: true,
      },
      {
        source: '/workflows',
        destination: '/workflows/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
