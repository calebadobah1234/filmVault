"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { Helmet } from "react-helmet";
import Loading from "@/app/components/Loading";
import SearchItems from "@/app/components/SearchItems";
import Pagination from "@/app/components/Pagination";

const calculateRelevance = (item, searchKey) => {
  const title = item.title.toLowerCase();
  const key = searchKey.toLowerCase();

  // Calculate a simple relevance score
  let score = 0;
  if (title.startsWith(key)) score += 3;
  if (title.includes(key)) score += 2;

  // Count the number of words from the search key that appear in the title
  const keyWords = key.split(" ");
  const titleWords = title.split(" ");
  score += keyWords.filter((word) => titleWords.includes(word)).length;

  return score;
};

const CATEGORIES = [
  { value: "all", label: "All Categories", endpoint: null },
  { value: "movies", label: "Movies", endpoint: "searchAm" },
  { value: "series", label: "TV Series", endpoint: "searchAiom" },
  { value: "anime", label: "Anime", endpoint: "searchAiome" },
  { value: "korean", label: "Korean Drama", endpoint: "searchAiokd" },
  { value: "comics", label: "Comics", endpoint: "searchComics" },
];

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const key = searchParams.get("search");
  const skip = searchParams.get("skip") || "1";
  const limit = searchParams.get("limit") || "30";
  const currentPage = searchParams.get("currentPage") || "1";
  const category = searchParams.get("category") || "all";

  const [foundItems, setFoundItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleCategoryChange = (newCategory) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", newCategory);
    params.set("currentPage", "1"); // Reset to first page when changing category
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const fetchAll = async () => {
      if (!key) {
        setIsLoading(false);
        return;
      }

      try {
        let mergedItems = [];
        let totalCount = 0;

        if (category === "all") {
          // Fetch from all endpoints
          const [resAm, resAiom, resAiome, resAiokd, resComics] = await Promise.all([
            axios.get(
              `https://api3.mp3vault.xyz/searchAm?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
            ),
            axios.get(
              `https://api3.mp3vault.xyz/searchAiom?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
            ),
            axios.get(
              `https://api3.mp3vault.xyz/searchAiome?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
            ),
            axios.get(
              `https://api3.mp3vault.xyz/searchAiokd?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
            ),
            axios.get(
              `https://api3.mp3vault.xyz/searchComics?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
            ),
          ]);

          mergedItems = [
            ...resAm.data.items,
            ...resAiom.data.items,
            ...resAiome.data.items,
            ...resAiokd.data.items,
            ...resComics.data.items,
          ];

          totalCount =
            resAm.data.totalCount +
            resAiom.data.totalCount +
            resAiome.data.totalCount +
            resAiokd.data.totalCount +
            resComics.data.totalCount;
        } else {
          // Fetch from specific endpoint based on category
          const selectedCategory = CATEGORIES.find(cat => cat.value === category);
          if (selectedCategory && selectedCategory.endpoint) {
            const response = await axios.get(
              `https://api3.mp3vault.xyz/${selectedCategory.endpoint}?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
            );
            mergedItems = response.data.items;
            totalCount = response.data.totalCount;
          }
        }

        // Sort merged items by relevance
        const sortedItems = mergedItems.sort((a, b) => {
          const relevanceA = calculateRelevance(a, key);
          const relevanceB = calculateRelevance(b, key);
          return relevanceB - relevanceA;
        });

        setFoundItems(sortedItems);
        setTotalCount(totalCount);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [key, skip, limit, currentPage, category]);

  useEffect(() => {
    console.log("Total count:", totalCount);
  }, [totalCount]);

  const pageTitle = key
    ? `Search Results for "${key}" | FilmVault.xyz`
    : "Search | FilmVault.xyz";

  if (isLoading) {
    return <Loading />;
  }

  const selectedCategoryLabel = CATEGORIES.find(cat => cat.value === category)?.label || "All Categories";

  if (foundItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <div className="container mx-auto px-4 py-8">
          {/* Category Filter */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">
              {key ? `Search Results for "${key}"` : "Search"}
            </h1>
            <div className="flex items-center gap-2">
              <label htmlFor="category-select" className="text-sm font-medium text-gray-700">
                Filter by:
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                No Results Found
              </h2>
              <p className="text-lg text-gray-600">
                No {selectedCategoryLabel.toLowerCase()} with search key{" "}
                <span className="font-semibold">{key}</span> found. Try changing
                your search key, selecting a different category, or search for something else. 
                If you are looking for an anime, try using the Japanese name. E.g. shingeki no kyojin
                for Attack on Titan.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Category Filter */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">
            {key ? `Search Results for "${key}"` : "Search"}
          </h1>
          <div className="flex items-center gap-2">
            <label htmlFor="category-select" className="text-sm font-medium text-gray-700">
              Filter by:
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {foundItems.length} results in {selectedCategoryLabel}
            {totalCount > foundItems.length && ` (${totalCount} total)`}
          </p>
        </div>

        <SearchItems data={foundItems} searchKey={key} />
        <Pagination
          startNumber={Math.max(1, parseInt(currentPage) - 4)}
          paginatePagesToShow={5}
          currentPage={parseInt(currentPage)}
          whatFor="search"
          category={key}
          finalNumber={totalCount}
        />
      </div>
    </>
  );
};

export default SearchPage;