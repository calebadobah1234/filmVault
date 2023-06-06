import Pagination from "@/app/components/Pagination";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const page = async ({ params }) => {
  const res = await fetch(
    `http://localhost:3001/get-paginate-content/${params.pageNumber}`,
    { cache: "force-cache" }
  );
  const data = await res.json();

  return (
    <>
      <>
        <div className="mt-20">
          <h2 className="font-sans text-3xl antialiased font-bold mb-10 max-w-3xl flex justify-center">
            You are on page {params.pageNumber}{" "}
          </h2>
        </div>
        <div className="ml-20 max-md:ml-0">
          {data.map((item, index) => {
            return (
              <div key={index} className="flex mb-10 max-md:flex-col">
                <Link href={`/more/${item._id}`}>
                  <Image
                    src={item.urlToImage}
                    width={200}
                    height={200}
                    className="w-80 min-w-80 max-md:min-w-[100%] max-md:flex max-md:justify-center max-md:rounded-lg"
                  ></Image>
                </Link>
                <div className="max-w-[60%] border-b-4 max-h-80 max-md:max-w-[100%]">
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
      <Pagination
        startNumber={params.pageNumber - 4 < 1 ? 1 : params.pageNumber - 4}
        paginatePagesToShow={8}
        currentPage={params.pageNumber}
      />
    </>
  );
};

export default page;
