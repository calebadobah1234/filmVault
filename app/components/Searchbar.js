"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";

const Searchbar = (props) => {
  const [searchValue, setSearchValue] = useState("");
  const [showResults, setShowResults] = useState(true);
  const router = useRouter();
  const [searchResults, setSearchResults] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const searchContainerRef = useRef(null);

  const sanitizeTitle = (title) => {
    return title?.replace(/[^a-zA-Z0-9]/g, "_") + ".jpg";
  };

  const searchChange = (e) => {
    setSearchValue(e.target.value);
    setShowResults(true);
  };

  const clearSearchResults = () => {
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(
      `/search-page?search=${searchValue}&limit=30&skip=1&currentPage=1`
    );
    setSearchValue("");
    setShowResults(false);
    setSearchResults([]);
  };

  const handleShowMore = () => {
    router.push(
      `/search-page?search=${searchValue}&limit=30&skip=1&currentPage=1`
    );
    clearSearchResults();
  };

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchValue.trim() !== "") {
        try {
          const endpoints = [
            `https://api3.mp3vault.xyz/searchAm?title=${searchValue}&skip=1&limit=5`,
            `https://api3.mp3vault.xyz/searchAiom?title=${searchValue}&skip=1&limit=5`,
            `https://api3.mp3vault.xyz/searchAiome?title=${searchValue}&skip=1&limit=5`,
            `https://api3.mp3vault.xyz/searchAiokd?title=${searchValue}&skip=1&limit=5`,
          ];

          const responses = await Promise.all(
            endpoints.map((endpoint) => axios.get(endpoint))
          );

          const allResults = responses.flatMap(
            (response) => response.data.items
          );
          
          // Check if any endpoint has exactly 5 results
          const hasMoreResults = responses.some(
            (response) => response.data.items.length === 5
          );
          setHasMore(hasMoreResults);
          setSearchResults(allResults);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      } else {
        setSearchResults([]);
        setHasMore(false);
      }
    }, 700);

    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowResults(false);
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
          <div className="relative w-full group">
            <input
              placeholder="Search for movie, Tv Series, Anime or Korean Series"
              value={searchValue}
              onChange={searchChange}
              className="w-full border-2 border-gray-300 bg-white h-12 px-6 pr-12 rounded-lg text-gray-700 text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all duration-300 ease-in-out shadow-md group-hover:shadow-lg"
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-green-50 rounded-full transition-all duration-300"
            >
              <FaSearch className="text-xl text-gray-400 group-hover:text-green-500 transition-colors duration-300 ease-in-out" />
            </button>
          </div>
        </form>

        {searchResults.length > 0 && showResults && (
          <div
            ref={searchContainerRef}
            className="absolute z-10 w-full max-w-3xl bg-white border border-gray-200 rounded-lg shadow-xl -mt-7 overflow-hidden"
          >
            <ul className="divide-y divide-gray-100">
              {searchResults.map((item, index) => {
                const sanitizedTitle = sanitizeTitle(item.title);
                return (
                  <Link
                    href={
                      props.series ||
                        item.type === "aioMovie" ||
                        item.type === "moviePovie" ||
                        item.type === "series" ||
                        ((item.seasons || item.seasons2) && item.type !== "aioAnime")
                        ? `/series1/${item.title}`
                        : props.anime || item.type == "aioAnime"
                        ? `/anime1/${item.title}`
                        : props.kdrama || item.type == "aioKdrama"
                        ? `/kdrama1/${item.title}`
                        : `/movies1/${item.title}`
                    }
                    key={item._id}
                    onClick={clearSearchResults}
                  >
                    <li className="transition-colors duration-200 hover:bg-gray-50">
                      <div className="flex items-center px-4 py-3 cursor-pointer">
                        {(item.img || item.imageUrl) && (
                          <div className="flex-shrink-0">
                            <ImageWithFallback
                              src={
                                item.type == "aioMovie" ||
                                item.type == "aioAnime" ||
                                item.type == "aioKdrama" ||
                                item.type == "moviePovie" ||
                                item.type == "series" ||
                                (item.imageUrl &&
                                  item.imageUrl.includes("m.media-amazon"))
                                  ? item.imageUrl
                                  : item.img && item.img.includes("avamovie")
                                  ? `/images1/${sanitizedTitle}`
                                  : item.img
                              }
                              alt={item.title}
                              width={45}
                              height={45}
                              className="rounded object-cover"
                            />
                          </div>
                        )}
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                          {item.type?.replace('aio', '').replace('serMovie', 'movie').replace(/([A-Z])/g, ' $1').trim()}

                          </p>
                        </div>
                      </div>
                    </li>
                  </Link>
                );
              })}
            </ul>
            {hasMore && (
              <button 
                onClick={handleShowMore}
                className="w-full px-4 py-3 text-sm font-medium text-green-600 hover:text-green-800 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-t border-gray-200 flex items-center justify-center gap-2"
              >
                Show More Results
                <span className="text-xs">→</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Searchbar;