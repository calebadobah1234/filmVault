"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Loading from "@/app/components/Loading";
import SearchItems from "@/app/components/SearchItems";
import Pagination from "@/app/components/Pagination";

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
        const [resAm, resAiom, resAiome] = await Promise.all([
          axios.get(
            `https://filmvaultbackend.onrender.com/searchAm?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
          ),
          axios.get(
            `https://filmvaultbackend.onrender.com/searchAiom?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
          ),
          axios.get(
            `https://filmvaultbackend.onrender.com/searchAiome?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
          ),
        ]);

        const mergedItems = [
          ...resAm.data.items,
          ...resAiom.data.items,
          ...resAiome.data.items,
        ];

        const totalCount =
          resAm.data.totalCount +
          resAiom.data.totalCount +
          resAiome.data.totalCount;

        setFoundItems(mergedItems);
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

  if (isLoading) {
    return <Loading />;
  }

  if (foundItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4 py-8">
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            No Results Found
          </h2>
          <p className="text-lg text-gray-600">
            No item with search key <span className="font-semibold">{key}</span>{" "}
            found. Try changing your search key or search for something else.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
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
