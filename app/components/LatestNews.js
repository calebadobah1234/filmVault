import React from "react";
import Image from "next/image";
import Link from "next/link";

const LatestNews = (props) => {
  return (
    <>
      <div className="ml-20 max-md:ml-1">
        {props.data.map((item, index) => {
          return (
            <div key={index} className="flex mb-10 max-md:flex-col">
              <Link href={`/more/${item._id}`}>
                <Image
                  src={item.urlToImage}
                  width={200}
                  height={300}
                  className=" w-80 min-w-80 max-md:min-w-[100%] max-md:flex max-md:justify-center max-md:rounded-lg"
                  alt={item.title}
                ></Image>
              </Link>
              <div className="max-w-[40%] border-b-4 max-md:max-w-[100%]">
                <Link href={`/more/${item._id}`}>
                  <h3 className="font-sans text-2xl font-bold antialiased mx-2 hover:underline">
                    {item.title}
                  </h3>
                </Link>
                <p className="line-clamp-3 font-sans text-xl antialiased mx-2 mt-3">
                  {item.description > 100
                    ? item.description.substring(0, 100) + "..."
                    : item.description}
                </p>
                <p className="font-sans text-md antialiased mx-2 mt-3">
                  <p className="text-red-600 inline">Published At: </p>
                  {item.publishedAt.split("T")[0]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default LatestNews;
