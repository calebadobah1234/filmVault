import React from "react";
import Image from "next/image";
import RelatedContent from "@/app/components/RelatedContent";
import axios from "axios";
import LatestItems from "@/app/components/LatestItems";
import Link from "next/link";
import DownloadSection from "@/app/components/DownloadSection";
import { JsonLd } from "react-schemaorg";

export async function generateMetadata({ params }) {
  const res = await fetch(
    `https://filmvaultbackend.onrender.com/get-item-detailsAiome/${params.title}`,
    {
      cache: "force-cache",
    }
  );
  const data1 = await res.json();
  const data = data1[0];
  return {
    title: `${data.title} ${data.year} free HD download | FilmVault.xyz`,
    description: `Watch and download ${data.title} (${
      data.year
    }) for free in HD quality. ${data.description.slice(0, 200)}`,
    openGraph: {
      title: `${data.title} ${data.year} free HD download | FilmVault.xyz`,
      description: `Watch and download ${data.title} (${
        data.year
      }) for free in HD quality. ${data.description.slice(0, 200)}`,
      images: [
        {
          url: data.img,
          width: 800,
          height: 600,
          alt: data.title,
        },
      ],
      type: "website",
      site_name: "FilmVault.xyz",
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
    `https://filmvaultbackend.onrender.com/get-item-detailsAiome/${params.title}`,
    {
      revalidate: 36000,
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
        `https://filmvaultbackend.onrender.com/get-related-contentAiome?${queryString}`,

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
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "Anime",
          name: data.title,
          description: data.description,
          datePublished: data.year,
          image: data.imageUrl,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: data.imdbRating,
            bestRating: "10",
            worstRating: "1",
            ratingCount: "1000",
          },
          genre: activeCategories,
          actor: actors.map((actor) => ({
            "@type": "Person",
            name: actor,
          })),
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            price: "0",
            priceCurrency: "USD",
          },
        }}
      />
      <div className="container mx-auto p-4 ">
        <div className="flex flex-col md:flex-row bg-gray-50 rounded-lg shadow-md overflow-hidden py-4">
          <div className="md:w-1/3 flex max-md:justify-start max-md:ml-6 lg:justify-end items-center">
            <Image
              src={data.imageUrl}
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
                  href={`/year-page?year=${data.year}&limit=30&skip=1&pageNumber=1`}
                >
                  <span className="text-blue-500 hover:underline">
                    {data.year}
                  </span>
                </Link>
              </p>
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-semibold">Genre: </span>
                {activeCategories.map((item, index) => (
                  <Link
                    key={index}
                    href={`/category-page-anime/?category=${item}&skip=${1}&currentPage=${1}`}
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
                <span className="text-yellow-500">{data.imdbRating}/10</span>
              </p>
              <div className="text-gray-700 mb-4">
                <span className="font-semibold">About: </span>
                <p className="text-gray-600">{data.description}</p>
              </div>
              {data.actors.length > 0 ? (
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
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="flex flex-col flex-wrap justify-center mt-6 gap-4">
            <DownloadSection seasons={data.seasons} />
          </div>
        </div>

        <div className="mt-12">
          <LatestItems
            title="You May Also Like"
            data={relatedData}
            flex={true}
            relatedContent={true}
            hide={true}
            anime={true}
          />
        </div>
      </div>
    </>
  );
};

export default page;
