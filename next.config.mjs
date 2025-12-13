/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  // Disable source maps completely to avoid parsing errors
  productionBrowserSourceMaps: false,
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Render.com compatibility - use standalone output
  output: 'standalone',
  // Turbopack config (empty to silence warning)
  turbopack: {},
};

export default nextConfig;
