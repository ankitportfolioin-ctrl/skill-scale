/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits a self-contained server bundle. Required if you deploy to Railway/Docker;
  // harmless on Vercel, which handles output packaging itself.
  output: 'standalone',

  // Dev-only origin allowlist for running behind a tunnelled/remote dev host or preview container.
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '**.run.app',
    '*.run.app',
    '*.asia-east1.run.app',
    '**.googleusercontent.com',
    'ais-dev-zwrg2kjyrskemerakzpufd-462126489907.asia-east1.run.app',
    'ais-pre-zwrg2kjyrskemerakzpufd-462126489907.asia-east1.run.app',
  ],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'docs.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
