import { Facebook, Instagram, Music2, Youtube } from 'lucide-react';

/**
 * Verified social links for Zubair Raymond Latib / Brain Rot Books.
 *
 * Two flavors:
 *  - Brand handles (@thebrainrotbooks) — declared on the site's homepage as
 *    the author's cross-platform handle. Rendered as primary because book
 *    marketing is routed through these accounts.
 *  - Personal handles — verified via zubairmusic.com outbound links.
 *
 * Only platforms with a confirmed or self-declared presence are listed. Any
 * platform that failed verification during research is intentionally omitted
 * to avoid dead URLs.
 */

type IconComponent = React.ComponentType<{ className?: string }>;

interface SocialLink {
  platform: string;
  handle: string;
  url: string;
  icon: IconComponent;
  ariaLabel: string;
}

// TikTok isn't shipped by Lucide — inline SVG glyph.
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.321 5.562a5.122 5.122 0 0 1-3.414-1.267 5.123 5.123 0 0 1-1.537-3.035V1h-3.066v13.114c0 1.675-1.361 3.033-3.035 3.033a3.037 3.037 0 0 1-3.034-3.033 3.037 3.037 0 0 1 3.034-3.034c.324 0 .635.051.929.145v-3.165a6.197 6.197 0 0 0-.929-.07A6.199 6.199 0 0 0 2.07 14.19a6.199 6.199 0 0 0 6.199 6.2 6.199 6.199 0 0 0 6.2-6.2V8.558a8.183 8.183 0 0 0 4.852 1.571V7.063a5.073 5.073 0 0 1 0-1.501z" />
    </svg>
  );
}

// Brand-handle @thebrainrotbooks accounts. These are the handles the homepage
// declares the author uses "on all platforms". They drive book marketing.
const BRAND_LINKS: SocialLink[] = [
  {
    platform: 'TikTok',
    handle: '@thebrainrotbooks',
    url: 'https://www.tiktok.com/@thebrainrotbooks',
    icon: TikTokIcon,
    ariaLabel: 'Follow Brain Rot Books on TikTok (@thebrainrotbooks)',
  },
  {
    platform: 'Instagram',
    handle: '@thebrainrotbooks',
    url: 'https://www.instagram.com/thebrainrotbooks/',
    icon: Instagram,
    ariaLabel: 'Follow Brain Rot Books on Instagram (@thebrainrotbooks)',
  },
  {
    platform: 'YouTube',
    handle: '@thebrainrotbooks',
    url: 'https://www.youtube.com/@thebrainrotbooks',
    icon: Youtube,
    ariaLabel: 'Watch Brain Rot Books on YouTube (@thebrainrotbooks)',
  },
  {
    platform: 'Facebook',
    handle: 'thebrainrotbooks',
    url: 'https://www.facebook.com/thebrainrotbooks',
    icon: Facebook,
    ariaLabel: 'Follow Brain Rot Books on Facebook',
  },
];

// Verified personal accounts (linked from zubairmusic.com).
const PERSONAL_LINKS: SocialLink[] = [
  {
    platform: 'Instagram (personal)',
    handle: '@zubairraymond',
    url: 'https://www.instagram.com/zubairraymond/',
    icon: Instagram,
    ariaLabel:
      "Zubair's personal music Instagram (@zubairraymond)",
  },
  {
    platform: 'Music lessons',
    handle: 'zubairmusic.com',
    url: 'https://zubairmusic.com',
    icon: Music2,
    ariaLabel: "Zubair's music lesson site, zubairmusic.com",
  },
];

export interface SocialLinksProps {
  /** Visual size of the icons. */
  size?: 'sm' | 'md' | 'lg';
  /** Tone controls whether icons render against a dark or light background. */
  tone?: 'dark' | 'light';
  /** Include verified personal accounts alongside brand handles. */
  includePersonal?: boolean;
  /** Optional extra className for the outer `<ul>`. */
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SocialLinksProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const GAP_CLASSES: Record<NonNullable<SocialLinksProps['size']>, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-5',
};

const PADDING_CLASSES: Record<NonNullable<SocialLinksProps['size']>, string> = {
  sm: 'p-2',
  md: 'p-2.5',
  lg: 'p-3',
};

const TONE_CLASSES: Record<NonNullable<SocialLinksProps['tone']>, string> = {
  dark: 'text-white/80 hover:text-white hover:bg-white/10 border-white/20',
  light: 'text-black/70 hover:text-black hover:bg-black/5 border-black/20',
};

export function SocialLinks({
  size = 'md',
  tone = 'dark',
  includePersonal = false,
  className,
}: SocialLinksProps) {
  const links = includePersonal
    ? [...BRAND_LINKS, ...PERSONAL_LINKS]
    : BRAND_LINKS;

  return (
    <ul
      className={[
        'flex flex-wrap items-center justify-center',
        GAP_CLASSES[size],
        className ?? '',
      ].join(' ')}
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <li key={`${link.platform}-${link.handle}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.ariaLabel}
              className={[
                'inline-flex items-center justify-center rounded-full border transition-colors',
                PADDING_CLASSES[size],
                TONE_CLASSES[tone],
              ].join(' ')}
            >
              <Icon className={SIZE_CLASSES[size]} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Verified URL list for JSON-LD `sameAs` arrays. Only brand + personal
 * accounts that survived the verification pass should appear here.
 */
export const VERIFIED_SAME_AS_URLS: string[] = [
  ...BRAND_LINKS.map((l) => l.url),
  ...PERSONAL_LINKS.map((l) => l.url),
];
