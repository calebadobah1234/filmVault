import React from "react";
import Image from "next/image";
import RelatedContent from "@/app/components/RelatedContent";
import axios from "axios";
import Head from "next/head";
import { Metadata } from "next";

export const generateMetadata = async ({ params }) => {
  const res = await fetch(
    `http://localhost:3001/get-item-details/${params.id}`,
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
    `http://localhost:3001/get-item-details/${params.id}`,
    { cache: "force-cache" }
  );
  const data = await res.json();
  const addViews = await axios.post(
    `http://localhost:3001/add-views/${params.id}`
  );

  const filtered = data.mainData.filter((item) => {
    return !item.includes("RELATED", "MORE:\n");
  });
  return (
    <>
      <Head>
        <title>
          ByteRead: Short Movie and Video Game News at Your Fingertips
        </title>
        <meta
          name="description"
          content="Discover the latest news on short movies and video games at ByteRead. Stay updated with bite-sized articles, reviews, and insights into the world of cinema and gaming. Get your fix of entertainment news and immerse yourself in the exciting realm of movies and video games."
        ></meta>
        <meta
          name="keywords"
          content="ByteRead,Entertainment news,Film reviews"
        ></meta>
      </Head>
      <div className="grid grid-cols-5 mt-10">
        <div className="col-span-1 max-md:hidden"></div>
        <div className="col-span-3 max-md:col-span-5">
          <h1 className="font-sans text-2xl antialiased font-bold mb-4 max-w-3xl max-md:ml-2">
            {data.title}
          </h1>
          <Image src={data.urlToImage} width={800} height={300} />
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
