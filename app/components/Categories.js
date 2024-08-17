"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const allCategories = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Historical",
  "Horror",
  "Music",
  "Musical",
  "Mystery",
  "News",
  "Reality TV",
  "Romance",
  "Sci-Fi",
  "Short",
  "Sports",
  "Stand-up Comedy",
  "TV Ceremony",
  "Talk Show",
  "Thriller",
  "War",
  "Western",
  "action",
  "animation",
  "comedy",
  "drama",
  "dream",
  "fantasy",
  "music",
  "musical",
  "scary",
  "war",
];

const Categories = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleCategories = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <li className="relative group mb-2 md:mb-0">
      <button
        ref={buttonRef}
        onClick={toggleCategories}
        className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
      >
        Categories
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
      </button>
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-gray-800 text-white p-4 rounded-md shadow-lg w-64 md:w-96"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {allCategories.map((category, index) => (
              <span
                className="text-sm hover:text-green-400 cursor-pointer"
                key={index}
              >
                <Link
                  href={`/category-page?category=${category}&limit=30=&skip=1&currentPage=1`}
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  {category}
                </Link>
              </span>
            ))}
          </div>
        </div>
      )}
    </li>
  );
};

export default Categories;
