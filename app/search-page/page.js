"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
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

const SearchPage = () => {
  const searchParams = useSearchParams();
  const key = searchParams.get("search");
  const skip = searchParams.get("skip") || "1";
  const limit = searchParams.get("limit") || "30";
  const currentPage = searchParams.get("currentPage") || "1";

  const [foundItems, setFoundItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!key) {
        setIsLoading(false);
        return;
      }

      try {
        const [resAm, resAiom, resAiome, resAiokd] = await Promise.all([
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
        ]);

        const mergedItems = [
          ...resAm.data.items,
          ...resAiom.data.items,
          ...resAiome.data.items,
          ...resAiokd.data.items,
        ];

        // Sort merged items by relevance
        const sortedItems = mergedItems.sort((a, b) => {
          const relevanceA = calculateRelevance(a, key);
          const relevanceB = calculateRelevance(b, key);
          return relevanceB - relevanceA;
        });

        const totalCount =
          resAm.data.totalCount +
          resAiom.data.totalCount +
          resAiome.data.totalCount +
          resAiokd.data.totalCount;

        setFoundItems(sortedItems);
        setTotalCount(totalCount);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [key, skip, limit, currentPage]);

  useEffect(() => {
    console.log("Total count:", totalCount);
  }, [totalCount]);

  const pageTitle = key
    ? `Search Results for "${key}" | FilmVault.xyz`
    : "Search | FilmVault.xyz";

  if (isLoading) {
    return <Loading />;
  }

  if (foundItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <div className="flex items-center justify-center min-h-[50vh] px-4 py-8">
          <div className="text-center max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              No Results Found
            </h2>
            <p className="text-lg text-gray-600">
              No item with search key{" "}
              <span className="font-semibold">{key}</span> found. Try changing
              your search key or search for something else. If you are looking
              for an anime, try using the Japanese name. E.g. shingeki no kyojin
              for Attack on Titan.
            </p>
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
      <h1 className="text-3xl font-bold text-center my-6">
        {key ? `Search Results for "${key}"` : "Search"}
      </h1>
      <SearchItems data={foundItems} searchKey={key} />
      <Pagination
        startNumber={Math.max(1, parseInt(currentPage) - 4)}
        paginatePagesToShow={5}
        currentPage={parseInt(currentPage)}
        whatFor="search"
        category={key}
        finalNumber={totalCount}
      />
    </>
  );
};

export default SearchPage;
