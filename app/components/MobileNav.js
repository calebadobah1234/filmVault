"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const MobileNav = ({ categories }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  const NavLink = ({ href, children }) => (
    <li>
      <Link
        href={href}
        className="block py-2 px-4 text-lg font-semibold text-white hover:bg-gray-700 rounded transition-colors duration-200"
        onClick={toggleSidebar}
      >
        {children}
      </Link>
    </li>
  );

  return (
    <>
      <button
        className="md:hidden text-white focus:outline-none hover:text-green-400 transition-colors duration-200"
        onClick={toggleSidebar}
        aria-label="Open menu"
      >
        <Menu size={28} />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-gray-800 shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              className="text-white focus:outline-none hover:text-green-400 transition-colors duration-200"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-grow overflow-y-auto">
            <ul className="py-4">
              <NavLink href="/">Home</NavLink>
              <NavLink
                href={`/category-page?category=all&limit=30=&skip=1&currentPage=1`}
              >
                Movies
              </NavLink>
              <NavLink
                href={`/category-page-series?category=all&limit=30=&skip=1&currentPage=1`}
              >
                Series
              </NavLink>
              <NavLink
                href={`/category-page-anime?category=all&limit=30=&skip=1&currentPage=1`}
              >
                Anime
              </NavLink>
              <li className="py-2 px-4">
                {categories ? (
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Categories
                  </h3>
                ) : (
                  <></>
                )}

                <ul className="mt-2 space-y-1">
                  {categories ? (
                    categories.map((category) => (
                      <li key={category}>
                        <Link
                          href={`/category/${category}`}
                          className="block py-1 px-4 text-white hover:bg-gray-700 rounded transition-colors duration-200"
                          onClick={toggleSidebar}
                        >
                          {category}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <></>
                  )}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
