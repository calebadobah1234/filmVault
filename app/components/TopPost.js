import React from "react";
import Image from "next/image";
import Link from "next/link";

const TopPost = async (props) => {
  return (
    <>
      <h2 className="flex justify-center font-extrabold text-3xl mt-10">
        Latest Movies
      </h2>
      <div className="flex justify-center mt-3 max-md:w-full">
        <div className="grid grid-cols-6 md:max-lg:grid-cols-4 md:max-lg:grid-rows-3 grid-rows-2 gap-3 max-md:gap-1 w-full max-w-[80%] max-md:w-full max-md:grid-cols-2">
          {props.data2.map((item, index) => {
            let imdb = item.imdb;

            return (
              <div
                key={index}
                className={`relative group max-md:w-full ${
                  index === 0 ? "col-span-1" : "col-span-1"
                } ${
                  index === 0 ? "row-span-1" : "row-span-1"
                } rounded-lg overflow-hidden`}
              >
                <Link href={`/more/${item._id}`}>
                  <Image
                    src={item.img}
                    width={100}
                    height={250}
                    className="w-full h-full object-cover transition duration-500 ease-in-out transform group-hover:scale-105"
                  />
                </Link>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-2">
                  <Link
                    href={
                      item.type === 2 ? `best/${item._id}` : `/more/${item._id}`
                    }
                  >
                    <h3 className="text-white font-sans text-base sm:text-lg md:text-xl font-bold truncate group-hover:text-green-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1">
                    IMDB: {imdb}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TopPost;
