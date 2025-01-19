import Link from "next/link";
import Image from "next/image";
import Categories from "./Categories";
import Searchbar from "./Searchbar";
import dynamic from "next/dynamic";
import { headers } from "next/headers";

const MobileNav = dynamic(() => import("./MobileNav"), { ssr: false });

const Navbar = () => {
  const headersList = headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isHomePage = pathname === "/";
  const HeadingTag = isHomePage ? "h1" : "h2";
  return (
    <>
      <div className="bg-gray-900 text-white w-full">
        <div className="flex justify-between md:justify-center items-center py-4 px-4">
          <Link href={"/"}>
            <HeadingTag className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              FilmVault.XYZ
            </HeadingTag>
          </Link>
          {/* <MobileNav categories={categories} /> */}
          <MobileNav />
        </div>
        <nav className="hidden md:block text-white py-6 px-4">
          <div className="container mx-auto">
            <ul className="flex flex-wrap justify-center items-center space-x-2 md:space-x-8">
              <li className="relative group mb-2 md:mb-0">
                <Link
                  href="/"
                  className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
                >
                  home
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </Link>
              </li>
              <li className="relative group mb-2 md:mb-0">
                <Link
                  href={`/category-page?category=all&limit=30=&skip=1&currentPage=1`}
                  className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
                >
                  movies
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </Link>
              </li>
              <li className="relative group mb-2 md:mb-0">
                <Link
                  href={`/category-page-series?category=all&limit=30=&skip=1&currentPage=1`}
                  className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
                >
                  Series
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </Link>
              </li>
              <li className="relative group mb-2 md:mb-0">
                <Link
                  href={`/category-page-anime?category=all&limit=30=&skip=1&currentPage=1`}
                  className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
                >
                  Anime
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </Link>
              </li>
              <li className="relative group mb-2 md:mb-0">
                <Link
                  href={`/category-page-kdrama?category=all&limit=30=&skip=1&currentPage=1`}
                  className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
                >
                  Korean Series
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </Link>
              </li>
              <li className="relative group mb-2 md:mb-0">
                <a
                  href={`https://www.mp3vault.xyz/`}
                  className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
                >
                  Music
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </a>
              </li>
              <li className="relative group mb-2 md:mb-0">
                <a
                  href={`https://www.cracksoft.xyz/`}
                  className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
                >
                  PC Games And Software
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </a>
              </li>
              <Categories />
            </ul>
          </div>
        </nav>
      </div>
      <Searchbar />
    </>
  );
};

export default Navbar;
