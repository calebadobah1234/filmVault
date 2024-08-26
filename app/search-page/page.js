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
        const res = await axios.get(
          `https://filmvaultbackend.onrender.com/searchAm?title=${key}&skip=${skip}&limit=${limit}&currentPage=${currentPage}`
        );
        setFoundItems(res.data.items);
        setTotalCount(res.data.totalCount);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [key, skip, limit, currentPage]);

  // This useEffect will log the totalCount after it's been updated
  useEffect(() => {
    console.log("Total count:", totalCount);
  }, [totalCount]);

  if (isLoading) {
    return <Loading />;
  }

  if (foundItems.length === 0) {
    return (
      <div className="grid grid-cols-5 mt-5 mb-[25%]">
        <div className="col-span-1"></div>
        <h2 className="font-sans text-3xl font-bold antialiased mx-2 col-span-3 mt-10">
          No item with search key {key} found. Try changing your search key or
          search for something else.
        </h2>
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
