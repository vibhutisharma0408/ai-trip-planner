import {withSentryConfig} from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const nextConfig = {
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
