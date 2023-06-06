"use client";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const Searchbar = () => {
  const searchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const [searchValue, setSearchValue] = useState("");
  return (
    <form
      action={`/search-page/${searchValue}`}
      className="flex justify-center mt-6"
    >
      <input
        placeholder="Search for news"
        value={searchValue}
        onChange={searchChange}
        className="w-[40%] rounded-lg border-2 border-gray-300 bg-white h-10 px-5 pr-16 text-sm focus:outline-none max-md:w-[80%]"
      ></input>
      <FaSearch className="hidden text-2xl" />
    </form>
  );
};

export default Searchbar;
