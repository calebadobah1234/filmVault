"use client";
import { BsFacebook, BsTwitter } from "react-icons/bs";
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
            <span className="block sm:inline">
              All rights reserved &copy; 2023
            </span>
            <HeadingTag className="inline font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              {" "}
              FilmVault.xyz{" "}
            </HeadingTag>
            <h2>Free Movies Download</h2>
          </div>

          <div className="flex space-x-6">
            <Link
              href="https://www.facebook.com/profile.php?id=100093211403930"
              className="text-3xl hover:text-blue-500 transition-colors duration-300 transform hover:scale-110"
            >
              <BsFacebook />
            </Link>
            <Link
              href="https://twitter.com/adobah102"
              className="text-3xl hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
            >
              <BsTwitter />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
