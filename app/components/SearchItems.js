import React from "react";
// import Link from "next/link";
// import Image from "next/image";
// import SearchResultWrapper from "./SearchResultWrapper";
import Script from "next/script";
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
        <Script
          src="//pl25046019.profitablecpmrate.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js"
          data-cfasync="false"
          async
          strategy="afterInteractive"
        />
        <div id="container-a2ec5d29f1060455d67da23054ccb38b"></div>
        <LatestItems data={props.data} flex={true} itemsToShow={120} />
      </div>
    </>
  );
};

export default SearchItems;
