"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

const Searchbar = () => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const [searchResults, setSearchResults] = useState([]);
  const searchContainerRef = useRef(null);

  const searchChange = (e) => {
    setSearchValue(e.target.value);
  };
  const clearSearchResults = () => {
    setSearchResults([]);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(
      `/search-page?search=${searchValue}&limit=30&skip=1&currentPage=1`
    );
    setSearchValue("");
    setSearchResults([]);
  };

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchValue.trim() !== "") {
        try {
          const response = await axios.get(
            `https://filmvaultbackend.onrender.com/searchAm?title=${searchValue}&skip=1&limit=5`
          );
          setSearchResults(response.data.items);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      } else {
        setSearchResults([]);
      }
    }, 1500);

    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearTimeout(delaySearch);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchValue]);

  return (
    <>
      <div className="relative w-full max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="flex justify-center items-center mt-8 mb-8 px-4 w-full max-w-3xl mx-auto relative"
        >
          <input
            placeholder="Search for movies and series"
            value={searchValue}
            onChange={searchChange}
            className="w-full border-2 border-gray-300 bg-white h-12 px-6 pr-12 text-gray-700 text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
          />
          <button type="submit" className="absolute right-8">
            <FaSearch className="text-2xl text-gray-400 hover:text-green-400 transition-colors duration-300 ease-in-out cursor-pointer" />
          </button>
        </form>

        {searchResults.length > 0 && (
          <ul
            ref={searchContainerRef}
            className="absolute z-10 w-full max-w-3xl bg-white border border-gray-300 rounded-md shadow-lg -mt-7"
          >
            {searchResults.map((item, index) => (
              <Link
                href={`/movies1/${item.title}`}
                key={item._id}
                onClick={clearSearchResults}
              >
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  {item.img && (
                    <Image
                      src={item.img}
                      alt={item.title}
                      width={40}
                      height={40}
                      className="mr-3 rounded-sm"
                    />
                  )}
                  <span>{item.title}</span>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Searchbar;
