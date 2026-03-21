import { useState } from 'react';

const PRODUCTS = [
  {
    id: 'book1-signed',
    title: 'Breeze Man vs. The Laser Sharks',
    subtitle: 'Signed Copy',
    cover: '/books/book1-cover.png',
    price: 15,
  },
  {
    id: 'book2-signed',
    title: 'Breeze Man vs. The Basic Overlord',
    subtitle: 'Signed Copy',
    cover: '/books/book2-cover.png',
    price: 15,
  },
  {
    id: 'book3-signed',
    title: 'Breeze Man vs. The Rizz Badger',
    subtitle: 'Signed Copy',
    cover: '/books/book3-cover.png',
    price: 15,
  },
  {
    id: 'classroom-pack',
    title: 'Classroom Pack',
    subtitle: '5 books for teachers',
    cover: '/books/book1-cover.png',
    price: 35,
  },
];

export default function Store() {
  return (
    <div className="flex flex-col">
      <section className="border-b-4 border-black bg-black py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
            GET SIGNED COPIES
          </h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-70">
            Signed by the author • shipped to your door
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 border-4 border-yellow-500 bg-yellow-50 p-4 text-center">
            <p className="text-sm font-bold uppercase tracking-wide">
              ⚡ Direct checkout coming soon! For now, grab your copies on{' '}
              <a 
                href="https://www.amazon.com/s?k=breeze+man+books" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                Amazon
              </a>
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  id,
  title,
  subtitle,
  cover,
  price,
}: {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  price: number;
}) {
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
      <div className="flex items-center justify-center bg-neutral-100 p-4">
        <img src={cover} alt={title} className="h-56 w-auto object-contain" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1 text-base font-black uppercase tracking-tight">
          {title}
        </h3>
        <p className="mb-4 text-xs font-bold uppercase tracking-widest opacity-50">
          {subtitle}
        </p>
        {error && (
          <p className="mb-2 text-xs font-bold text-red-600">
            {error}
          </p>
        )}
        <div className="mt-auto">
          <p className="mb-3 text-2xl font-black">${price}</p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full border-2 border-black bg-black py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
