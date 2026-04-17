import { z } from 'zod';

const production = process.env.NODE_ENV === 'production';

const AppConfigSchema = z
  .object({
    name: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    url: z.string().url(),
    locale: z.string().default('en'),
    theme: z.enum(['light', 'dark', 'system']).default('light'),
    production: z.boolean(),
    themeColor: z.string(),
    themeColorDark: z.string(),
  })
  .refine((schema) => schema.themeColor !== schema.themeColorDark, {
    message: `Please provide different theme colors for light and dark themes.`,
    path: ['themeColor'],
  });

// Hardcode theme colors to bypass env validation issues
const THEME_COLOR_LIGHT = '#ffffff';
const THEME_COLOR_DARK = '#0a0a0a';

const appConfig = AppConfigSchema.parse({
  name: import.meta.env.VITE_PRODUCT_NAME ?? 'Breeze Man Books',
  title: import.meta.env.VITE_SITE_TITLE ?? 'The Brain Rot Books by Breeze Man',
  description:
    import.meta.env.VITE_SITE_DESCRIPTION ??
    'Direct sales storefront for The Brain Rot Books by Breeze Man.',
  url:
    import.meta.env.VITE_SITE_URL ?? 'https://breezeman.singularity-labs.org',
  locale: import.meta.env.VITE_DEFAULT_LOCALE ?? 'en',
  theme:
    (import.meta.env.VITE_DEFAULT_THEME_MODE as 'light' | 'dark' | 'system') ??
    'light',
  themeColor: THEME_COLOR_LIGHT,
  themeColorDark: THEME_COLOR_DARK,
  production,
});

export default appConfig;
