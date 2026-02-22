import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'avataaars.io',
      },
    ],
    // Local patterns for uploaded profile images
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
    ],
  },
  serverExternalPackages: ['mongoose'],
  turbopack: {},
}

export default nextConfig

