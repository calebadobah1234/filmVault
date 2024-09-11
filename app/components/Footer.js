import Link from "next/link";
import { headers } from "next/headers";

const Footer = () => {
  const headersList = headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isHomePage = pathname === "/";

  const HeadingTag = isHomePage ? "h2" : "h2";

  return (
    <footer className="bg-gray-900 text-white border-t-4 border-green-400 mt-28">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold mb-6 text-center">
            <HeadingTag className="inline font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              FilmVault.xyz - Your Source for Free Movies Download
            </HeadingTag>
            <p className="mt-2">
              Discover and download free movies at FilmVault.xyz. Your one-stop
              destination for high-quality, free movie downloads.
            </p>
          </div>

          <nav aria-label="Footer Navigation" className="mb-6">
            <ul className="flex flex-wrap justify-center space-x-4">
              <li>
                <Link href="/" className="hover:text-green-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/movies" className="hover:text-green-400">
                  Free Movies
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex space-x-6 mb-6">
            <Link
              href="https://x.com/FilmVault_xyz"
              className="text-3xl hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
              aria-label="Follow FilmVault on Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link
              href="https://t.me/pc_gs"
              className="text-3xl hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
              aria-label="Follow FilmVault on Telegram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </Link>
          </div>

          <p className="text-sm text-center">
            &copy; 2024 FilmVault.xyz - The best place for free movie downloads.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
