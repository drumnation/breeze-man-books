FROM node:22-alpine AS base
RUN npm install -g pnpm@10

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/ ./packages/
COPY tooling/ ./tooling/
COPY apps/web/ ./apps/web/

RUN pnpm install --frozen-lockfile

# Build-time env vars (VITE_ vars must be present at build time)
ENV VITE_SITE_URL=https://breezeman.singularity-labs.org
ENV VITE_SITE_NAME="Breeze Man Books"
ENV VITE_SITE_DESCRIPTION="The Brain Rot Books by Breeze Man - children book series"
ENV VITE_PRODUCT_NAME="Breeze Man Books"
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN pnpm --filter web build

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=base /app/apps/web/build ./build
COPY --from=base /app/apps/web/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "build/server/index.js"]
