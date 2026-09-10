import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.7.8'],
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
