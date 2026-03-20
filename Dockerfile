FROM node:22-alpine AS base
RUN npm install -g pnpm@10

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/ ./packages/
COPY tooling/ ./tooling/
COPY apps/web/ ./apps/web/

RUN pnpm install --frozen-lockfile
RUN cp -f apps/web/.env.production apps/web/.env

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm --filter web build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=base /app/apps/web/build ./build
COPY --from=base /app/apps/web/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000
ENV SUPABASE_SECRET_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NDAzMTc2MCwiZXhwIjo0OTI5NzA1MzYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.VhuKU2qqlUXJTzL5-7xR2ET1SZoaMp9O8wFVtkNi5vQ

EXPOSE 3000
CMD ["node", "build/server/index.js"]
