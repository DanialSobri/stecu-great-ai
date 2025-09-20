/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Amplify-specific configuration
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Enable serverless functions for API routes
  trailingSlash: false,
  // Optimize for Lambda deployment
  compress: true,
  poweredByHeader: false,
  // Configure for AWS Amplify
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
