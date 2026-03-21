export function SiteFooter() {
  return (
    <footer className="border-t-4 border-black bg-black py-12 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-xl font-black uppercase tracking-tighter">
              BREEZE MAN BOOKS
            </h3>
            <p className="text-sm opacity-70">
              The Brain Rot Books by Zubair Raymond Latib.
              <br />
              These aren&apos;t just books. They are a vibe.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-widest">
              Buy on Amazon
            </h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>
                <a
                  href="https://www.amazon.com/dp/B0FHWTFPWD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100"
                >
                  Book 1: vs. The Laser Sharks
                </a>
              </li>
              <li>
                <a
                  href="https://www.amazon.com/dp/B0FFT561TR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100"
                >
                  Book 2: vs. The Basic Overlord
                </a>
              </li>
              <li>
                <a
                  href="https://www.amazon.com/dp/B0FSZGSZNG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100"
                >
                  Book 3: vs. The Rizz Badger
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-widest">
              Follow the Vibe
            </h4>
            <p className="text-sm opacity-70">
              @thebrainrotbooks on all platforms
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-center text-xs opacity-50">
          &copy; {new Date().getFullYear()} Breeze Man Books. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
