import { Link } from 'react-router';

import { ArrowRight } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { SitePageHeader } from '~/routes/marketing/_components/site-page-header';
import type { Route } from '~/types/app/routes/marketing/+types/about';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'About Zubair Raymond Latib — The Brain Rot Books' },
    {
      name: 'description',
      content:
        'Meet Zubair Raymond Latib, author of The Brain Rot Books — an absurd, heartfelt series for kids who like their stories silly, weird, and signed by a real human.',
    },
  ];
};

export default function AboutPage() {
  return (
    <div>
      <SitePageHeader
        title="About the Author"
        subtitle="Zubair Raymond Latib"
      />

      <div className="container mx-auto max-w-3xl px-4 pb-24 pt-10">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <img
            src="/images/zubair.webp"
            alt="Zubair Raymond Latib"
            className="h-48 w-48 rounded-full object-cover shadow-lg ring-4 ring-black/5"
            onError={(e) => {
              e.currentTarget.src = '/images/favicon/android-chrome-512x512.png';
            }}
          />

          <div className="space-y-6 text-lg leading-relaxed text-black/80">
            <p>
              Zubair Raymond Latib is the author of{' '}
              <strong>The Brain Rot Books</strong> — an unhinged, heartfelt series
              for kids who like their stories silly, weird, and proudly
              hand-signed.
            </p>
            <p>
              He writes the kind of books he wishes he&apos;d had growing up:
              fast-paced, a little gross, loud on the page, and deeply respectful
              of how clever kids actually are. Every book in the series is
              personally signed before it ships.
            </p>
            <p>
              When he&apos;s not writing, Zubair is probably drawing doodles in
              margins, arguing about snack policy with his family, or reading to
              his own very serious small literary critics at home.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold">Read the books</h2>
          <p className="max-w-md text-black/70">
            Signed copies are available direct from the author — no middleman,
            no retail markup, just books and a quick hello.
          </p>
          <Button asChild size="lg">
            <Link to="/store">
              Browse the shop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
