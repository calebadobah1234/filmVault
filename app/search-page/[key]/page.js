"use client";

import React from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

import { useEffect, useState } from "react";
import Loading from "@/app/components/Loading";
import SearchPaginate from "@/app/components/SearchPaginate";

const SearchPage = ({ params }) => {
  const key = params.key;
  const [foundItems, setFoundItems] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  let sliceStart = 0;
  let sliceEnd = 49;

  console.log();
  useEffect(() => {
    const res = axios
      .get(`http://localhost:3001/search/${key}`)
      .then((rest) => {
        setFoundItems(rest.data);
        setIsloading(false);
        return rest.data;
      });
  }, [key]);

  if (isLoading) {
    return <Loading></Loading>;
  }

  if (foundItems.length === 0) {
    return (
      <div className="grid grid-cols-5 mt-5 mb-[25%]">
        <div className="col-span-1"></div>
        <h2 className="font-sans text-3xl font-bold antialiased mx-2 col-span-3 mt-10">
          No item with search key {key} found try changing your search key or
          search for something else
        </h2>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-5 mt-5">
        <div className="col-span-1 max-md:hidden"></div>
        <h2 className="font-sans text-3xl font-bold antialiased mx-2 col-span-3 mt-10 max-md:col-span-5">
          You searched for {key}
        </h2>
      </div>
      <div className="grid grid-cols-5 mt-10">
        <div className="cols-span-1 max-md:hidden"></div>
        <div className="col-span-3 max-md:col-span-5">
          <div className=" ">
            {foundItems.map((item, index) => {
              return (
                <>
                  <div key={index} className="flex mb-10 max-md:flex-col">
                    <Link href={`/more/${item._id}`}>
                      <Image
                        src={item.urlToImage}
                        width={200}
                        height={200}
                        className="w-80 min-w-80 max-md:min-w-[100%] max-md:flex max-md:justify-center max-md:rounded-lg"
                      ></Image>
                    </Link>
                    <div className="max-w-[60%] border-b-4 max-md:max-w-[100%]">
                      <Link href={`/more/${item._id}`}>
                        <h3 className="font-sans text-2xl font-bold antialiased mx-2 hover:underline">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="line-clamp-2 font-sans text-xl antialiased mx-2 mt-3">
                        {item.description}
                      </p>
                      <p className="font-sans text-md antialiased mx-2 mt-3">
                        <p className="text-red-600 inline">Published At: </p>
                        {item.publishedAt.split("T")[0]}
                      </p>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
      <SearchPaginate
        paginatePagesToShow={foundItems.length / 50}
        startNumber={1}
      />
    </>
  );
};

export default SearchPage;
