"use client";
import { BsFacebook, BsTwitter, BsTelegram } from "react-icons/bs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const HeadingTag = isHomePage ? "h1" : "h2";

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
              <BsTwitter />
            </Link>
            <Link
              href="https://t.me/fv_xyz"
              className="text-3xl hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
              aria-label="Follow FilmVault on Twitter"
            >
              <BsTelegram />
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
