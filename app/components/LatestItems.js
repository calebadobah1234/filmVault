import React from "react";
import Image from "next/image";
import Link from "next/link";
import ScrollHorizontal from "./ScrollHorizontal";
import { FaAngleRight } from "react-icons/fa";

const LatestItems = (props) => {
  const data = props.relatedContent
    ? props.data.slice(0, 12)
    : props.data.slice(0, 12);
  const className = props.title.replace(/\s/g, "");

  return (
    <>
      <div className="flex flex-row justify-center items-center space-x-2 ">
        <h2 className="text-center text-black font-bold text-3xl my-6">
          {props.title}
        </h2>
        {props.link ? (
          <Link
            href={`/category-page?category=${props.title}&skip=1&limit=30&currentPage=1`}
          >
            <FaAngleRight
              className="text-black text-3xl flex-shrink-0"
              style={{ transform: "translateY(5px)" }}
            />
          </Link>
        ) : (
          <></>
        )}
      </div>

      <div className="relative flex max-w-[80%] mx-auto max-md:max-w-[95%]">
        <div
          className={`flex ${
            props.flex
              ? "flex-wrap justify-center"
              : "flex-nowrap md:flex-nowrap"
          } overflow-x-auto no-scrollbar items-center ${className} max-md:flex-wrap max-md:justify-center md:max-lg:grid md:max-lg:grid-cols-3 `}
        >
          {data.map((item) => {
            let imdb = item.imdb;

            return (
              <div
                key={item._id}
                className="max-w-[200px] group flex-none h-[380px] relative mb-4 max-md:mr-1 mr-5 cursor-pointer overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 pb-8 w-[180px] max-md:w-[calc(50%-0.5rem)]"
              >
                <Link href={`/movies1/${item.title}`}>
                  <div className="relative w-full ">
                    {" "}
                    {/* Aspect ratio wrapper */}
                    <Image
                      src={item.img}
                      alt={item.title}
                      objectFit="cover"
                      className="rounded-md transition duration-500 ease-in-out transform group-hover:brightness-75 relative w-full h-full"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                      width={180}
                      height={250}
                    />
                  </div>
                </Link>

                <div
                  className={`absolute left-0 bottom-8 ${
                    props.relatedContent ? "mb-24" : "mb-24"
                  } text-blue-300 group-hover:text-white group-hover:bg-yellow-500 mb-14 rounded-sm ml-3 bg-red-500 px-2 py-1 text-xs transition-all duration-300 ease-in-out transform group-hover:translate-y-1`}
                >
                  <p>
                    {item.categories[0]
                      ? item.categories[0]
                      : item.categories[1]}
                  </p>
                </div>
                <div
                  className={`absolute right-0 bottom-8 text-red-500 ${
                    props.relatedContent ? "mb-24" : "mb-24"
                  } rounded-sm mr-3 bg-yellow-500 px-2 py-1 text-xs group-hover:text-white group-hover:bg-red-500 transition-all duration-300 ease-in-out transform group-hover:translate-y-1`}
                >
                  <p>{imdb + "/10"}</p>
                </div>
                <div className="absolute text-black font-sans font-bold antialiased text-sm transition-colors duration-300 ease-in-out group-hover:text-green-400 w-full">
                  <div className="p-2">
                    <h3 className="line-clamp-2 break-words">{item.title}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <span className={`${props.hide ? "hidden" : "inline"}`}>
          <ScrollHorizontal className={className} />
        </span>
      </div>
      {props.showMoreCategory && (
        <div className="relative flex justify-center mt-4 mb-5">
          <Link
            href={`category-page?category=${props.showMoreCategory}&limit=30&skip=1&currentPage=1`}
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
