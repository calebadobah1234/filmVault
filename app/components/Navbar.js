"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import dynamic from "next/dynamic";
import Searchbar from "./Searchbar";
import Categories from "./Categories";

const MobileNav = dynamic(() => import("./MobileNav"), { ssr: false });

const Navbar = ({ isHomePage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const HeadingTag = isHomePage ? "h1" : "h2";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="z-50 w-screen overflow-x-hidden">
      <div className={`w-full transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-gray-900'
      }`}>
        {/* Top Bar */}
        <div className="container mx-auto">
  <div className="flex items-center justify-between py-4 px-4"> {/* Changed justify-center to justify-between */}
    <Link href="/" className='flex justify-center'>
      <HeadingTag className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 hover:from-purple-500 hover:via-blue-400 hover:to-green-400 transition-all duration-500">
        FilmVault.XYZ
      </HeadingTag>
    </Link>
    <div className="md:hidden ml-auto"> {/* Added ml-auto */}
      <MobileNav />
    </div>
  </div>
</div>

        {/* Main Navigation */}
        <nav className="hidden md:block text-white border-t border-gray-800">
          <div className="container mx-auto">
            <ul className="flex flex-wrap justify-center items-center gap-1 py-3 px-4">
              {[
                { href: "/", label: "Home" },
                { href: "/category-page?category=all&limit=30=&skip=1&currentPage=1", label: "Movies" },
                { href: "/category-page-series?category=all&limit=30=&skip=1&currentPage=1", label: "Series" },
                { href: "/category-page-anime?category=all&limit=30=&skip=1&currentPage=1", label: "Anime" },
                { href: "/category-page-kdrama?category=all&limit=30=&skip=1&currentPage=1", label: "Korean Series" },
                { href: "https://www.mp3vault.xyz/", label: "Music", external: true },
                { href: "https://www.cracksoft.xyz/", label: "PC Games & Software", external: true }
              ].map((item) => (
                <li key={item.label} className="relative group">
                  {item.external ? (
                    <a
                      href={item.href}
                      className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-all duration-200 flex items-center space-x-1"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-all duration-200 flex items-center space-x-1"
                    >
                      {item.label}
                    </Link>
                  )}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
                </li>
              ))}
              <Categories />
            </ul>
          </div>
        </nav>
      </div>
      
      {/* Search Bar */}
      <Searchbar />
    </div>
  );
};

export default Navbar;