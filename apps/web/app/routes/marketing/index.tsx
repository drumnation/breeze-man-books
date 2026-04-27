import { useState } from 'react';

import type { Route } from '~/types/app/routes/marketing/+types/index';

import { SocialLinks } from './_components/social-links';

const BOOKS = [
  {
    id: 'book1-signed',
    title: 'Breeze Man vs. The Laser Sharks',
    subtitle: 'Signed Copy',
    cover: '/books/book1-cover.png',
    description:
      'When Laser Sharks invade the coast, only one hero has enough rizz to stop them. Breeze Man enters the chat.',
    amazon: 'https://www.amazon.com/dp/B0FHWTFPWD',
    price: 12,
  },
  {
    id: 'book2-signed',
    title: 'Breeze Man vs. The Basic Overlord',
    subtitle: 'Signed Copy',
    cover: '/books/book2-cover.png',
    description:
      'The Basic Overlord wants to make everything mid. Breeze Man must protect the drip at all costs.',
    amazon: 'https://www.amazon.com/dp/B0FFT561TR',
    price: 12,
  },
  {
    id: 'book3-signed',
    title: 'Breeze Man vs. The Rizz Badger',
    subtitle: 'Signed Copy',
    cover: '/books/book3-cover.png',
    description:
      'A new rival with unmatched rizz appears. Can Breeze Man out-rizz the Rizz Badger? No cap.',
    amazon: 'https://www.amazon.com/dp/B0FSZGSZNG',
    price: 12,
  },
] as const;

type Book = (typeof BOOKS)[number];

// TODO: book2-reading.mov must be transferred to /app/build/client/books/ in the container
// and committed to public/books/ in the repo before this slide goes live.
const VIDEO_SLIDES = [
  {
    src: '/books/book1-reading.mov',
    poster: '/books/book1-cover.png',
    label: 'Book 1 Reading',
  },
  {
    src: '/books/book2-reading.mov',
    poster: '/books/book2-cover.png',
    label: 'Book 2 Reading',
  },
];

export const loader = async (_args: Route.LoaderArgs) => {
  const url = new URL(_args.request.url);
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  const checkoutEnabled =
    !!stripeSecretKey && !stripeSecretKey.startsWith('sk_test_placeholder');
  const checkoutStatus: 'success' | 'canceled' | null = url.searchParams.has(
    'success',
  )
    ? 'success'
    : url.searchParams.has('canceled')
      ? 'canceled'
      : null;

  return {
    merchantName: 'Breeze Man Books',
    checkoutEnabled,
    checkoutStatus,
  };
};

function VideoCarousel() {
  const [current, setCurrent] = useState(0);

  function prev() {
    setCurrent((c) => (c === 0 ? VIDEO_SLIDES.length - 1 : c - 1));
  }

  function next() {
    setCurrent((c) => (c === VIDEO_SLIDES.length - 1 ? 0 : c + 1));
  }

  // Touch / swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0]!.clientX);
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0]!.clientX;
    if (diff > 40) next();
    else if (diff < -40) prev();
    setTouchStart(null);
  }

  const slide = VIDEO_SLIDES[current]!;

  return (
    <div
      className="relative mx-auto max-w-2xl"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Video frame */}
      <div className="relative aspect-video overflow-hidden border-4 border-black bg-black">
        {VIDEO_SLIDES.map((s, i) => (
          <video
            key={s.src}
            controls
            preload="metadata"
            poster={s.poster}
            className={`h-full w-full transition-opacity duration-300 ${i === current ? 'opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'}`}
          >
            <source src={s.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ))}
      </div>

      {/* Label */}
      <p className="mt-3 text-center text-xs font-bold tracking-widest uppercase opacity-50">
        {slide.label}
      </p>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous video"
        className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 border-4 border-black bg-white px-3 py-2 text-lg font-black shadow-md transition-colors hover:bg-black hover:text-white"
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next video"
        className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 border-4 border-black bg-white px-3 py-2 text-lg font-black shadow-md transition-colors hover:bg-black hover:text-white"
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="mt-4 flex justify-center gap-3">
        {VIDEO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-3 w-3 border-2 border-black transition-colors ${i === current ? 'bg-black' : 'bg-white hover:bg-neutral-300'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { checkoutEnabled, checkoutStatus } = loaderData;

  return (
    <div className="flex flex-col">
      <CheckoutStatusBanner status={checkoutStatus} />

      {/* HERO */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-black text-white">
        <img
          src="/books/hero.png"
          alt="The Brain Rot Books characters"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-40"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl leading-none font-black tracking-tighter uppercase md:text-7xl lg:text-8xl">
            THESE AREN&apos;T JUST BOOKS.
            <br />
            <span className="mt-2 inline-block border-4 border-white px-4 py-1">
              THEY ARE A VIBE.
            </span>
          </h1>
          <p className="mt-6 text-lg font-bold tracking-widest uppercase opacity-70">
            @thebrainrotbooks on all platforms
          </p>
          <div className="mt-5">
            <SocialLinks size="lg" tone="dark" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#books"
              className="border-2 border-white bg-white px-8 py-3 text-sm font-black tracking-wide text-black uppercase transition-colors hover:bg-transparent hover:text-white"
            >
              See the Books
            </a>
            <a
              href="#bundle"
              className="border-2 border-white px-8 py-3 text-sm font-black tracking-wide uppercase transition-colors hover:bg-white hover:text-black"
            >
              Get Signed Copies
            </a>
          </div>
        </div>
      </section>

      {/* VIDEO CAROUSEL SECTION */}
      <section className="border-b-4 border-black bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-2 text-3xl font-black tracking-tighter uppercase md:text-4xl">
            Watch Breeze Man in Action
          </h2>
          <p className="mb-8 text-sm font-bold tracking-widest uppercase opacity-50">
            Story readings from the series
          </p>
          <VideoCarousel />
        </div>
      </section>

      {/* BOOKS SECTION */}
      <section id="books" className="border-b-4 border-black bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-4xl font-black tracking-tighter uppercase md:text-5xl">
            THE BRAIN ROT BOOKS
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {BOOKS.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                checkoutEnabled={checkoutEnabled}
              />
            ))}
          </div>
        </div>
      </section>

      {/* WHY BUY DIRECT */}
      <section className="border-b-4 border-black bg-neutral-100 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-8 text-2xl font-black tracking-tighter uppercase md:text-3xl">
            Why Buy Direct?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="border-4 border-black bg-white p-6">
              <p className="mb-2 text-3xl">✍️</p>
              <p className="font-black tracking-tight uppercase">
                Signed by the Author
              </p>
              <p className="mt-1 text-sm opacity-60">
                Every copy personally signed by Zubair Raymond Latib
              </p>
            </div>
            <div className="border-4 border-black bg-white p-6">
              <p className="mb-2 text-3xl">💰</p>
              <p className="font-black tracking-tight uppercase">
                Better Bundle Value
              </p>
              <p className="mt-1 text-sm opacity-60">
                All 3 signed for $29 — that&apos;s a deal Amazon can&apos;t
                match
              </p>
            </div>
            <div className="border-4 border-black bg-white p-6">
              <p className="mb-2 text-3xl">🤝</p>
              <p className="font-black tracking-tight uppercase">
                Support the Creator
              </p>
              <p className="mt-1 text-sm opacity-60">
                Buying direct puts more in the author&apos;s pocket
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-BOOK BUNDLE SECTION */}
      <section
        id="bundle"
        className="border-b-4 border-black bg-black py-16 text-white"
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-4xl font-black tracking-tighter uppercase md:text-5xl">
            3-BOOK SIGNED BUNDLE
          </h2>
          <p className="mb-2 text-lg font-bold">
            All three books — signed — for just $29
          </p>
          <p className="mb-8 text-sm opacity-70">
            The complete Breeze Man collection. A signed set makes a great gift
            for any kid who needs maximum rizz on their bookshelf.
          </p>
          <BundleCta checkoutEnabled={checkoutEnabled} />
        </div>
      </section>
    </div>
  );
}

