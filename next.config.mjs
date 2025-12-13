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
  // Netlify compatibility - remove standalone output (Netlify uses serverless functions)
  // output: 'standalone', // Commented out for Netlify deployment
  // Turbopack config (empty to silence warning)
  turbopack: {},
};

export default nextConfig;
