import { Link } from 'react-router';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex-shrink-0">
          <span className="text-base font-black tracking-tighter whitespace-nowrap uppercase sm:text-xl lg:text-2xl">
            THE BRAIN ROT BOOKS
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 sm:flex">
          <Link
            to="/#books"
            className="text-sm font-bold tracking-wide uppercase hover:underline"
          >
            Books
          </Link>
          <Link
            to="/about"
            className="text-sm font-bold tracking-wide uppercase hover:underline"
          >
            About
          </Link>
          <Link
            to="/#books"
            className="border-2 border-black bg-black px-3 py-2 text-xs font-bold tracking-wide text-white uppercase transition-colors hover:bg-white hover:text-black sm:px-4 sm:text-sm"
          >
            Buy Signed Copies
          </Link>
        </nav>

        {/* Mobile nav - just the CTA button */}
        <Link
          to="/#books"
          className="border-2 border-black bg-black px-3 py-2 text-xs font-bold tracking-wide text-white uppercase transition-colors hover:bg-white hover:text-black sm:hidden"
        >
          Buy Now
        </Link>
      </div>
    </header>
  );
}
