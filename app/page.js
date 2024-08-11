import { use } from "react";
import TopPost from "./components/TopPost";
import LatestNews from "./components/LatestNews";
import Pagination from "./components/Pagination";
import LatestItems from "./components/LatestItems";
import SlideShow from "./components/SlideShow";
import ChangeSlideRight from "./components/ChangeSlideRight";

const BASE_URL = "http://localhost:3001";

export const metadata = {
  title: "ByteRead: Short Movie and Video Game News at Your Fingertips",
  description:
    "Discover the latest news on short movies and video games at ByteRead. Stay updated with bite-sized articles, reviews, and insights into the world of cinema and gaming. Get your fix of entertainment news and immerse yourself in the exciting realm of movies and video games.",
  keywords: "ByteRead,Entertainment news,Film reviews",
};

async function fetchData(url, options = {}) {
  try {
    const res = await fetch(url, {
      next: { revalidate: options.revalidate || 3600 }, // Default to 1 hour if not specified
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
}

async function fetchAllData() {
  const urls = [
    { url: `${BASE_URL}/get-20-itemsAm`, key: "moviesData" },
    {
      url: `${BASE_URL}/sort-viewsAm`,
      key: "viewsData",
      options: { next: { revalidate: 0 } },
    },
    { url: `${BASE_URL}/get-20-itemsAm`, key: "seriesData" },
    { url: `${BASE_URL}/get-highest-rated-moviesAm`, key: "highestRatedData" },
    {
      url: `${BASE_URL}/get-category-dataAm?category=action&limit=20&skip=0`,
      key: "actionMovies",
    },
    {
      url: `${BASE_URL}/get-category-dataAm?category=drama&limit=20&skip=0`,
      key: "dramaMovies",
    },
    {
      url: `${BASE_URL}/get-category-dataAm?category=romance&limit=20&skip=0`,
      key: "romanceMovies",
    },
  ];

  const results = await Promise.all(
    urls.map(({ url, key, options }) =>
      fetchData(url, options).then((data) => ({ [key]: data }))
    )
  );

  return Object.assign({}, ...results);
}

export default function Home() {
  const data = use(fetchAllData());

  if (!data) {
    return <div>Error loading data. Please try again later.</div>;
  }

  const {
    moviesData,
    viewsData,
    seriesData,
    highestRatedData,
    actionMovies,
    dramaMovies,
    romanceMovies,
  } = data;

  return (
    <div>
      <div className="mt-5">
        <LatestItems data={moviesData} title="Latest Movies" flex={true} />
        <LatestItems data={seriesData} title="Latest Series" flex={true} />
        <LatestItems data={moviesData} title="Latest Anime" flex={true} />
        <LatestItems
          data={highestRatedData}
          title="Highest Rated"
          flex={true}
        />
        <LatestItems
          data={actionMovies?.items}
          title="Action"
          link={true}
          flex={true}
          showMoreCategory="action"
        />
        <LatestItems
          data={dramaMovies?.items}
          title="Drama"
          link={true}
          flex={true}
          showMoreCategory="drama"
        />
        <LatestItems
          data={romanceMovies?.items}
          title="Romance"
          link={true}
          flex={true}
          showMoreCategory="Romance"
        />
      </div>
    </div>
  );
}
