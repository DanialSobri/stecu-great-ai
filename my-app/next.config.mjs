/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Static export configuration for frontend-only deployment
  output: 'export',
  trailingSlash: true,
  // Disable server-side features for static export
  images: {
    unoptimized: true,
  },
  // Disable features that require server-side rendering
  experimental: {
    appDir: true,
  },
  // Optimize for static hosting
  compress: true,
  poweredByHeader: false,
  // Disable API routes for static export
  async rewrites() {
    return [];
  },
};

export default nextConfig;
