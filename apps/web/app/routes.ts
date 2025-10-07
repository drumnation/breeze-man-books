import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

const rootRoutes = [
  route('robots.txt', 'routes/robots/route.tsx'),
  route('sitemap.xml', 'routes/sitemap/route.tsx'),
  route('version', 'routes/version.ts'),
  route('healthcheck', 'routes/healthcheck.ts'),
  route('update-password', 'routes/update-password.tsx'),
  route('join', 'routes/join.tsx'),
];

const apiRoutes = [
  route('api/accounts', 'routes/api/accounts.ts'),
  route('api/billing/checkout', 'routes/api/billing/checkout.ts'),
  route('api/billing/webhook', 'routes/api/billing/webhook.ts'),
  route('api/db/webhook', 'routes/api/db/webhook.ts'),
  route('api/otp/send', 'routes/api/otp/send.ts'),
];

const marketingLayout = layout('routes/marketing/layout.tsx', [
  index('routes/marketing/index.tsx'),
  route('terms-of-service', 'routes/marketing/terms-of-service.tsx'),
  route('privacy-policy', 'routes/marketing/privacy-policy.tsx'),
  route('pricing', 'routes/marketing/pricing.tsx'),
  route('contact', 'routes/marketing/contact/index.tsx'),
  route('faq', 'routes/marketing/faq.tsx'),
  route('blog', 'routes/marketing/blog/index.tsx'),
  route('blog/:slug', 'routes/marketing/blog/$slug.tsx'),
  route('cookie-policy', 'routes/marketing/cookie-policy.tsx'),
  layout('routes/marketing/docs/layout.tsx', [
    route('docs', 'routes/marketing/docs/index.tsx'),
    route('docs/*', 'routes/marketing/docs/$slug.tsx'),
  ]),
]);

const authLayout = layout('routes/auth/layout.tsx', [
  route('auth/sign-in', 'routes/auth/sign-in.tsx'),
  route('auth/sign-up', 'routes/auth/sign-up.tsx'),
  route('auth/password-reset', 'routes/auth/password-reset.tsx'),
  route('auth/verify', 'routes/auth/verify.tsx'),
  route('auth/callback', 'routes/auth/callback.tsx'),
  route('auth/callback/error', 'routes/auth/callback-error.tsx'),
  route('auth/confirm', 'routes/auth/confirm.tsx'),
]);

const adminLayout = layout('routes/admin/layout.tsx', [
  route('admin', 'routes/admin/index.tsx'),
  route('admin/accounts', 'routes/admin/accounts/index.tsx'),
  route('admin/accounts/:account', 'routes/admin/accounts/$account.tsx'),
]);

const userAccountLayout = layout('routes/home/user/layout.tsx', [
  route('home', 'routes/home/user/index.tsx'),
  route('home/settings', 'routes/home/user/settings.tsx'),
  route('home/billing', 'routes/home/user/billing.tsx'),
  route('home/billing/return', 'routes/home/user/billing-return.tsx'),
]);

const teamAccountLayout = layout('routes/home/account/layout.tsx', [
  route('home/:account', 'routes/home/account/index.tsx'),
  route('home/:account/settings', 'routes/home/account/settings.tsx'),
  route('home/:account/members', 'routes/home/account/members.tsx'),
  route('home/:account/members/policies', 'routes/home/account/policies.ts'),
  route('home/:account/billing', 'routes/home/account/billing.tsx'),
  route(
    'home/:account/billing/return',
    'routes/home/account/billing-return.tsx',
  ),
]);

export default [
  ...rootRoutes,
  ...apiRoutes,
  adminLayout,
  marketingLayout,
  authLayout,
  userAccountLayout,
  teamAccountLayout,
] satisfies RouteConfig;
