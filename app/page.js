import { use } from "react";
import TopPost from "./components/TopPost";
import LatestNews from "./components/LatestNews";
import Pagination from "./components/Pagination";
import LatestItems from "./components/LatestItems";
import SlideShow from "./components/SlideShow";
import ChangeSlideRight from "./components/ChangeSlideRight";

const BASE_URL = "https://filmvaultbackend.onrender.com";

export const metadata = {
  title: "FilmVault.xyz: Free Hd movies download",
  description:
    "Explore a vast collection of the latest movies and enjoy free downloads in stunning HD quality. Choose from multiple resolutions, including 480p, 720p, and 1080p, to experience your favorite films at their best.",
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
    {
      url: `${BASE_URL}/get-20-itemsAm`,
      key: "moviesData",
      options: { next: { revalidate: 900 } },
    },
    {
      url: `${BASE_URL}/get-20-itemsAiom`,
      key: "seriesData",
      options: { next: { revalidate: 900 } },
    },
    {
      url: `${BASE_URL}/get-20-itemsAiome`,
      key: "animeData",
      options: { next: { revalidate: 900 } },
    },
    {
      url: `${BASE_URL}/get-highest-rated-moviesAm`,
      key: "highestRatedData",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-category-dataAm?category=action&limit=20&skip=0`,
      key: "actionMovies",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-category-dataAm?category=drama&limit=20&skip=0`,
      key: "dramaMovies",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-category-dataAm?category=romance&limit=20&skip=0`,
      key: "romanceMovies",
      options: { next: { revalidate: 21600 } },
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
    animeData,
    seriesData,
    highestRatedData,
    actionMovies,
    dramaMovies,
    romanceMovies,
  } = data;

  return (
    <div>
      <div className="mt-5 flex justify-center">
        <div>
          <LatestItems
            data={moviesData}
            title="Latest Movies"
            flex={true}
            itemsToShow={14}
            showMoreCategory="all"
          />
          <LatestItems
            data={seriesData}
            title="Latest Series"
            flex={true}
            itemsToShow={14}
            showMoreCategory="all"
          />
          <LatestItems
            data={animeData}
            title="Latest Anime"
            flex={true}
            itemsToShow={14}
            showMoreCategory="all"
          />

          <LatestItems
            data={actionMovies?.items}
            title="Action"
            link={true}
            flex={true}
            showMoreCategory="action"
            itemsToShow={14}
          />
          <LatestItems
            data={dramaMovies?.items}
            title="Drama"
            link={true}
            flex={true}
            showMoreCategory="drama"
            itemsToShow={14}
          />
          <LatestItems
            data={romanceMovies?.items}
            title="Romance"
            link={true}
            flex={true}
            showMoreCategory="Romance"
            itemsToShow={14}
          />
          <LatestItems
            data={highestRatedData}
            title="Highest Rated"
            flex={true}
            itemsToShow={14}
          />
        </div>
      </div>
    </div>
  );
}
