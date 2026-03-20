FROM node:22-alpine AS base
ARG CACHEBUST=1
RUN npm install -g pnpm@10

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/ ./packages/
COPY tooling/ ./tooling/
COPY apps/web/ ./apps/web/

RUN pnpm install --frozen-lockfile

# Use production env (force copy to bust cache)
RUN cp -f apps/web/.env.production apps/web/.env && cat apps/web/.env | grep THEME_COLOR

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
