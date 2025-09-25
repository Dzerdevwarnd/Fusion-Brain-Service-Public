# Build stage
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install deps with lockfile (include dev deps)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --prod=false

# Build
COPY . .
RUN pnpm prisma:generate && pnpm build

# Runtime stage
FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

# Enable pnpm via corepack for runtime stage
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy runtime artifacts and node_modules (includes generated Prisma Client)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]

