import { Link } from 'react-router';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex-shrink-0">
          <span className="whitespace-nowrap text-base font-black uppercase tracking-tighter sm:text-xl lg:text-2xl">
            THE BRAIN ROT BOOKS
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 sm:flex">
          <a
            href="/store#books"
            className="text-sm font-bold uppercase tracking-wide hover:underline"
          >
            Books
          </a>
          <a
            href="/store#classroom"
            className="text-sm font-bold uppercase tracking-wide hover:underline"
          >
            Classroom
          </a>
          <Link
            to="/store"
            className="border-2 border-black bg-black px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black sm:px-4 sm:text-sm"
          >
            Buy Signed Copies
          </Link>
        </nav>

        {/* Mobile nav - just the CTA button */}
        <Link
          to="/store"
          className="border-2 border-black bg-black px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black sm:hidden"
        >
          Buy Now
        </Link>
      </div>
    </header>
  );
}
