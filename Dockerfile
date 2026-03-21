# syntax=docker.io/docker/dockerfile:1
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

RUN corepack enable pnpm
RUN npm install -g turbo

COPY . .

RUN echo "node-linker=hoisted" >> .npmrc
RUN pnpm install --frozen-lockfile
RUN npm rebuild lightingcss --build-from-source --verbose 2>/dev/null || true

FROM base AS builder
WORKDIR /app

RUN corepack enable pnpm
RUN npm install -g turbo

COPY --from=deps /app ./

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN turbo run build --filter=web...

FROM base AS runner
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 rr

COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/build ./build
COPY --from=builder /app/node_modules ./node_modules
RUN npm -g install cross-env @react-router/serve

USER rr

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/healthcheck || exit 1

CMD ["npm", "start"]
