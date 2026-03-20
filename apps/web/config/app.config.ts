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
    themeColor: z.string().default('#ffffff'),
    themeColorDark: z.string().default('#0a0a0a'),
  })
  .refine(
    (schema) => schema.themeColor !== schema.themeColorDark,
    {
      message: `Please provide different theme colors for light and dark themes.`,
      path: ['themeColor'],
    },
  );

const appConfig = AppConfigSchema.parse({
  name: import.meta.env.VITE_PRODUCT_NAME ?? 'Breeze Man Books',
  title: import.meta.env.VITE_SITE_TITLE ?? 'The Brain Rot Books by Breeze Man',
  description: import.meta.env.VITE_SITE_DESCRIPTION ?? 'Direct sales storefront for The Brain Rot Books by Breeze Man.',
  url: import.meta.env.VITE_SITE_URL ?? 'https://breezeman.singularity-labs.org',
  locale: import.meta.env.VITE_DEFAULT_LOCALE,
  theme: import.meta.env.VITE_DEFAULT_THEME_MODE,
  themeColor: import.meta.env.VITE_THEME_COLOR ?? '#ffffff',
  themeColorDark: import.meta.env.VITE_THEME_COLOR_DARK ?? '#0a0a0a',
  production,
});

export default appConfig;
