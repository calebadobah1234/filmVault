import Image from "next/image";
import Navbar from "./components/Navbar";
import TopPost from "./components/TopPost";
import LatestNews from "./components/LatestNews";
import Searchbar from "./components/Searchbar";
import Pagination from "./components/Pagination";
import Head from "next/head";
import { Metadata } from "next";

const urll = "https://byteread-final.onrender.com/get-20-items";

export const metadata = {
  title: "ByteRead: Short Movie and Video Game News at Your Fingertips",
  description:
    "Discover the latest news on short movies and video games at ByteRead. Stay updated with bite-sized articles, reviews, and insights into the world of cinema and gaming. Get your fix of entertainment news and immerse yourself in the exciting realm of movies and video games.",
  keywords: "ByteRead,Entertainment news,Film reviews",
};

export default async function Home() {
  const paginateStartNumber = 1;
  const paginateEndNumber = paginateStartNumber + 9;
  const res = await fetch(urll, { cache: "no-store" });
  const data = await res.json();

  const res2 = await fetch(`https://byteread-final.onrender.com/sort-views`, {
    cache: "force-cache",
  });
  const data2 = await res2.json();

  return (
    <>
      <div>
        <TopPost img="/jw4.webp" data2={data2} />
        <div className="flex justify-center">
          <div className="mt-44">
            <h3 className="font-sans text-4xl antialiased font-bold mb-4 ml-20 ">
              Latest Post
            </h3>
            <LatestNews data={data} />
            <Pagination
              paginatePagesToShow={10}
              currentPaginatePage={1}
              startNumber={1}
              endNumber={paginateEndNumber}
            />
          </div>
          <div className="col-span-2"></div>
        </div>
      </div>
    </>
  );
}
