import Pagination from "@/app/components/Pagination";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import LatestItems from "@/app/components/LatestItems";
import SearchItems from "@/app/components/SearchItems";

const page = async ({ searchParams }) => {
  const res = await fetch(
    `https://filmvaultbackend.onrender.com/get-movies-by-year?year=${searchParams.year}&limit=30&skip=${searchParams.skip}`,
    { cache: "no-cache" }
  );
  const data = await res.json();

  return (
    <>
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
