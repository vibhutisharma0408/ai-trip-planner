/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicit empty Turbopack config to silence builder selection warnings
  turbopack: {},
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  }
};

export default nextConfig;
