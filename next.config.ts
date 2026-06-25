import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@cross/self-learn'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
