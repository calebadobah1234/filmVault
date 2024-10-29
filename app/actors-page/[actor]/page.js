import Pagination from "@/app/components/Pagination";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import LatestItems from "@/app/components/LatestItems";
import SearchItems from "@/app/components/SearchItems";

const page = async ({ params }) => {
  const res = await fetch(
    `https://filmvaultbackend-3.onrender.com/get-other-actor-movies/${params.actor}`,
    { cache: "no-cache" }
  );
  const data = await res.json();

  return (
    <>
      <SearchItems data={data} />
      <Pagination
        startNumber={params.pageNumber - 4 < 1 ? 1 : params.pageNumber - 4}
        paginatePagesToShow={8}
        currentPage={params.pageNumber}
      />
    </>
  );
};

export default page;
