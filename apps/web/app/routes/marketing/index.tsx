import { Link } from 'react-router';

const BOOKS = [
  {
    title: 'Breeze Man vs. The Laser Sharks',
    cover: '/books/book1-cover.png',
    description:
      'When Laser Sharks invade the coast, only one hero has enough rizz to stop them. Breeze Man enters the chat.',
    amazon: 'https://www.amazon.com/dp/B0FHWTFPWD',
  },
  {
    title: 'Breeze Man vs. The Basic Overlord',
    cover: '/books/book2-cover.png',
    description:
      'The Basic Overlord wants to make everything mid. Breeze Man must protect the drip at all costs.',
    amazon: 'https://www.amazon.com/dp/B0FFT561TR',
  },
  {
    title: 'Breeze Man vs. The Rizz Badger',
    cover: '/books/book3-cover.png',
    description:
      'A new rival with unmatched rizz appears. Can Breeze Man out-rizz the Rizz Badger? No cap.',
    amazon: 'https://www.amazon.com/dp/B0FSZGSZNG',
  },
];

export default function Index() {
  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-black text-white">
        <img
          src="/books/hero.png"
          alt="The Brain Rot Books characters"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl lg:text-8xl">
            THESE AREN&apos;T JUST BOOKS.
            <br />
            <span className="inline-block border-4 border-white px-4 py-1 mt-2">
              THEY ARE A VIBE.
            </span>
          </h1>
          <p className="mt-6 text-lg font-bold uppercase tracking-widest opacity-70">
            @thebrainrotbooks on all platforms
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#books"
              className="border-2 border-white bg-white px-8 py-3 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-transparent hover:text-white"
            >
              See the Books
            </a>
            <Link
              to="/store"
              className="border-2 border-white px-8 py-3 text-sm font-black uppercase tracking-wide transition-colors hover:bg-white hover:text-black"
            >
              Get Signed Copies
            </Link>
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="border-b-4 border-black bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-2 text-3xl font-black uppercase tracking-tighter md:text-4xl">
            Watch Breeze Man in Action
          </h2>
          <p className="mb-8 text-sm font-bold uppercase tracking-widest opacity-50">
            Book 1 Reading
          </p>
          <div className="relative mx-auto aspect-video max-w-2xl overflow-hidden border-4 border-black bg-black">
            <video
              controls
              preload="metadata"
              className="h-full w-full"
              poster="/books/book1-cover.png"
            >
              <source src="/books/book1-reading.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* BOOKS SECTION */}
      <section id="books" className="border-b-4 border-black bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-4xl font-black uppercase tracking-tighter md:text-5xl">
            THE BRAIN ROT BOOKS
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {BOOKS.map((book) => (
              <BookCard key={book.title} {...book} />
            ))}
          </div>
        </div>
      </section>

      {/* CLASSROOM SECTION */}
      <section
        id="classroom"
        className="border-b-4 border-black bg-black py-16 text-white"
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-4xl font-black uppercase tracking-tighter md:text-5xl">
            BULK ORDERS FOR TEACHERS
          </h2>
          <p className="mb-2 text-lg font-bold">
            Classroom Pack: 5 books for $35
          </p>
          <p className="mb-8 text-sm opacity-70">
            Get your students reading with Breeze Man. Perfect for classroom
            libraries, reading groups, and rewards.
          </p>
          <Link
            to="/store"
            className="inline-block border-2 border-white bg-white px-10 py-4 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-transparent hover:text-white"
          >
            Order Classroom Pack — $35
          </Link>
        </div>
      </section>
    </div>
  );
}

function BookCard({
  title,
  cover,
  description,
  amazon,
}: {
  title: string;
  cover: string;
  description: string;
  amazon: string;
}) {
  return (
    <div className="flex flex-col border-4 border-black bg-white">
      <div className="flex items-center justify-center bg-neutral-100 p-4">
        <img
          src={cover}
          alt={title}
          className="h-80 w-auto object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-lg font-black uppercase tracking-tight">
          {title}
        </h3>
        <p className="mb-6 flex-1 text-sm leading-relaxed opacity-70">
          {description}
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={amazon}
            target="_blank"
            rel="noopener noreferrer"
            className="block border-2 border-black bg-black py-2 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
          >
            Buy on Amazon — $10
          </a>
          <Link
            to="/store"
            className="block border-2 border-black py-2 text-center text-sm font-bold uppercase tracking-wide transition-colors hover:bg-black hover:text-white"
          >
            Get Signed Copy — $15
          </Link>
        </div>
      </div>
    </div>
  );
}
