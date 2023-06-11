import React from "react";
import Image from "next/image";
import RelatedContent from "@/app/components/RelatedContent";
import axios from "axios";

export const generateMetadata = async ({ params }) => {
  const res = await fetch(
    `https://byteread-final.onrender.com/get-item-details/${params.id}`,
    { cache: "force-cache" }
  );
  const data = await res.json();
  return {
    title: `${data.title}`,
    description: `${data.description}`,
  };
};

const page = async ({ params }) => {
  const res = await fetch(
    `https://byteread-final.onrender.com/get-item-details/${params.id}`,
    { cache: "force-cache" }
  );
  const data = await res.json();
  const addViews = await axios.post(
    `https://byteread-final.onrender.com/add-views/${params.id}`
  );

  const filtered = data.mainData.filter((item) => {
    return !item.includes("RELATED", "MORE:\n");
  });
  return (
    <>
      <div className="grid grid-cols-5 mt-10">
        <div className="col-span-1 max-md:hidden"></div>
        <div className="col-span-3 max-md:col-span-5 ">
          <h1 className="font-sans text-2xl antialiased font-bold mb-4 max-w-3xl max-md:ml-2">
            {data.title}
          </h1>
          <div className="h-96 overflow-hidden">
            <Image
              src={data.urlToImage}
              width={800}
              height={300}
              alt={data.title}
              className="min-h-[100%]"
            />
          </div>
          <div className="mt-10 w-[80%] max-md:w-[94%] max-md:ml-2">
            <p className="font-sans text-lg antialiased leading-relaxed mb-4">
              {filtered.map((item) => {
                return (
                  <>
                    <p className="my-5">{item}</p>
                  </>
                );
              })}
            </p>
          </div>
        </div>
      </div>
      <RelatedContent title={data.title} />
    </>
  );
};

export default page;
