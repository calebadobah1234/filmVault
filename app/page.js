import { use } from "react";
import LatestItems from "./components/LatestItems";

const BASE_URL = "https://filmvaultbackend-2-gftk.onrender.com";

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
      url: `${BASE_URL}/get-category-dataAm?category=action&limit=20&skip=0`,
      key: "actionMovies",
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

  const { moviesData, animeData, seriesData, actionMovies, kdramaData } = data;

  return (
    <div>
      <div className="mt-5 flex justify-center">
        <div>
          {/* <TrendingItems
            data={moviesData}
            title="Trending"
            flex={false}
            itemsToShow={14}
            showMoreCategory="all"
          /> */}
          <LatestItems
            data={moviesData}
            title="Latest Movies"
            flex={true}
            itemsToShow={14}
            showMoreCategory="all"
          />
          <LatestItems
            data={seriesData}
            title="Series"
            flex={true}
            itemsToShow={14}
            showMoreCategory="all"
            series={true}
          />
          <LatestItems
            data={animeData}
            title="Anime"
            flex={true}
            itemsToShow={14}
            showMoreCategory="all"
            anime={true}
          />
          <LatestItems
            data={kdramaData}
            title="Korean Series"
            flex={true}
            itemsToShow={14}
            showMoreCategory="all"
            kdrama={true}
          />

          <LatestItems
            data={actionMovies?.items}
            title="Action"
            link={true}
            flex={true}
            showMoreCategory="action"
            itemsToShow={14}
          />
        </div>
      </div>
    </div>
  );
}
