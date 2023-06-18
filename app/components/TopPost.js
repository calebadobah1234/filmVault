import React from "react";
import Image from "next/image";
import Link from "next/link";

const TopPost = async (props) => {
  return (
    <>
      <div className="flex justify-center mt-10">
        <div className="grid grid-cols-7 grid-rows-2 gap-3 justify-center max-w-[80%] max-md:flex max-md:flex-col max-md:max-w-[95%]">
          {props.data2.map((item, index) => {
            return (
              <div
                key={index}
                className={`relative ${
                  index === 0 ? "col-span-3" : "col-span-2"
                } ${
                  index === 0 ? "row-span-2" : "row-span-1"
                } rounded-lg overflow-hidden`}
              >
                <Link href={`/more/${item._id}`}>
                  <Image
                    src={item.urlToImage}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition duration-500 ease-in-out transform hover:scale-110"
                  />
                </Link>
                <div className="absolute bottom-0 bg-black bg-opacity-50 w-full p-2">
                  <Link
                    href={
                      item.type === 2 ? `best/${item._id}` : `/more/${item._id}`
                    }
                  >
                    <h3 className="text-white font-sans xl:text-xl text-2xl font-bold antialiased mx-2 hover:underline">
                      {item.title}
                    </h3>
                  </Link>
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
