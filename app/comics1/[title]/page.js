import React from "react";
import AdScript from "@/app/components/Adscript";
import LatestItems from "@/app/components/LatestItemsComics";
import Link from "next/link";
import { JsonLd } from "react-schemaorg";
import CommentSection from "@/app/components/CommentSection";
import ImageWithFallback from "@/app/components/ImageWithFallback";
import ViewCounter from "@/app/components/ViewCounter";
import BannerScript from "@/app/components/BannerScript";
import BannerScript2 from "@/app/components/BannerScript2";
import NativeScript from "@/app/components/NativeScript";
import Script from "next/script";
import dynamic from 'next/dynamic';
import ClientOnly from '@/app/components/ClientOnly';
import AdsteraScript from "@/app/components/SocialScript";
import AdportScript from "@/app/components/AdportBanner";
import AdportRichMedia from "@/app/components/AdportRichMedia";
import DirectLinkScript from "@/app/components/DirectLinkScript";
import SocialBarScript from "@/app/components/Socialbarscript";
import ComicDownloadButton from "@/app/components/ComicDownloadButton";

export async function generateMetadata({ params }) {
  const res = await fetch(
    `https://api3.mp3vault.xyz/get-comic-details/${params.title}`,
    {
      cache: "force-cache",
    }
  );
  const data1 = await res.json();
  const data = data1[0];

  const coverImage = data.chapters?.[0]?.images?.[0]?.r2_url || data.chapters?.[0]?.images?.[0]?.original_src;

  return {
    title: `Read and Download ${data.title} - ${data.publisher} | FilmVault.xyz`,
    description: `Read and download ${data.title} online for free. ${
      data.description ? data.description.slice(0, 300) : ""
    } Published by ${data.publisher} in ${data.year}.`,
    openGraph: {
      title: `${data.title} - Read Online Free | ComicVault.xyz`,
      description: `Read and download ${data.title} for free. ${
        data.description ? data.description.slice(0, 300) : ""
      }`,
      images: [
        {
          url: coverImage,
          width: 800,
          height: 600,
          alt: data.title,
        },
      ],
      type: "website",
      site_name: "ComicVault.xyz",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: [coverImage],
    },
  };
}

async function fetchRelatedComics(publisher, year, title) {
  if (!publisher || !title) {
    console.error("Invalid input parameters:", { publisher, year, title });
    return [];
  }

  try {
    const params = {
      publisher: publisher.trim(),
      year: year || "",
      title: title.trim(),
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `https://api3.mp3vault.xyz/get-related-comics?${queryString}`;

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

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error fetching related comics:", {
      error: error.message,
      params: { publisher, year, title },
    });
    return [];
  }
}

const page = async ({ params }) => {
  const res = await fetch(
    `https://api3.mp3vault.xyz/get-comic-details/${params.title}`,
    {
      revalidate: 86400,
    }
  );
  
  const data1 = await res.json();
  const data = data1[0];

  const coverImage = data.chapters?.[0]?.images?.[0]?.r2_url || data.chapters?.[0]?.images?.[0]?.original_src;

  const relatedData = await fetchRelatedComics(
    data.publisher,
    data.year,
    data.title
  );

  return (
    <>
      <ViewCounter itemId={data._id} specifier="Comic" />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "ComicIssue",
          name: data.title,
          description: data.description,
          datePublished: data.year,
          image: coverImage,
          publisher: {
            "@type": "Organization",
            name: data.publisher,
          },
          genre: data.metadata?.genre || [],
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            price: "0",
            priceCurrency: "USD",
          },
        }}
      />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row bg-gray-50 rounded-lg shadow-md overflow-hidden py-4">
            <div className="md:w-1/3 flex max-md:justify-start max-md:ml-6 lg:justify-end items-center">
              <ImageWithFallback
                src={coverImage}
                width={300}
                height={450}
                alt={data.title}
                className="rounded-md shadow-lg"
              />
            </div>
            <div className="p-6 md:w-2/3 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                  {data.title}
                </h1>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <Link href={`/year-page?year=${data.year}&limit=30&skip=1&pageNumber=1`}>
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 transition-all duration-200 hover:scale-105">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {data.year}
                    </span>
                  </Link>
                  
                  <Link href={`/publisher-page?publisher=${data.publisher}&skip=1&currentPage=1`}>
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 hover:bg-green-200 text-green-800 transition-all duration-200 hover:scale-105">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      {data.publisher}
                    </span>
                  </Link>
                  
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    {data.releaseType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600">{data.totalChapters}</div>
                    <div className="text-gray-600">Chapters</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="text-3xl font-bold text-red-600">{data.totalImagesFound}</div>
                    <div className="text-gray-600">Total Pages</div>
                  </div>
                </div>

                {data.description && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">About</h3>
                    <p className="text-gray-700 leading-relaxed">{data.description}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/comic-reader/${params.title}`}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-200"
                  >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Start Reading
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Read Online</h2>
          <div className="flex justify-center">
            <Link
              href={`/comic-reader/${params.title}`}
              className="bg-blue-600 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 text-lg font-semibold"
            >
              Start Reading Online
            </Link>
          </div>
        </div> */}

     <div className="mt-12">
  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Download Chapters</h2>
  <div className="container mx-auto px-4">
    <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
      {data.chapters && data.chapters.map((chapter, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 w-full sm:w-80 md:w-72 lg:w-80"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Chapter {chapter.chapterNumber}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {chapter.totalImagesFound || chapter.images?.length} Pages
          </p>
          <div className="flex flex-col gap-2">
            {/* Updated download link to use PDF server */}
            <ComicDownloadButton
  comicId={data._id}
  chapterNumber={chapter.chapterNumber}
  comicTitle={data.title}
  className="bg-red-600 text-white py-2 px-4 rounded-lg shadow hover:bg-red-700 transition duration-200 text-center flex items-center justify-center"
>
  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
  Download PDF
</ComicDownloadButton>
            <Link
              href={`/comic-reader/${params.title}?chapter=${chapter.chapterNumber}`}
              className="bg-green-600 text-white py-2 px-4 rounded-lg shadow hover:bg-green-700 transition duration-200 text-center"
            >
              Read Chapter {chapter.chapterNumber}
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
        {/* <div className="mt-8 text-center">
          <a
            href={`/api/download-comic/${data._id}`}
            download={`${data.title}_Complete.zip`}
            className="bg-red-600 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-red-700 transition duration-200 text-lg font-semibold"
          >
            Download Complete Comic ({data.totalChapters} Chapters)
          </a>
        </div> */}

        <div className="mt-12">
          <LatestItems
            title="You May Also Like"
            data={relatedData}
            flex={true}
            relatedContent={true}
            hide={true}
          />
        </div>

        <CommentSection itemId={data._id} linkIdentifier="Comic" />
      </div>
      
      {/* <ClientOnly>
        <DirectLinkScript directLinkUrl="https://attendedlickhorizontally.com/jth75j6j5?key=1cc239cea6ecf5e6b20d0a992ab044c4" />
      </ClientOnly> */}
    </>
  );
};

export default page;