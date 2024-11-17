import React from "react";
import Image from "next/image";
import RelatedContent from "@/app/components/RelatedContent";
import axios from "axios";
import LatestItems from "@/app/components/LatestItems";
import Link from "next/link";
import { JsonLd } from "react-schemaorg";
import CommentSection from "@/app/components/CommentSection";
import ImageWithFallback from "@/app/components/ImageWithFallback";
import Script from "next/script";

export async function generateMetadata({ params }) {
  const res = await fetch(
    `https://filmvaultbackend-3.onrender.com/get-item-detailsAm/${params.title}`,
    {
      cache: "force-cache",
    }
  );
  const data1 = await res.json();
  const data = data1[0];
  return {
    title: `${data.title} ${
      data.year ? data.year : ""
    } free HD download | FilmVault.xyz`,
    description: `Watch and download ${data.title} (${
      data.year
    }) for free in HD quality. ${
      data.description ? data.description.slice(0, 300) : ""
    }`,
    openGraph: {
      title: `${data.title} ${
        data.year ? data.year : ""
      } free HD download | FilmVault.xyz`,
      description: `Watch and download ${data.title} (${
        data.year ? data.year : ""
      }) for free in HD quality. ${
        data.description ? data.description.slice(0, 300) : ""
      }`,
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
    `https://filmvaultbackend-3.onrender.com/get-item-detailsAm/${params.title}`,
    {
      revalidate: 86400,
    }
  );
  const sanitizeTitle = (title) => {
    return title?.replace(/[^a-zA-Z0-9]/g, "_") + ".jpg";
  };
  const resData = await res.json();
  const data = resData[0];

  const activeCategories = data.categories || [];
  const actors = data.actors || [];

  async function fetchRelatedContent(categories, actors, title) {
    // Input validation and cleaning
    if (!Array.isArray(categories) || !Array.isArray(actors) || !title) {
      console.error("Invalid input parameters:", { categories, actors, title });
      return [];
    }

    // Clean and deduplicate the data
    const uniqueActors = [...new Set(actors)]
      .filter(Boolean)
      .map((actor) => actor.trim());

    const uniqueCategories = [...new Set(categories)]
      .filter(Boolean)
      .map((category) => category.trim());

    try {
      // Create the query parameters
      const params = {
        categories: uniqueCategories.join(","),
        actors: uniqueActors.join(","),
        title: title.trim(),
      };

      // Log the exact data being sent
      console.log("Request parameters:", params);

      const queryString = new URLSearchParams(params).toString();
      const url = `https://filmvaultbackend-3.onrender.com/get-related-contentAm?${queryString}`;

      console.log("Fetching from URL:", url);

      const response = await fetch(url, {
        cache: "force-cache",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorInfo;
        try {
          errorInfo = JSON.parse(errorText);
        } catch (e) {
          errorInfo = errorText;
        }

        console.error("API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          url: url,
          error: errorInfo,
        });

        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching related content:", {
        error: error.message,
        params: { categories: uniqueCategories, actors: uniqueActors, title },
      });
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
          "@type": "Movie",
          name: data.title,
          description: data.description,
          datePublished: data.year
            ? data.year
            : data.movieInfo.yearOfPublication,
          image: data.imageUrl ? data.imageUrl : data.img,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: data.imdbRating ? data.imdbRating : data.imdb,
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
      <Script id="ad-options">
        {`atOptions = {
          'key' : 'db2206c1070f56974805612fc96f6ba4',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };`}
      </Script>
      <Script src="//www.highperformanceformat.com/db2206c1070f56974805612fc96f6ba4/invoke.js" />
      <div className="container mx-auto p-4 ">
        <div className="flex flex-col md:flex-row bg-gray-50 rounded-lg shadow-md overflow-hidden py-4">
          <div className="md:w-1/3 flex max-md:justify-start max-md:ml-6 lg:justify-end items-center">
            <ImageWithFallback
              src={
                data.img && !data.img.includes("avamovie")
                  ? data.img
                  : data.img && data.img.includes("avamovie")
                  ? `/images1/${sanitizeTitle(data.title)}`
                  : data.imageUrl == "N/A"
                  ? "/"
                  : data.imageUrl
              }
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
                  href={`/year-page?year=${
                    data.movieInfo?.yearOfPublication
                      ? data.movieInfo.yearOfPublication
                      : data.year
                  }&limit=30&skip=1&pageNumber=1`}
                >
                  <span className="text-blue-500 hover:underline">
                    {data.movieInfo?.yearOfPublication
                      ? data.movieInfo.yearOfPublication
                      : data.year}
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
                {(data.imdb !== undefined && data.imdb !== null) ||
                data.imdbRating ? (
                  <>
                    <span className="font-semibold">IMDB Rating:</span>{" "}
                    <span className="text-yellow-500">
                      {data.imdb ? data.imdb : data.imdbRating}/10
                    </span>
                  </>
                ) : null}
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
            {data.episodesData.map((item, index) => {
              // Only show links that DON'T include either "buy-subscription" OR "Duble"
              const blockedTerms = ["buy-subscription", "Duble", "Dubbed"];
              const isValidLink = !blockedTerms.some((term) =>
                item.downloadLink.includes(term)
              );

              return (
                isValidLink && (
                  <a
                    href={item.downloadLink}
                    key={index}
                    className="max-md:min-w-[100%] bg-gray-800 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition duration-200"
                  >
                    {item.quality} | {item.size}
                  </a>
                )
              );
            })}
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
        <CommentSection itemId={data._id} linkIdentifier="Am" />
      </div>
    </>
  );
};

export default page;
