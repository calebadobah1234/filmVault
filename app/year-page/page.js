import Pagination from "@/app/components/Pagination";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import LatestItems from "@/app/components/LatestItems";
import SearchItems from "@/app/components/SearchItems";

const page = async ({ searchParams }) => {
  const res = await fetch(
    `https://filmvaultbackend-xpgy.onrender.com/get-movies-by-year?year=${searchParams.year}&limit=30&skip=${searchParams.skip}`,
    { next: { revalidate: 21600 } }
  );
  const data = await res.json();

  return (
    <>
      <div className="my-6 px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 leading-tight">
          <span className="block mb-2">
            Movies released in {searchParams.year}{" "}
          </span>
          <span className="text-xl text-gray-600 font-normal">
            Page {searchParams.pageNumber}
          </span>
        </h1>
      </div>
      <SearchItems data={data.items} />
      <Pagination
        startNumber={Math.max(1, parseInt(searchParams.pageNumber) - 4)}
        paginatePagesToShow={5}
        currentPage={parseInt(searchParams.pageNumber)}
        whatFor="search"
        category={searchParams.year}
        finalNumber={data.totalCount}
      />
    </>
  );
};

export default page;
