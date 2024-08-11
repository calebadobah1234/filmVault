import Pagination from "@/app/components/Pagination";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import LatestItems from "@/app/components/LatestItems";
import SearchItems from "@/app/components/SearchItems";

const page = async ({ searchParams }) => {
  const res = await fetch(
    `http://localhost:3001/get-category-dataAm/?category=${searchParams.category}&limit=30&skip=${searchParams.skip}`,
    { cache: "no-cache" }
  );
  const data = await res.json();

  return (
    <>
      <div className="flex justify-center text-2xl font-bold ">
        <h1 className="max-w-[80%] flex justify-center">
          You are on page {searchParams.currentPage} of {searchParams.category}{" "}
          Movies page
        </h1>
      </div>

      <SearchItems data={data.items} />
      <Pagination
        startNumber={
          searchParams.currentPage - 4 < 1 ? 1 : searchParams.currentPage - 4
        }
        paginatePagesToShow={6}
        currentPage={searchParams.currentPage}
        category={searchParams.category}
        skip={searchParams.skip}
        whatFor="category"
        finalNumber={data.totalCount}
      />
    </>
  );
};

export default page;
