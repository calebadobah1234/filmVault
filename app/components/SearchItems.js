import React from "react";
import Link from "next/link";
import Image from "next/image";
import SearchResultWrapper from "./SearchResultWrapper";
import LatestItems from "./LatestItems";
const SearchItems = (props) => {
  return (
    <>
      {" "}
      {/* {props.searchKey ? (
        <h2 className="flex justify-center text-black font-bold text-2xl my-4">
          You Searched for {props.searchKey}
        </h2>
      ) : (
        <></>
      )} */}
      <div className="mt-5 flex justify-center">
        <LatestItems data={props.data} flex={true} itemsToShow={90} />
      </div>
    </>
  );
};

export default SearchItems;
