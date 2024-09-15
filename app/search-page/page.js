// page.js
import { Suspense } from "react";
import SearchPage from "./SearchPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const key = searchParams.search;
  return {
    title: key
      ? `Search Results for "${key}" | FilmVault`
      : "Search | FilmVault",
  };
}

export default function Page({ searchParams }) {
  const key = searchParams.search;
  return (
    <>
      <h1 className="text-3xl font-bold text-center my-6">
        {key ? `Search Results for "${key}"` : "Search"}
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPage />
      </Suspense>
    </>
  );
}
