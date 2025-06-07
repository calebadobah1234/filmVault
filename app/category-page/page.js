import Pagination from "@/app/components/Pagination";
import React from "react";
import SearchItems from "@/app/components/SearchItems";
import { notFound } from "next/navigation";

// Enhanced metadata generation with better SEO
export async function generateMetadata({ searchParams }) {
  const category = searchParams.category || "all";
  const currentPage = parseInt(searchParams.currentPage) || 1;
  
  // Capitalize category for better display
  const capitalizedCategory = category === "all" 
    ? "All" 
    : category.charAt(0).toUpperCase() + category.slice(1);
  
  // Create more descriptive titles based on category
  const categoryDescriptions = {
    action: "Action-packed movies with thrilling adventures and explosive scenes",
    comedy: "Hilarious comedy movies to make you laugh out loud",
    drama: "Emotional drama movies with compelling storylines",
    horror: "Spine-chilling horror movies for thrill seekers",
    romance: "Romantic movies for love story enthusiasts",
    thriller: "Suspenseful thriller movies that keep you on edge",
    adventure: "Epic adventure movies for exciting journeys",
    fantasy: "Magical fantasy movies with supernatural elements",
    "sci-fi": "Science fiction movies exploring futuristic concepts",
    all: "Complete collection of movies across all genres"
  };

  const description = categoryDescriptions[category] || 
    `Browse and download ${capitalizedCategory.toLowerCase()} movies for free`;

  const title = currentPage === 1 
    ? `${capitalizedCategory} Movies - Free HD Download`
    : `${capitalizedCategory} Movies - Page ${currentPage} - Free HD Download`;

  const fullDescription = currentPage === 1
    ? `${description}. Download high-quality movies in 480p, 720p, and 1080p formats. Updated regularly with latest releases.`
    : `${description} on page ${currentPage}. Download high-quality movies in multiple formats.`;

  return {
    title,
    description: fullDescription,
    keywords: `${category} movies, free movie download, HD movies, ${category} films, download movies, streaming`,
    openGraph: {
      title,
      description: fullDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: fullDescription,
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
    alternates: {
      canonical: `/category-page?category=${category}&currentPage=${currentPage}`,
    },
  };
}

// Enhanced data fetching with error handling and validation
async function fetchCategoryData(category, skip, limit = 30) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const res = await fetch(
      `https://api3.mp3vault.xyz/get-category-dataAm/?category=${category}&limit=${limit}&skip=${skip}`,
      { 
        next: { revalidate: 14400 }, // 4 hours cache
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    // Validate data structure
    if (!data || !Array.isArray(data.items)) {
      throw new Error('Invalid data structure received');
    }
    
    return data;
    
  } catch (error) {
    console.error(`Error fetching category data:`, error);
    return null;
  }
}

// Generate breadcrumb structured data
function generateBreadcrumbStructuredData(category, currentPage) {
  const capitalizedCategory = category === "all" 
    ? "All" 
    : category.charAt(0).toUpperCase() + category.slice(1);
    
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://filmvault.xyz"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Movies",
        "item": "https://filmvault.xyz/movies"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${capitalizedCategory} Movies`,
        "item": `https://filmvault.xyz/category-page?category=${category}`
      }
    ]
  };
}

const CategoryPage = async ({ searchParams }) => {
  // Validate and sanitize search params
  const category = searchParams.category || "all";
  const currentPage = parseInt(searchParams.currentPage) || 1;
  const skip = parseInt(searchParams.skip) || 0;
  
  // Validate category (prevent injection)
  const validCategories = ["all", "action", "comedy", "drama", "horror", "romance", "thriller", "adventure", "fantasy", "sci-fi"];
  if (!validCategories.includes(category.toLowerCase())) {
    notFound();
  }
  
  // Validate page number
  if (currentPage < 1 || currentPage > 1000) { // Reasonable limit
    notFound();
  }
  
  const data = await fetchCategoryData(category, skip);
  
  if (!data) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Error Loading {category.charAt(0).toUpperCase() + category.slice(1)} Movies
          </h1>
          <p className="text-gray-600 mb-8">
            We're having trouble loading the movies right now. Please try again later.
          </p>
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </main>
    );
  }
  
  if (!data.items || data.items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            No {category.charAt(0).toUpperCase() + category.slice(1)} Movies Found
          </h1>
          <p className="text-gray-600 mb-8">
            We couldn't find any movies in this category. Try browsing other categories.
          </p>
          <a 
            href="/category-page?category=all&currentPage=1" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Movies
          </a>
        </div>
      </main>
    );
  }

  const capitalizedCategory = category === "all" 
    ? "All" 
    : category.charAt(0).toUpperCase() + category.slice(1);
  
  const totalPages = Math.ceil(data.totalCount / 30);
  
  return (
    <main className="min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
          </li>
          <li className="before:content-['/'] before:mx-2">
            <a href="/category-page?category=all&currentPage=1" className="hover:text-blue-600 transition-colors">
              Movies
            </a>
          </li>
          <li className="before:content-['/'] before:mx-2 text-gray-800 font-medium">
            {capitalizedCategory} Movies
          </li>
        </ol>
      </nav>

     

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {capitalizedCategory} Movies Collection
          </h2>
          <p className="text-gray-600">
            Download high-quality {category === "all" ? "" : category} movies in HD. 
            All movies are available in multiple formats including 480p, 720p, and 1080p.
          </p>
        </div>
        
        <SearchItems data={data.items} />
        
        {/* Pagination */}
        <div className="mt-12">
          <Pagination
            startNumber={
              currentPage - 4 < 1 ? 1 : currentPage - 4
            }
            paginatePagesToShow={4}
            currentPage={currentPage}
            category={category}
            skip={skip}
            whatFor="category"
            finalNumber={data.totalCount}
          />
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbStructuredData(category, currentPage))
        }}
      />
      
      {/* Collection Page Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${capitalizedCategory} Movies`,
            "description": `Collection of ${category === "all" ? "all" : category} movies available for download`,
            "url": `https://filmvault.xyz/category-page?category=${category}&currentPage=${currentPage}`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": data.totalCount,
              "itemListElement": data.items.slice(0, 10).map((item, index) => ({
                "@type": "Movie",
                "position": index + 1,
                "name": item.title || item.name,
                "description": item.description || `${item.title || item.name} - Free HD movie download`
              }))
            }
          })
        }}
      />
       {/* Page Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 -mb-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {capitalizedCategory} Movies
          </h1>
          <p className="text-xl mb-2 max-w-2xl mx-auto">
            {category === "all" 
              ? "Discover our complete collection of movies from all genres" 
              : `Explore our collection of ${category} movies`}
          </p>
          <p className="text-lg opacity-90">
            Page {currentPage} of {totalPages} • {data.totalCount} movies available
          </p>
        </div>
      </header>
    </main>
  );
};

export default CategoryPage;