function CheckoutStatusBanner({
  status,
}: {
  status: 'success' | 'canceled' | null;
}) {
  if (!status) {
    return null;
  }

  const content =
    status === 'success'
      ? {
          heading: 'Order confirmed',
          message:
            'Thank you for supporting Zubair and The Brain Rot Books. A receipt and order details are on their way to your email.',
          className: 'border-emerald-700 bg-emerald-50 text-emerald-950',
        }
      : {
          heading: 'Checkout canceled',
          message: 'No charge was made. You can restart checkout anytime.',
          className: 'border-amber-700 bg-amber-50 text-amber-950',
        };

  return (
    <section
      aria-live="polite"
      className={`border-b-4 px-4 py-4 ${content.className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-black tracking-wide uppercase">
          {content.heading}
        </p>
        <p className="max-w-3xl text-sm font-bold">{content.message}</p>
      </div>
    </section>
  );
}

function BundleCta({ checkoutEnabled }: { checkoutEnabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'bundle-3book' }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  }

  if (!checkoutEnabled) {
    return (
      <a
        href="https://www.amazon.com/s?k=breeze+man+books"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block border-2 border-white bg-white px-10 py-4 text-sm font-black tracking-wide text-black uppercase transition-colors hover:bg-transparent hover:text-white"
      >
        Find on Amazon
      </a>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="inline-block border-2 border-white bg-white px-10 py-4 text-sm font-black tracking-wide text-black uppercase transition-colors hover:bg-transparent hover:text-white disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Get the Bundle — $29'}
      </button>
      {error && <p className="text-xs font-bold text-red-300">{error}</p>}
    </div>
  );
}

function BookCard({
  id,
  title,
  subtitle,
  cover,
  description,
  amazon,
  price,
  checkoutEnabled,
}: Book & { checkoutEnabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col border-4 border-black bg-white">
      {/* Container matches actual image ratio (1024×1536 = 2:3) — no gaps, no bars */}
      <div
        className="relative w-full overflow-hidden bg-white"
        style={{ aspectRatio: '2/3' }}
      >
        <img
          src={cover}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-1 text-lg font-black tracking-tight uppercase">
          {title}
        </h3>
        <p className="mb-2 text-xs font-bold tracking-widest uppercase opacity-50">
          {subtitle}
        </p>
        <p className="mb-6 flex-1 text-sm leading-relaxed opacity-70">
          {description}
        </p>
        {error && (
          <p className="mb-2 text-xs font-bold text-red-600">{error}</p>
        )}
        {checkoutEnabled ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="block w-full border-2 border-black bg-black py-3 text-center text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-white hover:text-black disabled:opacity-50"
            >
              {loading ? 'Loading...' : `Buy Signed Copy — $${price}`}
            </button>
            <a
              href={amazon}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs font-bold tracking-wide uppercase underline opacity-60 hover:opacity-100"
            >
              Also on Amazon
            </a>
          </div>
        ) : (
          <a
            href={amazon}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full border-2 border-black bg-black py-3 text-center text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-white hover:text-black"
          >
            Find on Amazon — $10
          </a>
        )}
      </div>
    </div>
  );
}
