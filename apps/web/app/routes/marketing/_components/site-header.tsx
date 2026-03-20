import { Link } from 'react-router';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-black uppercase tracking-tighter lg:text-2xl">
            BREEZE MAN
          </span>
          <span className="text-xs font-bold uppercase tracking-widest opacity-60">
            BOOKS
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <a
            href="#books"
            className="text-sm font-bold uppercase tracking-wide hover:underline"
          >
            Books
          </a>
          <a
            href="#classroom"
            className="text-sm font-bold uppercase tracking-wide hover:underline"
          >
            Classroom
          </a>
          <Link
            to="/store"
            className="border-2 border-black bg-black px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
          >
            Get Signed Copies
          </Link>
        </nav>
      </div>
    </header>
  );
}
