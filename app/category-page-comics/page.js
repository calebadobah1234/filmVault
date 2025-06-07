import Pagination from "@/app/components/Pagination";
import React from "react";
import SearchItems from "@/app/components/SearchItemsComics";

export async function generateMetadata({ searchParams }) {
  const category = searchParams.category;
  const currentPage = searchParams.currentPage;

  return {
    title: `${category} Movies - Page ${currentPage}`,
    description: `Browse and download ${category} movies for free on page ${currentPage} of our collection.`,
  };
}
const page = async ({ searchParams }) => {
  const res = await fetch(
    `https://api3.mp3vault.xyz/get-category-dataComics/?category=${searchParams.category}&limit=30&skip=${searchParams.skip}`,
    { next: { revalidate: 21600 } }
  );
  const data = await res.json();
  console.log(data);
  return (
    <>
      <div className="my-6 px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 leading-tight">
          <span className="block mb-2 capitalize">
            {searchParams.category} Comics
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
        comics={true}
      />
    </>
  );
};

export default page;
