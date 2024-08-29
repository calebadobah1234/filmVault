import React from "react";
import Image from "next/image";
import RelatedContent from "@/app/components/RelatedContent";
import axios from "axios";
import LatestItems from "@/app/components/LatestItems";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const res = await fetch(
    `https://filmvaultbackend.onrender.com/get-item-detailsAm/${params.title}`,
    {
      cache: "force-cache",
    }
  );
  const data1 = await res.json();
  const data = data1[0];
  return {
    title: `FilmVault.xyz|${data.title} free download`,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      images: [
        {
          url: data.img,
          width: 800,
          height: 600,
          alt: data.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: [data.img],
    },
  };
}

const page = async ({ params }) => {
  const res = await fetch(
    `https://filmvaultbackend.onrender.com/get-item-detailsAm/${params.title}`,
    {
      revalidate: 86400,
    }
  );
  const resData = await res.json();
  const data = resData[0];

  const activeCategories = data.categories || [];
  const actors = data.actors || [];

  async function fetchRelatedContent(categories, actors, title) {
    try {
      const queryString = new URLSearchParams({
        categories: categories.join(","),
        actors: actors.join(","),
        title: title,
      }).toString();
      const response = await fetch(
        `https://filmvaultbackend.onrender.com/get-related-contentAm?${queryString}`,

        {
          cache: "force-cache",
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    } catch (error) {
      console.error("Error fetching related content:", error);
      return [];
    }
  }

  const relatedData = await fetchRelatedContent(
    activeCategories,
    actors,
    data.title
  );

  return (
    <>
      <div className="container mx-auto p-4 ">
        <div className="flex flex-col md:flex-row bg-gray-50 rounded-lg shadow-md overflow-hidden py-4">
          <div className="md:w-1/3 flex max-md:justify-start max-md:ml-6 lg:justify-end items-center">
            <Image
              src={data.img}
              width={200}
              height={300}
              alt={data.title}
              className="rounded-md"
            />
          </div>
          <div className="p-6 md:w-2/3 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {data.title}
              </h1>
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">Released:</span>{" "}
                <Link
                  href={`/year-page?year=${data.movieInfo.yearOfPublication}&limit=30&skip=1&pageNumber=1`}
                >
                  <span className="text-blue-500 hover:underline">
                    {data.movieInfo.yearOfPublication}
                  </span>
                </Link>
              </p>
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-semibold">Genre: </span>
                {activeCategories.map((item, index) => (
                  <Link
                    key={index}
                    href={`/category-page/?category=${item}&skip=${1}&currentPage=${1}`}
                  >
                    <span className="text-green-500 hover:underline cursor-pointer mr-2">
                      {item}
                      {index < activeCategories.length - 1 ? " |" : ""}
                    </span>
                  </Link>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">IMDB Rating:</span>{" "}
                <span className="text-yellow-500">{data.imdb}/10</span>
              </p>
              <div className="text-gray-700 mb-4">
                <span className="font-semibold">About: </span>
                <p className="text-gray-600">{data.description}</p>
              </div>
              <div className="text-gray-700">
                <span className="font-semibold">Actors:</span>{" "}
                {data.actors.map((item, index) => (
                  <Link key={index} href={`/actors-page/${item}`}>
                    <span className="text-blue-500 hover:underline cursor-pointer">
                      {item}
                      {index < data.actors.length - 1 ? ", " : ""}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Download Links</h2>
          <div className="flex flex-wrap justify-center mt-6 gap-4">
            {data.episodesData.map(
              (item, index) =>
                !item.downloadLink.includes("buy-subscription") && (
                  <a
                    href={item.downloadLink}
                    key={index}
                    className="max-md:min-w-[100%] bg-gray-800 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition duration-200"
                  >
                    {item.quality} | {item.size}
                  </a>
                )
            )}
          </div>
        </div>

        <div className="mt-12">
          <LatestItems
            title="You May Also Like"
            data={relatedData}
            flex={true}
            relatedContent={true}
            hide={true}
          />
        </div>
      </div>
    </>
  );
};

export default page;
