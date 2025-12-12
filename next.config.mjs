/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicit empty Turbopack config to silence builder selection warnings
  turbopack: {},
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  // Disable Turbopack to fix Clerk compatibility issues
  webpack: (config) => {
    return config;
  }
};

export default nextConfig;
