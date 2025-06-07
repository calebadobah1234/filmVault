import { use, Suspense } from "react";
import LatestItems from "./components/LatestItems";
import TrendingItems from "./components/TrendingItems";

const BASE_URL = "https://api3.mp3vault.xyz";

// Enhanced metadata for better SEO
export const metadata = {
  title: "Free HD Movies & TV Series Download - Watch Latest Films Online",
  description: "Download the latest movies and TV series in HD quality for free. Stream or download in 480p, 720p, and 1080p. Updated daily with new releases, trending films, action movies, comedies, and popular series.",
  keywords: "free movies download, HD movies, TV series download, latest movies, streaming, 1080p movies, action movies, comedy series",
  openGraph: {
    title: "Free HD Movies & TV Series Download - Watch Latest Films Online",
    description: "Download the latest movies and TV series in HD quality for free. Stream or download in multiple resolutions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free HD Movies & TV Series Download - Watch Latest Films Online",
    description: "Download the latest movies and TV series in HD quality for free. Stream or download in multiple resolutions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Optimized fetch function with better error handling and caching
async function fetchData(url, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const res = await fetch(url, {
      next: { revalidate: options.revalidate || 3600 },
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
}

// Optimized data fetching with reduced API calls and better caching
async function fetchAllData() {
  const urls = [
    {
      url: `${BASE_URL}/get-20-itemsAm`,
      key: "moviesData",
      options: { next: { revalidate: 7200 } }, // 2 hours cache
    },
    {
      url: `${BASE_URL}/get-20-itemsAiom`,
      key: "seriesData",
      options: { next: { revalidate: 7200 } },
    },
    {
      url: `${BASE_URL}/get-category-dataAm?category=action&limit=20&skip=0`, // Reduced limit for faster response
      key: "actionMovies",
      options: { next: { revalidate: 14400 } }, // 4 hours cache for categories
    },
    {
      url: `${BASE_URL}/get-category-dataAm?category=comedy&limit=20&skip=0`,
      key: "comedyMovies",
      options: { next: { revalidate: 14400 } },
    },
    {
      url: `${BASE_URL}/get-category-dataAiom?category=comedy&limit=20&skip=0`,
      key: "comedySeries",
      options: { next: { revalidate: 14400 } },
    },
    {
      url: `${BASE_URL}/sort-viewsAm`,
      key: "trendingMovies",
      options: { next: { revalidate: 3600 } }, // 1 hour cache for trending
    },
    {
      url: `${BASE_URL}/sort-viewsAiom`,
      key: "trendingSeries",
      options: { next: { revalidate: 3600 } },
    },
  ];

  // Use Promise.allSettled for better error handling
  const results = await Promise.allSettled(
    urls.map(({ url, key, options }) =>
      fetchData(url, options).then((data) => ({ [key]: data }))
    )
  );

  // Filter successful results and merge
  const successfulResults = results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);

  return Object.assign({}, ...successfulResults);
}

// Loading component for better UX
function LoadingSection({ title }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-700 rounded-lg h-64"></div>
        ))}
      </div>
    </section>
  );
}

// Error fallback component
function ErrorSection({ title }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
        Unable to load {title.toLowerCase()}. Please try again later.
      </div>
    </section>
  );
}

export default function Home() {
  const data = use(fetchAllData());

  return (
    <main className="min-h-screen">
     

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSection title="Latest Movies" />}>
          {data?.moviesData ? (
            <section className="mb-12">
              <TrendingItems
                data={data.moviesData}
                title="Latest Movies"
                flex={false}
                itemsToShow={20}
              />
            </section>
          ) : (
            <ErrorSection title="Latest Movies" />
          )}
        </Suspense>

        <Suspense fallback={<LoadingSection title="Trending Movies" />}>
          {data?.trendingMovies ? (
            <section className="mb-12">
              <TrendingItems
                data={data.trendingMovies}
                title="Trending Movies"
                flex={false}
                itemsToShow={20}
              />
            </section>
          ) : (
            <ErrorSection title="Trending Movies" />
          )}
        </Suspense>

        <Suspense fallback={<LoadingSection title="Trending Series" />}>
          {data?.trendingSeries ? (
            <section className="mb-12">
              <TrendingItems
                data={data.trendingSeries}
                title="Trending TV Series"
                flex={false}
                itemsToShow={20}
                series={true}
              />
            </section>
          ) : (
            <ErrorSection title="Trending Series" />
          )}
        </Suspense>

        <Suspense fallback={<LoadingSection title="Action Movies" />}>
          {data?.actionMovies?.items ? (
            <section className="mb-12">
              <TrendingItems
                data={data.actionMovies.items}
                title="Action Movies"
                flex={false}
                itemsToShow={20}
              />
            </section>
          ) : (
            <ErrorSection title="Action Movies" />
          )}
        </Suspense>

        <Suspense fallback={<LoadingSection title="Comedy Movies" />}>
          {data?.comedyMovies?.items ? (
            <section className="mb-12">
              <TrendingItems
                data={data.comedyMovies.items}
                title="Comedy Movies"
                flex={false}
                itemsToShow={20}
              />
            </section>
          ) : (
            <ErrorSection title="Comedy Movies" />
          )}
        </Suspense>

        <Suspense fallback={<LoadingSection title="Latest Series" />}>
          {data?.seriesData ? (
            <section className="mb-12">
              <TrendingItems
                data={data.seriesData}
                title="Latest TV Series"
                flex={false}
                itemsToShow={20}
                series={true}
              />
            </section>
          ) : (
            <ErrorSection title="Latest Series" />
          )}
        </Suspense>

        <Suspense fallback={<LoadingSection title="Comedy Series" />}>
          {data?.comedySeries?.items ? (
            <section className="mb-12">
              <TrendingItems
                data={data.comedySeries.items}
                title="Comedy TV Series"
                flex={false}
                itemsToShow={20}
                series={true}
              />
            </section>
          ) : (
            <ErrorSection title="Comedy Series" />
          )}
        </Suspense>
      </div>

      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "FilmVault",
            "description": "Free HD Movies and TV Series Download Platform",
            "url": "https://filmvault.xyz",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://filmvault.xyz/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
       {/* Hero Section with structured data */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-8 -mb-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 mb-4">
            Free HD Movies & TV Series
          </h1>
          <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
            Discover thousands of movies and TV series available for free download in HD quality. 
            Updated daily with the latest releases in 480p, 720p, and 1080p.
          </p>
        </div>
      </section>
    </main>
  );
}