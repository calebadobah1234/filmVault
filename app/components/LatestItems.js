import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa";
import ImageWithFallback from "./ImageWithFallback";

const sanitizeTitle = (title) => {
  return title?.replace(/[^a-zA-Z0-9]/g, "_") + ".jpg";
};

const LatestItems = (props) => {
  const data = props.relatedContent
    ? props.data.slice(0, 12)
    : props.data?.slice(0, props.itemsToShow ? props.itemsToShow : 12);
  const className = props.title && props.title.replace(/\s/g, "");

  // Default fallback image URL
  const fallbackImageUrl = "https://th.bing.com/th/id/OIP.vemXta-UoBudoiVJZZgKZgHaHa?rs=1&pid=ImgDetMain";

  // Helper function to detect if item is a comic
  const isComic = (item) => {
    return item.chapters && item.chapters.length > 0;
  };

  const getImagePath = (item) => {
    // For comics, use the first image from the first chapter as cover
    if (isComic(item)) {
      const firstImage = item.chapters[0].images[0];
      return firstImage?.r2_url || firstImage?.original_src || fallbackImageUrl;
    }
    
    // Fallback to existing logic for movies/series
    if (item.type === "aioMovie" || 
        item.type === "aioAnime" || 
        item.type === "aioKdrama" || 
        item.type === "moviePovie" || 
        item.type === "series") {
      return item.imageUrl || fallbackImageUrl;
    }
    
    if (item.imageUrl && item.imageUrl.includes("m.media-amazon")) {
      return item.imageUrl;
    }
    
    if (item.img && item.img.includes("avamovie")) {
      return `/images1/${sanitizeTitle(item.title)}`;
    }
    
    if (item.img) {
      return item.img;
    } 
    
    if (item.imageUrl) {
      return item.imageUrl;
    }
    
    return fallbackImageUrl;
  };

  const getItemUrl = (item) => {
    // Check if it's a comic first
    if (isComic(item)) {
      return `/comics1/${item.title}`;
    }
    
    // Handle movies/series/anime/kdrama
    if (props.series ||
        item.type === "aioMovie" ||
        item.type === "moviePovie" ||
        item.type === "series" ||
        ((item.seasons || item.seasons2) && item.type !== "aioAnime")) {
      return `/series1/${item.title}`;
    }
    
    if (props.anime || item.type === "aioAnime") {
      return `/anime1/${item.title}`;
    }
    
    if (props.kdrama || item.type === "aioKdrama") {
      return `/kdrama1/${item.title}`;
    }
    
    return `/movies1/${item.title}`;
  };

  const getItemType = (item) => {
    if (isComic(item)) {
      return "Comic";
    }
    
    if (props.series ||
        item.type === "aioMovie" ||
        item.type === "moviePovie" ||
        item.type === "series" ||
        ((item.seasons || item.seasons2) && item.type !== "aioAnime")) {
      return "Series";
    }
    
    if (props.anime || item.type === "aioAnime") {
      return "Anime";
    }
    
    if (props.kdrama || item.type === "aioKdrama") {
      return "K Series";
    }
    
    return "Movie";
  };

  const getBottomLeftInfo = (item) => {
    if (isComic(item)) {
      return item.publisher || item.year || "Comic";
    }
    
    return item?.categories?.[0] || "";
  };

  const getBottomRightInfo = (item) => {
    if (isComic(item)) {
      return {
        text: `${item.totalChapters || item.chapters.length} Ch`,
        show: true
      };
    }
    
    if (item.imdbRating || item.imdb) {
      return {
        text: `${item.imdbRating || item.imdb}/10`,
        show: true
      };
    }
    
    return { show: false };
  };

  return (
    <>
      <div className="flex flex-row justify-center items-center space-x-2 z-10">
        {props.title && (
          <h2 className="text-center text-black font-bold text-3xl my-6">
            {props.title}
          </h2>
        )}

        {props.link ? (
          <Link
            href={`/category-page?category=${
              props.title ? props.title : "xxx"
            }&skip=1&limit=30&currentPage=1`}
          >
            <FaAngleRight
              className="text-black text-3xl flex-shrink-0"
              style={{ transform: "translateY(5px)" }}
            />
          </Link>
        ) : null}
      </div>

      <div className="relative flex max-w-[90%] mx-auto max-md:max-w-[95%]">
        <div
          className={`flex ${
            props.flex
              ? "flex-wrap justify-center"
              : "flex-nowrap md:flex-nowrap"
          } overflow-x-auto no-scrollbar items-center ${className} max-md:flex-wrap max-md:justify-center md:max-lg:grid md:grid-cols-3 lg:grid-cols-4 md:max-lg:gap-10`}
        >
          {data.map((item) => {
            const imagePath = getImagePath(item);
            const itemUrl = getItemUrl(item);
            const itemType = getItemType(item);
            const bottomLeftInfo = getBottomLeftInfo(item);
            const bottomRightInfo = getBottomRightInfo(item);
            
            return (
              <div
                key={item._id}
                className="aspect-[9/16] max-w-[200px] group flex-none h-[380px] relative md:mr-5 mr-1 cursor-pointer overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 w-[180px] max-md:w-[calc(50%-0.5rem)]"
              >
                <div className="relative w-full">
                  <Link href={itemUrl}>
                    <ImageWithFallback
                      src={imagePath}
                      alt={item.title || `${itemType} cover`}
                      className="rounded-md transition duration-500 ease-in-out transform group-hover:brightness-75 relative w-full h-full object-cover aspect-[2/3]"
                      width={180}
                      height={250}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                    />
                  </Link>
                </div>

                <div className="absolute top-4 left-0 bg-blue-300 group-hover:text-white rounded-sm ml-3 px-2 py-1 text-xs text-white transition-all duration-300 ease-in-out transform group-hover:translate-y-1">
                  {itemType}
                </div>

                {bottomLeftInfo && (
                  <div
                    className={`absolute left-0 bottom-8 ${
                      props.relatedContent
                        ? "mb-24 max-sm:mb-36"
                        : "max-sm:mb-32 mb-24"
                    } text-blue-300 group-hover:text-white group-hover:bg-yellow-500 rounded-sm ml-3 bg-red-500 px-2 py-1 text-xs transition-all duration-300 ease-in-out transform group-hover:translate-y-1`}
                  >
                    <p>{bottomLeftInfo}</p>
                  </div>
                )}

                {bottomRightInfo.show && (
                  <div
                    className={`absolute right-0 bottom-8 text-red-500 ${
                      props.relatedContent
                        ? "mb-24 max-sm:mb-36"
                        : "max-sm:mb-32 mb-24"
                    } rounded-sm mr-3 bg-yellow-500 px-2 py-1 text-xs group-hover:text-white group-hover:bg-red-500 transition-all duration-300 ease-in-out transform group-hover:translate-y-1`}
                  >
                    <p>{bottomRightInfo.text}</p>
                  </div>
                )}

                <div className="absolute text-black font-sans font-bold antialiased text-sm transition-colors duration-300 ease-in-out group-hover:text-green-400 w-full">
                  <div className="p-2">
                    <Link href={itemUrl}>
                      <h3 className="line-clamp-2 break-words">{item.title}</h3>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <span className={`${props.hide ? "hidden" : "inline"}`}></span>
      </div>
      
      {props.showMoreCategory && (
        <div className="relative flex justify-center mb-10">
          <Link
            href={`category-page${
              props.comics
                ? "-comics"
                : props.anime
                ? "-anime"
                : props.series
                ? "-series"
                : props.kdrama
                ? "-kdrama"
                : ""
            }?category=${props.showMoreCategory}&limit=30&skip=1&currentPage=1`}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Show More
          </Link>
        </div>
      )}
    </>
  );
};

export default LatestItems;