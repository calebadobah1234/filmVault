import Pagination from "@/app/components/Pagination";
import React from "react";
import SearchItems from "@/app/components/SearchItems";

export async function generateMetadata({ searchParams }) {
  const category = searchParams.category;
  const currentPage = searchParams.currentPage;

  return {
    title: `${category} Anime - Page ${currentPage}`,
    description: `Browse and download ${category} anime for free on page ${currentPage} of our collection.`,
  };
}

const page = async ({ searchParams }) => {
  const res = await fetch(
    `https://filmvaultbackend.onrender.com/get-category-dataAiome/?category=${searchParams.category}&limit=30&skip=${searchParams.skip}`,
    { next: { revalidate: 86400 } }
  );
  const data = await res.json();

  return (
    <>
      <div className="my-6 px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 leading-tight">
          <span className="block mb-2 capitalize">
            {searchParams.category} Anime
          </span>
          <span className="text-xl text-gray-600 font-normal">
            Page {searchParams.currentPage}
          </span>
        </h1>
      </div>

      <SearchItems data={data.items} />
      <Pagination
        startNumber={
          searchParams.currentPage - 4 < 1 ? 1 : searchParams.currentPage - 4
        }
        paginatePagesToShow={4}
        currentPage={searchParams.currentPage}
        category={searchParams.category}
        skip={searchParams.skip}
        whatFor="category"
        finalNumber={data.totalCount}
        anime={true}
      />
    </>
  );
};

export default page;
