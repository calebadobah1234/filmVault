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
import dynamic from 'next/dynamic';
import ClientOnly from '@/app/components/ClientOnly';
import AdsteraScript from "@/app/components/SocialScript";
import AdportScript from "@/app/components/AdportBanner";
import AdportRichMedia from "@/app/components/AdportRichMedia";
import DirectLinkScript from "@/app/components/DirectLinkScript";
import SocialBarScript from "@/app/components/Socialbarscript";

export async function generateMetadata({ params }) {
  const res = await fetch(
    `https://api3.mp3vault.xyz/get-comic-details/${params.title}`,
    {
      cache: "force-cache",
    }
  );
  const data = await res.json();

  const coverImage = data.chapters?.[0]?.images?.[0]?.r2_url || data.chapters?.[0]?.images?.[0]?.original_src;

  return {
    title: `Read and Download ${data.title} - ${data.publisher} | ComicVault.xyz`,
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

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <div className="relative">
                    <ImageWithFallback
                      src={coverImage}
                      width={300}
                      height={450}
                      alt={data.title}
                      className="rounded-xl shadow-2xl border-4 border-white/10 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 text-white">
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight">
                  {data.title}
                </h1>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  <Link href={`/year-page?year=${data.year}&limit=30&skip=1&pageNumber=1`}>
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/80 hover:bg-blue-600 transition-all duration-200 backdrop-blur-sm border border-blue-400/30 hover:scale-105">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {data.year}
                    </span>
                  </Link>
                  
                  <Link href={`/publisher-page?publisher=${data.publisher}&skip=1&currentPage=1`}>
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/80 hover:bg-green-600 transition-all duration-200 backdrop-blur-sm border border-green-400/30 hover:scale-105">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      {data.publisher}
                    </span>
                  </Link>
                  
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-600/80 backdrop-blur-sm border border-purple-400/30">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    {data.releaseType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-orange-400">{data.totalChapters}</div>
                    <div className="text-gray-300">Chapters</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-red-400">{data.totalImagesFound}</div>
                    <div className="text-gray-300">Total Pages</div>
                  </div>
                </div>

                {data.description && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
                    <h3 className="text-xl font-semibold mb-3 text-purple-200">About</h3>
                    <p className="text-gray-300 leading-relaxed">{data.description}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/comic-reader/${params.title}`}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></span>
                    <span className="relative flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Start Reading
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Download Chapters</h2>
            <p className="text-gray-400 text-lg">Choose individual chapters or download the complete collection</p>
          </div>

          <div className="text-center mb-12">
            <a
              href={`/api/download-comic/${data._id}`}
              download={`${data.title}_Complete.zip`}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></span>
              <span className="relative flex items-center">
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Complete Comic ({data.totalChapters} Chapters)
              </span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.chapters && data.chapters.map((chapter, index) => (
              <div
                key={index}
                className="group relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Chapter {chapter.chapterNumber}
                    </h3>
                    <span className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300">
                      {chapter.totalImagesFound || chapter.images?.length} pages
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <a
                      href={`/api/download-chapter/${data._id}/${chapter.chapterNumber}`}
                      download={`${data.title}_Chapter_${chapter.chapterNumber}.zip`}
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download
                    </a>
                    
                    <Link
                      href={`/comic-reader/${params.title}?chapter=${chapter.chapterNumber}`}
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Read Online
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <LatestItems
              title="You May Also Like"
              data={relatedData}
              flex={true}
              relatedContent={true}
              hide={true}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <CommentSection itemId={data._id} linkIdentifier="Comic" />
          </div>
        </div>
      </div>
      
      <ClientOnly>
        <DirectLinkScript directLinkUrl="https://attendedlickhorizontally.com/jth75j6j5?key=1cc239cea6ecf5e6b20d0a992ab044c4" />
      </ClientOnly>
    </>
  );
};

export default page;