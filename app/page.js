import { use } from "react";
import LatestItems from "./components/LatestItems";
import TrendingItems from "./components/TrendingItems";

const BASE_URL = "https://api3.mp3vault.xyz";

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
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-20-itemsAiom`,
      key: "seriesData",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-20-itemsAiome`,
      key: "animeData",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-20-itemsAiokd`,
      key: "kdramaData",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-highest-rated-moviesAm`,
      key: "highestRatedData",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-category-dataAm?category=action&limit=30&skip=0`,
      key: "actionMovies",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-category-dataAm?category=comedy&limit=30&skip=0`,
      key: "comedyMovies",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/get-category-dataAiom?category=comedy&limit=30&skip=0`,
      key: "comedySeries",
      options: { next: { revalidate: 21600 } },
    },
    {
      url: `${BASE_URL}/sort-viewsAm`,
      key: "trendingMovies",
      options: { next: { revalidate: 0 } },
    },
    {
      url: `${BASE_URL}/sort-viewsAiom`,
      key: "trendingSeries",
      options: { next: { revalidate: 0 } },
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

  const { moviesData, animeData, seriesData, actionMovies, kdramaData,trendingMovies,trendingSeries,comedySeries,comedyMovies } = data;
console.log(`actionMovies`,actionMovies)
  return (
    <div>
      <div className="mt-5 flex justify-center">
      <div className="w-full">
        <div >

        <TrendingItems
            data={moviesData}
            title="Latest Movies"
            flex={false}
            itemsToShow={30}
          />

          <TrendingItems
            data={trendingMovies}
            title="Trending Movies"
            flex={false}
            itemsToShow={20}
          />
          <TrendingItems
            data={trendingSeries}
            title="Trending Series"
            flex={false}
            itemsToShow={20}
            series={true}
          />
          <TrendingItems
            data={actionMovies?.items}
            title="Action Movies"
            flex={false}
            itemsToShow={30}
          />
          <TrendingItems
            data={comedyMovies?.items}
            title="Comedy Movies"
            flex={false}
            itemsToShow={30}
          />
          
          
          <TrendingItems
            data={seriesData}
            title="Series"
            flex={false}
            itemsToShow={20}
            series={true}
          />
          <TrendingItems
            data={comedySeries?.items}
            title="Comedy Series"
            flex={false}
            itemsToShow={20}
            series={true}
          />
          <TrendingItems
            data={animeData}
            title="Anime"
            flex={false}
            itemsToShow={20}
            anime={true}
          />
          <TrendingItems
            data={kdramaData}
            title="Korean Series"
            flex={false}
            itemsToShow={20}
            kdrama={true}
          />
          

          </div>
        </div>
      </div>
    </div>
  );
}
