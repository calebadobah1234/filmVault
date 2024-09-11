// File: components/HamburgerMenu.js
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Categories from "./Categories";

const HamburgerMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="md:hidden">
      <button className="text-white focus:outline-none" onClick={toggleMenu}>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      {isMenuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-gray-900 py-4 px-4">
          <ul className="flex flex-col space-y-4">
            <NavItem href="/" text="home" />
            <NavItem
              href="/category-page?category=all&limit=30=&skip=1&currentPage=1"
              text="movies"
            />
            <NavItem
              href="/category-page-series?category=all&limit=30=&skip=1&currentPage=1"
              text="Series"
            />
            <NavItem
              href="/category-page-anime?category=all&limit=30=&skip=1&currentPage=1"
              text="Anime"
            />
            <Categories />
          </ul>
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ href, text }) => (
  <li className="relative group">
    <Link
      href={href}
      className="hover:text-green-400 uppercase text-lg font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
    >
      {text}
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
    </Link>
  </li>
);

export default HamburgerMenu;
