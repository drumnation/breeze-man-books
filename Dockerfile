FROM node:22-alpine AS base
RUN npm install -g pnpm@10

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/ ./packages/
COPY tooling/ ./tooling/
COPY apps/web/ ./apps/web/

RUN pnpm install --frozen-lockfile

# Write production .env with all required VITE_ vars
RUN cat > apps/web/.env << 'ENVEOF'
VITE_SITE_URL=https://breezeman.singularity-labs.org
VITE_PRODUCT_NAME=Breeze Man Books
VITE_SITE_TITLE=The Brain Rot Books by Breeze Man
VITE_SITE_DESCRIPTION=Direct sales storefront for The Brain Rot Books by Breeze Man.
VITE_DEFAULT_THEME_MODE=light
VITE_THEME_COLOR=#ffffff
VITE_THEME_COLOR_DARK=#0a0a0a
VITE_AUTH_PASSWORD=true
VITE_AUTH_MAGIC_LINK=false
VITE_BILLING_PROVIDER=stripe
VITE_ENABLE_TEAM_ACCOUNTS=false
VITE_ENABLE_TEAM_ACCOUNTS_CREATION=false
VITE_ENABLE_PERSONAL_ACCOUNT_BILLING=false
VITE_ENABLE_TEAM_ACCOUNTS_BILLING=false
VITE_ENABLE_THEME_TOGGLE=false
VITE_ENABLE_PERSONAL_ACCOUNT_DELETION=false
VITE_ENABLE_TEAM_ACCOUNTS_DELETION=false
VITE_LOCALES_PATH=apps/web/public/locales
VITE_SUPABASE_URL=http://87.99.135.112:8000
VITE_SUPABASE_PUBLIC_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NDAzMTc2MCwiZXhwIjo0OTI5NzA1MzYwLCJyb2xlIjoiYW5vbiJ9.uaj0sb3XpaXN4CLS_wtyHGu8YKCLyCJqNy1boq1vgAQ
SUPABASE_SECRET_KEY=placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
MAILER_PROVIDER=nodemailer
EMAIL_SENDER=gordon@singularity-labs.org
EMAIL_HOST=localhost
EMAIL_PORT=25
EMAIL_TLS=false
EMAIL_USER=user
EMAIL_PASSWORD=password
CONTACT_EMAIL=gordon@singularity-labs.org
ENVEOF

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
