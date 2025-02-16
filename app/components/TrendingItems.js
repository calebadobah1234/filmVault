"use client"

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import ImageWithFallback from "./ImageWithFallback";

const sanitizeTitle = (title) => {
  return title?.replace(/[^a-zA-Z0-9]/g, "_") + ".jpg";
};

const fallbackImageUrl = "https://th.bing.com/th/id/OIP.vemXta-UoBudoiVJZZgKZgHaHa?rs=1&pid=ImgDetMain";

const getImagePath = (item) => {
  if (
    item.type === "aioMovie" ||
    item.type === "aioAnime" ||
    item.type === "aioKdrama" ||
    item.type === "moviePovie" ||
    item.type === "series"
  ) {
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

  return fallbackImageUrl;
};

const LatestItems = (props) => {
  const scrollContainerRef = useRef(null);
  const data = props.relatedContent
    ? props.data.slice(0, 12)
    : props.data?.slice(0, props.itemsToShow ? props.itemsToShow : 12);
  const className = props.title && props.title.replace(/\s/g, "");

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="flex flex-row justify-center items-center space-x-2">
        {props.title && (
          <h2 className="text-center text-black font-bold text-3xl my-6">
            {props.title}
          </h2>
        )}

        {props.link && (
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
        )}
      </div>

      <div className="relative flex max-w-[90%] mx-auto max-md:max-w-[90%] group">
        {/* Left Arrow - Hidden on mobile */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll left"
        >
          <FaAngleLeft className="text-2xl" />
        </button>

        <div
          ref={scrollContainerRef}
          className={`flex ${
            props.flex ? "flex-wrap justify-center" : "flex-nowrap"
          } overflow-x-auto no-scrollbar items-center ${className} w-full px-2 md:px-0 scroll-smooth`}
        >
          {data.map((item) => {
            const imagePath = getImagePath(item);
            let imdb = item.imdb;
            const sanitizedTitle = sanitizeTitle(item.title);
            const localImagePath = `${
              item.type == "aioMovie" ||
              item.type == "aioAnime" ||
              item.type == "aioKdrama" ||
              item.type == "moviePovie" ||
              item.type == "series" ||
              item.type == "serMovie" ||
              (item.imageUrl && item.imageUrl.includes("m.media-amazon"))
                ? item.imageUrl
                : item.img && item.img.includes("avamovie")
                ? `/images1/${sanitizedTitle}`
                : item.img
            }`;

            return (
              <div
                key={item._id}
                className="aspect-[9/16] max-w-[200px] group flex-none h-[380px] relative md:mr-5 mr-1 cursor-pointer overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 w-[180px] max-md:w-[calc(50%-0.5rem)]"
              >
                <div className="relative w-full">
                  <Link
                    href={
                      props.series ||
                      item.type == "aioMovie" ||
                      item.type == "moviePovie" ||
                      item.type == "series"
                        ? `/series1/${item.title}`
                        : props.anime || item.type == "aioAnime"
                        ? `/anime1/${item.title}`
                        : props.kdrama || item.type == "aioKdrama"
                        ? `/kdrama1/${item.title}`
                        : `/movies1/${item.title}`
                    }
                  >
                    {item.img || item.imageUrl ? (
                      <ImageWithFallback
                        src={imagePath}
                        alt={item.title || "Movie poster"}
                        className="rounded-md transition duration-500 ease-in-out transform group-hover:brightness-75 relative w-full h-full object-cover aspect-[2/3]"
                        width={180}
                        height={250}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                      />
                    ) : (
                      <></>
                    )}
                  </Link>
                </div>

                <div className="absolute top-4 left-0 bg-blue-300 group-hover:text-white rounded-sm ml-3 px-2 py-1 text-xs text-white transition-all duration-300 ease-in-out transform group-hover:translate-y-1">
                  {props.series ||
                  item.type == "aioMovie" ||
                  item.type == "moviePovie" ||
                  item.type == "series"
                    ? "Series"
                    : props.anime || item.type == "aioAnime"
                    ? "Anime"
                    : props.kdrama || item.type == "aioKdrama"
                    ? "K Series"
                    : "Movie"}
                </div>

                <div
                  className={`absolute left-0 bottom-16 max-sm:bottom-28 text-blue-300 group-hover:text-white group-hover:bg-yellow-500 rounded-sm ml-3 bg-red-500 px-2 py-1 text-xs transition-all duration-300 ease-in-out transform group-hover:translate-y-1 mb-14`}
                >
                  <p>
                    {item.categories[0]
                      ? item.categories[0]
                      : item.categories[1]}
                  </p>
                </div>

                {item.imdbRating || imdb ? (
                  <div
                    className={`absolute right-0 bottom-16 max-sm:bottom-28 text-red-500 rounded-sm mr-3 bg-yellow-500 px-2 py-1 text-xs group-hover:text-white group-hover:bg-red-500 transition-all duration-300 ease-in-out transform group-hover:translate-y-1 mb-14`}
                  >
                    <p>
                      {item.imdbRating ? item.imdbRating : imdb}
                      /10
                    </p>
                  </div>
                ) : (
                  <></>
                )}

                <div className="absolute text-black font-sans font-bold antialiased text-sm transition-colors duration-300 ease-in-out group-hover:text-green-400 w-full">
                  <div className="p-2">
                    <Link
                      href={
                        props.series ||
                        item.type == "aioMovie" ||
                        item.type == "moviePovie" ||
                        item.type == "series"
                          ? `/series1/${item.title}`
                          : props.anime || item.type == "aioAnime"
                          ? `/anime1/${item.title}`
                          : props.kdrama || item.type == "aioKdrama"
                          ? `/kdrama1/${item.title}`
                          : `/movies1/${item.title}`
                      }
                    >
                      <h3 className="line-clamp-2 break-words">{item.title}</h3>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow - Hidden on mobile */}
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll right"
        >
          <FaAngleRight className="text-2xl" />
        </button>
      </div>

      {props.showMoreCategory && (
        <div className="relative flex justify-center mb-10">
          <Link
            href={`category-page${
              props.anime
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