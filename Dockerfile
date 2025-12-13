# Production-ready Next.js 16 image
# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (prefer ci, fallback to install if lock is out of sync)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Copy source
COPY . .

# Build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 2) Run stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy only required files for runtime
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
# No public folder copy (app/ directory is used). Add if you create /public later.

# Next.js defaults to 3000
ENV PORT=3000
EXPOSE 3000

USER nextjs

CMD ["npm", "start"]
