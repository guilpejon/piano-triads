# Build stage - runs natively (not emulated) for faster builds
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Install native bindings for both arm64 and x64 platforms (cross-compilation support)
RUN npm install --no-save --force \
    @rollup/rollup-linux-arm64-musl @rollup/rollup-linux-x64-musl \
    lightningcss-linux-arm64-musl lightningcss-linux-x64-musl \
    @tailwindcss/oxide-linux-arm64-musl @tailwindcss/oxide-linux-x64-musl \
    2>/dev/null || true

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "build"]
