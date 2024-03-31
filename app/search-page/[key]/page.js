"use client";

import React from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

import { useEffect, useState } from "react";
import Loading from "@/app/components/Loading";
import SearchItems from "@/app/components/SearchItems";

const SearchPage = ({ params }) => {
  const key = params.key;
  const [foundItems, setFoundItems] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  console.log();
  useEffect(() => {
    const fetchAll = async () => {
      const res = await axios.all([
        axios.get(`http://localhost:3001/searchM/${key}`),
        axios.get(`http://localhost:3001/searchS/${key}`),
      ]);
      const [res1, res2] = res;
      const data1 = res1.data;
      const data2 = res2.data;
      const combinedData = [...data1, ...data2];
      setFoundItems(combinedData);
      setIsloading(false);
      return combinedData;
    };
    fetchAll();
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
      <SearchItems data={foundItems} />
    </>
  );
};

export default SearchPage;
