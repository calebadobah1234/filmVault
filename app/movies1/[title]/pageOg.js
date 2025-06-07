import React from "react";

import AdScript from "@/app/components/Adscript";
import LatestItems from "@/app/components/LatestItems";
import Link from "next/link";
import { JsonLd } from "react-schemaorg";
import CommentSection from "@/app/components/CommentSection";
import ImageWithFallback from "@/app/components/ImageWithFallback";
import ViewCounter from "@/app/components/ViewCounter";
import BannerScript from "@/app/components/BannerScript";
import BannerScript2 from "@/app/components/BannerScript2";
import NativeScript from "@/app/components/NativeScript";
import Script from "next/script";
// import StreamingComponent from "@/app/components/StreamingComponent"
import dynamic from 'next/dynamic';
import ClientOnly from '@/app/components/ClientOnly';
import AdsteraScript from "@/app/components/SocialScript";
import AdportScript from "@/app/components/AdportBanner";
import AdportRichMedia from "@/app/components/AdportRichMedia";
import DirectLinkScript from "@/app/components/DirectLinkScript";
import SocialBarScript from "@/app/components/Socialbarscript";

// Domain to CDN mapping function
const replaceDomainWithCDN = (url) => {
  if (!url) return url;
  
  // Map of domains to their CDN equivalents
  const domainMappings = {
    "http://ds10.30namachi.com": "https://namachi10.b-cdn.net",
    "http://ds11.30namachi.com": "https://namachi11.b-cdn.net",
    "http://ds12.30namachi.com": "https://namachi12.b-cdn.net",
    "http://ds14.30namachi.com": "https://namachi14.b-cdn.net",
    "http://ds15.30namachi.com": "https://namachi15.b-cdn.net",
    "http://ds16.30namachi.com": "https://namachi16.b-cdn.net",
    "http://ds17.30namachi.com": "https://namachi17.b-cdn.net",
    "http://ds3.30namachi.co": "https://namachi3.b-cdn.net",
    "http://dl4.30namcahi.com": "https://namachi4.b-cdn.net",
    "http://ds5.30namachi.com": "https://namachi5.b-cdn.net",
    "http://ds7.30namachi.com": "https://namachi7.b-cdn.net",
    "http://d10.30namachi.com": "https://namachid10.b-cdn.net",
    "https://dl11.sermoviedown.pw": "https://sermovie11.b-cdn.net",
    "https://dl12.sermoviedown.pw": "https://sermovie12.b-cdn.net",
    "https://dl3.sermoviedown.pw": "https://sermovie3.b-cdn.net",
    "https://dl4.sermoviedown.pw": "https://sermovie4.b-cdn.net",
    "https://dl5.sermoviedown.pw": "https://sermovie5.b-cdn.net",
    "https://dl2.sermoviedown.pw": "https://servmovie2.b-cdn.net",
    "http://dl.vinadl.xyz": "https://vinadl1.b-cdn.net",
    "http://dl2.vinadl.xyz": "https://vinadl2.b-cdn.net",
    "http://dl3.vinadl.xyz": "https://vinadl3.b-cdn.net",
    "http://dl8.vinadl.xyz": "https://vinadl8.b-cdn.net",
    "http://dl9.vinadl.xyz": "https://vinadl9.b-cdn.net",
    "https://dl1.dl-bcmovie1.xyz": "https://bcmovie1.b-cdn.net",
    "https://storage.googleapis.com/fvmoviesbucket":"https://fvsrv1.b-cdn.net",
    "https://dl.vinadl.xyz":"https://vinadl0.b-cdn.net",
    "https://silverangel.000f.fastbytes.org":"https://silverangel.b-cdn.net"
  };

  // Check each domain pattern and replace if found
  for (const [oldDomain, newDomain] of Object.entries(domainMappings)) {
    if (url.startsWith(oldDomain)) {
      return url.replace(oldDomain, newDomain);
    }
  }

  return url;
};

