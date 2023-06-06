import React from "react";
import Image from "next/image";
import Link from "next/link";

const RelatedContent = async (props) => {
  const res = await fetch(
    `http://localhost:3001/get-related-content/${props.category}`
  );
  console.log(res);
  const data = await res.json();
  console.log(data);
  return (
    <div className="grid grid-cols-5 mt-40">
      <div className="cols-span-1"></div>
      <div className="col-span-3">
        <h3 className="font-sans text-3xl antialiased font-bold mb-4 max-w-3xl flex justify-center">
          Related Content
        </h3>
        <div className=" ">
          {data.map((item, index) => {
            return (
              <>
                <div key={index} className="flex mb-10 ">
                  <Link href={`/more/${item._id}`}>
                    <Image
                      src={item.urlToImage}
                      width={200}
                      height={200}
                      className="w-80 min-w-80"
                    ></Image>
                  </Link>
                  <div className="max-w-[60%] border-b-4 max-h-80">
                    <Link href={`/more/${item._id}`}>
                      <h3 className="font-sans text-2xl font-bold antialiased mx-2 hover:underline">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="line-clamp-2 font-sans text-xl antialiased mx-2 mt-3">
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