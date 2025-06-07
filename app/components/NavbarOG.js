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
    <div className="w-full relative" style={{ zIndex: 40 }}>
      <div className={`max-md:overflow-x-hidden w-full transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-gray-900'
      }`} style={{ zIndex: 40 }}>
        {/* Top Bar */}
        <div className="container mx-auto">
          <div className="flex items-center justify-between md:justify-between py-4 px-4">
            {/* Left spacer for desktop */}
            <div className="hidden md:block md:flex-1"></div>
            
            {/* Logo - Left aligned on mobile, centered on desktop */}
            <Link href="/" className="flex justify-center md:flex-1">
              <HeadingTag className="text-3xl sm:text-4xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 hover:from-purple-500 hover:via-blue-400 hover:to-green-400 transition-all duration-500">
                FilmVault.XYZ
              </HeadingTag>
            </Link>

            {/* Right side icons container - Mobile */}
            <div className="md:hidden flex items-center gap-2">
              {/* Telegram Icon */}
              <a 
                href="https://t.me/pc_gs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="28" 
                  height="28" 
                  viewBox="0 0 240 240"
                  className="fill-current"
                >
                  <defs>
                    <linearGradient id="telegram-gradient" x1="46.14" x2="28.78" y1="11.38" y2="52.92" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#37aee2"/>
                      <stop offset="1" stopColor="#1e96c8"/>
                    </linearGradient>
                  </defs>
                  <circle cx="120" cy="120" r="120" fill="#229ED9"/>
                  <path fill="#fff" d="M81.229,128.772l14.237,39.406s1.78,3.687,3.687,3.687,30.255-29.492,30.255-29.492l31.525-60.953L81.737,118.6Z"/>
                  <path fill="#d2e5f1" d="M100.106,138.878l-2.733,29.046s-1.144,8.9,7.754,0,17.415-15.763,17.415-15.763"/>
                  <path fill="#fff" d="M81.486,130.178,52.2,120.636s-3.5-1.42-2.373-4.64c.232-.664.7-1.229,2.1-2.2,6.489-4.523,120.106-45.36,120.106-45.36s3.208-1.081,5.1-.362a2.766,2.766,0,0,1,1.885,2.055,9.357,9.357,0,0,1,.254,2.585c-.009.752-.1,1.449-.169,2.542-.692,11.165-21.4,94.493-21.4,94.493s-1.239,4.876-5.678,5.043A8.13,8.13,0,0,1,146.1,172.5c-8.711-7.493-38.819-27.727-45.472-32.177a1.27,1.27,0,0,1-.546-.9c-.093-.469.417-1.05.417-1.05s52.426-46.6,53.821-51.492c.108-.379-.3-.566-.848-.4-3.482,1.281-63.844,39.4-70.506,43.607A3.21,3.21,0,0,1,81.486,130.178Z"/>
                </svg>
              </a>

              {/* Mobile Menu */}
              <MobileNav />
            </div>

            {/* Right spacer for desktop */}
            <div className="hidden md:block md:flex-1"></div>
          </div>
        </div>

        {/* Rest of the navigation remains unchanged */}
        <nav className="hidden md:block text-white border-t border-gray-800">
          <div className="container mx-auto">
            <ul className="flex flex-wrap justify-center items-center gap-1 py-3 px-4">
              {[
                { href: "/", label: "Home" },
                { href: "/category-page?category=all&limit=30=&skip=1&currentPage=1", label: "Movies" },
                { href: "/category-page-series?category=all&limit=30=&skip=1&currentPage=1", label: "Series" },
                { href: "/category-page-anime?category=all&limit=30=&skip=1&currentPage=1", label: "Anime" },
                { href: "/category-page-comics?category=all&limit=30=&skip=1&currentPage=1", label: "Comics" },
                // { href: "/category-page-kdrama?category=all&limit=30=&skip=1&currentPage=1", label: "Korean Series" },
                { href: "https://www.mp3vault.xyz/", label: "Music", external: true },
                { href: "https://www.cracksoft.xyz/", label: "PC Games & Software", external: true },
                { href: "https://t.me/+l4x6T0ByASdjOGE0", label: "Telegram Channel", external: true }
              ].map((item) => (
                <li key={item.label} className="relative group">
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
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