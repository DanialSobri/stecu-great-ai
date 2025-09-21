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
  // Optimize for static hosting
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
