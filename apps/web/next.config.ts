import type { NextConfig } from 'next';
import { join } from 'path';

// Where the Next server itself reaches the API (server-side fetches, rewrites).
// In Docker this is the internal service URL; the browser uses NEXT_PUBLIC_API_URL.
const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ||
  (process.env.NEXT_PUBLIC_API_URL?.startsWith('http') ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:3001/api');
const API_ORIGIN = INTERNAL_API_URL.replace(/\/api\/?$/, '');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: join(__dirname, '../../'),
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Only bundle the icons / animation helpers actually used (smaller JS, faster dev compiles)
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    // Lets the site work on a single origin even without a reverse proxy in front
    return [
      { source: '/api/:path*', destination: `${INTERNAL_API_URL}/:path*` },
      { source: '/uploads/:path*', destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
