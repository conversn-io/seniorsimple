import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vpysqshhafthuxvokwqj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Rewrite rules for IndexNow key file
  // Makes the key file accessible at root: /{key}.txt
  async rewrites() {
    const indexNowKey = process.env.INDEXNOW_KEY || 'seniorsimple-indexnow-key-2024';
    return [
      {
        source: `/${indexNowKey}.txt`,
        destination: '/api/indexnow/key',
      },
    ];
  },
  // Exclude Supabase Edge Functions from Next.js build
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/supabase/functions/**'],
    };
    return config;
  },
};

export default nextConfig;
