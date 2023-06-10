import React from "react";
import Image from "next/image";
import Link from "next/link";

const RelatedContent = async (props) => {
  const res = await fetch(
    `https://byteread-final.onrender.com/search/${props.title.slice(0, 5)}`
  );

  const data = await res.json();
  const limit = data.slice(0, 9);
  return (
    <div className="grid grid-cols-5 mt-40">
      <div className="cols-span-1 max-md:hidden"></div>
      <div className="col-span-3 max-md:col-span-5">
        <h3 className="font-sans text-3xl antialiased font-bold mb-10 max-w-3xl flex justify-center">
          Related
        </h3>
        <div className=" ">
          {limit.map((item, index) => {
            return (
              <>
                <div
                  key={index}
                  className={` ${
                    item.title == props.title
                      ? "hidden"
                      : "flex mb-10 max-md:flex-col"
                  }`}
                >
                  <Link href={`/more/${item._id}`}>
                    <Image
                      src={item.urlToImage}
                      width={200}
                      height={200}
                      alt={item.title}
                      className="w-80 min-w-80 max-md:min-w-[100%] max-md:flex max-md:justify-center max-md:rounded-lg"
                    ></Image>
                  </Link>
                  <div className="max-w-[60%] border-b-4 max-h-80 max-md:max-w-[100%]">
                    <Link href={`/more/${item._id}`}>
                      <h3 className="font-sans text-2xl font-bold antialiased mx-2 hover:underline">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="line-clamp-2 font-sans text-xl antialiased mx-2 mt-3 max-md:line-clamp-3">
                      {item.description}
                    </p>
                    <p className="font-sans text-md antialiased mx-2 mt-3">
                      <p className="text-red-600 inline">Published At: </p>
                      {item.publishedAt.split("T")[0]}
                    </p>
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RelatedContent;
