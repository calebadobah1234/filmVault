import React from "react";
import Link from "next/link";
import Image from "next/image";
import serSeries from "@/backend/models/serSeries";
const SearchItems = (props) => {
  return (
    <>
      {" "}
      {props.searchKey ? (
        <h2 className="flex justify-center text-black font-bold text-2xl my-4">
          You Searched for {props.searchKey}
        </h2>
      ) : (
        <></>
      )}
      <div className="flex justify-center mt-10">
        <div className="flex flex-wrap justify-center">
          {props.data.map((item) => {
            // let image = item.img.split(",")[0];
            let imdb = item.imdb;
            const imdbNumber = imdb;
            // const modifiedImg = decodeURIComponent(
            //   image.replace("/_next/image?url=", "").split("&")[0]
            // );

            return (
              <div
                key={item._id}
                className="group flex-none relative mb-4 max-md:mr-1 mr-5 cursor-pointer overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 pb-8 w-[180px] max-md:w-[calc(50%-0.5rem)]"
              >
                <Link href={`/movies1/${item.title}`}>
                  <div className="relative w-full ">
                    {" "}
                    {/* Aspect ratio wrapper */}
                    <Image
                      src={item.img}
                      alt={item.title}
                      objectFit="cover"
                      className="rounded-md transition duration-500 ease-in-out transform group-hover:brightness-75"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                      width={180}
                      height={250}
                    />
                  </div>
                </Link>

                <div className="absolute left-0 bottom-8 text-blue-300 group-hover:text-white group-hover:bg-yellow-500 mb-7 rounded-sm ml-3 bg-red-500 px-2 py-1 text-xs transition-all duration-300 ease-in-out transform group-hover:translate-y-1">
                  <p>
                    {item.categories[0]
                      ? item.categories[0]
                      : item.categories[1]}
                  </p>
                </div>
                <div className="absolute right-0 bottom-8 text-red-500 mb-7 rounded-sm mr-3 bg-yellow-500 px-2 py-1 text-xs group-hover:text-white group-hover:bg-red-500 transition-all duration-300 ease-in-out transform group-hover:translate-y-1">
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
      </div>
    </>
  );
};

export default SearchItems;