export async function generateMetadata({ params }) {
  const res = await fetch(
    `https://api3.mp3vault.xyz/get-item-detailsAm/${params.title}`,
    {
      cache: "force-cache",
    }
  );
  const data1 = await res.json();
  const data = data1[0];

  // Check if the year is already in the title
  const shouldAddYear = !data.title.includes(data.year);
  const titleWithYear = shouldAddYear
    ? `${data.title} ${data.year}`
    : data.title;

  return {
    title: `watch and download ${titleWithYear} full movie | FilmVault.xyz`,
    description: `Watch and download ${titleWithYear} for free in HD quality. ${
      data.description ? data.description.slice(0, 300) : ""
    }`,
    openGraph: {
      title: `${titleWithYear} free HD download | FilmVault.xyz`,
      description: `Watch and download ${titleWithYear} for free in HD quality. ${
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

const StreamingComponent = dynamic(
  () => import('@/app/components/StreamingComponent'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-900 rounded-xl animate-pulse" />
  }
);

const page = async ({ params }) => {
  const res = await fetch(
    `https://api3.mp3vault.xyz/get-item-detailsAm/${params.title}`,
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
      const url = `https://api3.mp3vault.xyz/get-related-contentAm?${queryString}`;

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

  console.log(`pagapaga :${data.downloadPageUrl}`);
  
  // Process download URLs to use CDN when applicable
  if (data.downloadPageUrl) {
    data.downloadPageUrl = replaceDomainWithCDN(data.downloadPageUrl);
  }
  
  if (data.downloadLinksNaija && data.downloadLinksNaija.length > 0) {
    data.downloadLinksNaija = data.downloadLinksNaija.map(item => ({
      ...item,
      url: replaceDomainWithCDN(item.url)
    }));
  }
  
  if (data.episodesData && data.episodesData.length > 0) {
    data.episodesData = data.episodesData.map(item => ({
      ...item,
      downloadLink: replaceDomainWithCDN(item.downloadLink)
    }));
  }
  
  if (data.episodesDataBC && data.episodesDataBC.length > 0) {
    data.episodesDataBC = data.episodesDataBC.map(item => ({
      ...item,
      downloadLink: replaceDomainWithCDN(item.downloadLink)
    }));
  }

  return (
    <>
    <ViewCounter itemId={data._id} specifier="Am" />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "Movie",
          name: data.title,
          description: data.description,
          datePublished: data.year
            ? data.year
            : data.movieInfo?.yearOfPublication,
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
{/* <AdportScript /> */}


{/* <AdScript type="native" className="my-banner-class flex justify-center"/> */}
        {/* <AdScript type="native" className="my-banner-class flex justify-center"/> */}
        {/* <AdScript type="native" className="my-banner-class flex justify-center"/> */}

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
{/* <BannerScript2/> */}
{/* <AdportRichMedia /> */}

{/* <AdScript type="custom" /> */}
        <div className="mt-8">
          {/* <h2 className="text-2xl font-bold text-gray-800 mb-4">Stream Now</h2> */}
          <ClientOnly>
            <StreamingComponent 
              movieTitle={data.title}
              sources={data.episodesData.filter(item => 
                !["buy-subscription", "Duble", "Dubbed"].some(term => 
                  item.downloadLink.toLowerCase().includes(term.toLowerCase())
                )
              )}
              sources2={data.episodesData2?.filter(item => 
                !["buy-subscription", "Duble", "Dubbed"].some(term => 
                  item.downloadLink.toLowerCase().includes(term.toLowerCase())
                )
              )}
              mainSource={data.downloadPageUrl}
              naijaRocks={data.downloadLinksNaija?.[0]?.url}
            />
          </ClientOnly>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Download Links</h2>
          <div className="flex flex-wrap justify-center mt-6 gap-4">
            {/* Main download link if actualDownloadUrl exists */}
            {(data.downloadPageUrl || data.downloadLinksNaija) && (
              <a
                href={data.downloadPageUrl ? data.downloadPageUrl : data.downloadLinksNaija[0].url}
                download={`${data.title}.mp4`}
                className="max-md:min-w-[100%] bg-gray-800 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition duration-200"
              >
                Download {data.title}  {data.fileSize ? `| ${data.fileSize}` : ""}
              </a>
            )}
            
            {/* Episode download links */}
            {data.episodesData && data.episodesData.map((item, index) => {
              const blockedTerms = ["buy-subscription", "Duble", "Dubbed"];
              const isValidLink = !blockedTerms.some((term) =>
                item.downloadLink.toLowerCase().includes(term.toLowerCase())
              );

              return (
                isValidLink && (
                  <a
                    href={item.downloadLink}
                    key={index}
                    download={`${data.title}_${item.quality}.mp4`}
                    className="max-md:min-w-[100%] bg-gray-800 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition duration-200"
                  >
                    {item.quality} | {item.size}
                  </a>
                )
              );
            })}
          </div>
        </div>

        {/* Server 2 (episodesDataBC) Section */}
        {data.episodesDataBC && data.episodesDataBC.length > 0 && (
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Server 99</h2>
            <div className="flex flex-wrap justify-center mt-6 gap-4">
              {data.episodesDataBC.map((item, index) => {
                const blockedTerms = ["buy-subscription", "Duble", "Dubbed"];
                const isValidLink = !blockedTerms.some((term) =>
                  item.downloadLink.toLowerCase().includes(term.toLowerCase())
                );

                return (
                  isValidLink && (
                    <a
                      href={item.downloadLink}
                      key={index}
                      download={`${data.title}_${item.quality}.mp4`}
                      className="max-md:min-w-[100%] bg-gray-700 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-gray-600 transition duration-200"
                    >
                      {item.quality} | {item.size}
                    </a>
                  )
                );
              })}
            </div>
          </div>
        )}
{/* <BannerScript /> */}
        {/* <AdScript /> */}
        
        {/* <NativeScript /> */}
        {/* <AdsteraScript /> */}
        <div className="mt-12">
          <LatestItems
            title="You May Also Like"
            data={relatedData}
            flex={true}
            relatedContent={true}
            hide={true}
          />
        </div>
        {/* <BannerScript /> */}
        {/* <AdScript type="custom-2"/> */}
{/* <AdScript type="custom-2"/>
<AdScript type="custom-2"/> */}
{/* <SocialBarScript 
        delay={15000} 
        sessionKey="customSocialBarKeyhhyy" 
        className="my-custom-classhggyy" 
      /> */}
        <CommentSection itemId={data._id} linkIdentifier="Am" />
        
      </div>
      <ClientOnly>
        <DirectLinkScript directLinkUrl="https://attendedlickhorizontally.com/jth75j6j5?key=1cc239cea6ecf5e6b20d0a992ab044c4" />
      </ClientOnly>
    </>
  );
};

export default page;