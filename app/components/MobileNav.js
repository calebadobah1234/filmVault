"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";

const categoryTypes = {
  movies: [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Historical",
    "Horror",
    "Music",
    "Musical",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "War",
    "Western",
  ].sort(),
  series: [
    "Action",
    "Adult Animation",
    "Adventure",
    "Animation",
    "Anime",
    "Australia",
    "Biography",
    "Brazil",
    "Buddy Comedy",
    "Buddy Cop",
    "Bumbling Detective",
    "Canada",
    "Car Action",
    "Children",
    "China",
    "Colombia",
    "Comedy",
    "Coming-of-Age",
    "Competition",
    "Computer Animation",
    "Contemporary Western",
    "Conspiracy Thriller",
    "Cop Drama",
    "Costume Drama",
    "Crime",
    "Cyber Thriller",
    "Cyberpunk",
    "Dark Comedy",
    "Dark Fantasy",
    "Dark Romance",
    "Dave Filoni",
    "Denmark",
    "Dinosaur Adventure",
    "Disaster",
    "Documentary",
    "Docudrama",
    "Docuseries",
    "Drama",
    "Drug Crime",
    "Dystopian Sci-Fi",
    "England",
    "Epic",
    "Erotic Thriller",
    "Fairy Tale",
    "Family",
    "Fantasy",
    "Fantasy Epic",
    "Farce",
    "Feel-Good Romance",
    "Financial Drama",
    "Folk Horror",
    "Football",
    "France",
    "Game Show",
    "Gangster",
    "Germany",
    "Globetrotting Adventure",
    "Hand-Drawn Animation",
    "Hard-boiled Detective",
    "Heist",
    "High-Concept Comedy",
    "Historical",
    "Historical Epic",
    "History",
    "History Documentary",
    "Holiday",
    "Holiday Family",
    "Horror",
    "IMDbPro",
    "Isekai",
    "Italy",
    "Iyashikei",
    "Japan",
    "Kaiju",
    "Korea",
    "Korean",
    "Korean Drama",
    "Kung Fu",
    "Legal Drama",
    "Legal Thriller",
    "Life",
    "Martial Arts",
    "Medical Drama",
    "Melodrama",
    "Mexico",
    "Military Documentary",
    "Mockumentary",
    "Monster Horror",
    "Motorsport",
    "Music",
    "Music Documentary",
    "Musical",
    "Mystery",
    "Nature Documentary",
    "News",
    "One-Person Army Action",
    "Organized Crime",
    "Parody",
    "Period Drama",
    "Police Procedural",
    "Political",
    "Political Drama",
    "Political Thriller",
    "Pop Musical",
    "Prison Drama",
    "Psychological Drama",
    "Psychological Horror",
    "Psychological Thriller",
    "Quest",
    "Quirky Comedy",
    "Raunchy Comedy",
    "Reality Show",
    "Reality TV",
    "Related Series",
    "Road Trip",
    "Romance",
    "Romantic Comedy",
    "Romantic Epic",
    "Samurai",
    "Satire",
    "School",
    "Sci-Fi",
    "Sci-Fi Epic",
    "Science & Technology Documentary",
    "Sea Adventure",
    "Seinen",
    "Serial Killer",
    "Short",
    "Showbiz Drama",
    "Showman",
    "Sitcom",
    "Slasher Horror",
    "Slapstick",
    "Slice of Life",
    "Soap Opera",
    "Soccer",
    "South Africa",
    "South Korea",
    "Space Sci-Fi",
    "Spain",
    "Splatter Horror",
    "Spy",
    "Sport",
    "Sports",
    "Sports Documentary",
    "Steampunk",
    "Steamy Romance",
    "Superhero",
    "Supernatural",
    "Supernatural Fantasy",
    "Supernatural Horror",
    "Survival",
    "Survival Competition",
    "Suspense Mystery",
    "Sweden",
    "Swashbuckler",
    "Sword & Sandal",
    "Sword & Sorcery",
    "Talent Competition",
    "Talk Show",
    "Teen Adventure",
    "Teen Comedy",
    "Teen Drama",
    "Teen Fantasy",
    "Teen Horror",
    "Teen Romance",
    "Thailand",
    "Thriller",
    "Thrilling",
    "Time Travel",
    "Tragedy",
    "Tragic Romance",
    "Travel Documentary",
    "True Crime",
    "TV Game Show",
    "Urban Adventure",
    "Vampire Horror",
    "Violence",
    "Vivienne Medrano",
    "War",
    "War Epic",
    "Werewolf Horror",
    "Western",
    "Western Epic",
    "Whodunnit",
    "Witch Horror",
    "Workplace Drama",
    "Youth",
    "Zombie Horror",
  ].sort(),
  anime: [
    "Academy Duel",
    "Action",
    "Adult",
    "Adventure",
    "Award-winning",
    "Boys",
    "Cars",
    "Childcare",
    "Chinese Anime",
    "Comedy",
    "Combat Sports",
    "Cooking",
    "Crime",
    "Cute Girls",
    "Demonic",
    "Detective",
    "Drama",
    "Educational",
    "Fantasy",
    "Filmkio",
    "Game",
    "Girls",
    "Harem",
    "Healing",
    "High-stakes Game",
    "Historical",
    "Horror",
    "Idol",
    "Isekai",
    "Life",
    "Madness",
    "Magic",
    "Magical Girl",
    "Martial Arts",
    "Medical",
    "Military",
    "Music",
    "MyAnime",
    "Mythology",
    "Organized Crime",
    "Otaku Culture",
    "Parody",
    "Performing Arts",
    "Pets",
    "Phoenix Syndicate",
    "Police",
    "Power",
    "Psychological",
    "Racing",
    "Related Series",
    "Reincarnation",
    "Reverse Harem",
    "Robots",
    "Romance",
    "Samurai",
    "School",
    "Sci-Fi",
    "Seinen",
    "Shirban City",
    "Shoujo",
    "Soul Land",
    "South Korea",
    "Space",
    "Special",
    "Sports",
    "Strategy Game",
    "Studio M.Y.M",
    "Supernatural",
    "Suspense",
    "Survival",
    "Team Sports",
    "Thrilling",
    "Time Travel",
    "TvWorld",
    "Vampire",
    "Video Game",
    "Violence",
    "Work Life",
  ].sort(),
  "korean Series": [
    "Action",
    "Adventure",
    "Business",
    "Comedy",
    "Crime",
    "Drama",
    "Family",
    "Fantasy",
    "Friendly",
    "Historical",
    "Horror",
    "Legal",
    "Life",
    "Medical",
    "Melodrama",
    "Military",
    "Musical",
    "Mystery",
    "Political",
    "Psychological",
    "Romance",
    "School",
    "Sci-Fi",
    "Sitcom",
    "Sports",
    "Supernatural",
    "Thrilling",
    "Youth",
  ].sort(),
};

const MobileNav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeType, setActiveType] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCategoryType = (type) => setActiveType(activeType === type ? null : type);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    
    if (sidebarOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [sidebarOpen]);

  const NavLink = ({ href, children }) => (
    <li className="group">
      <Link
        href={href}
        className="flex items-center py-3 px-4 text-lg font-medium text-gray-100 hover:text-white group-hover:bg-gray-700/50 rounded-lg transition-all duration-200"
        onClick={toggleSidebar}
      >
        <span className="relative">
          {children}
          <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </span>
      </Link>
    </li>
  );

  return (
    <>
      <div className="md:hidden">
        <button
          className="relative p-3 text-gray-100 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-lg transition-all duration-200"
          onClick={toggleSidebar}
          aria-label="Open menu"
          aria-expanded={sidebarOpen}
        >
          <Menu size={28} />
        </button>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        <div
          className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[100vw] bg-gray-800/95 backdrop-blur-md shadow-2xl transform ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-all duration-300 ease-out flex flex-col`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              className="p-2 text-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-400 rounded-lg transition-colors duration-200"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto">
            <nav className="h-full">
              <ul className="p-3 space-y-1">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/category-page?category=all&limit=30&skip=1&currentPage=1">
                  Movies
                </NavLink>
                <NavLink href="/category-page-series?category=all&limit=30&skip=1&currentPage=1">
                  Series
                </NavLink>
                <NavLink href="/category-page-anime?category=all&limit=30&skip=1&currentPage=1">
                  Anime
                </NavLink>
                <NavLink href="/category-page-kdrama?category=all&limit=30&skip=1&currentPage=1">
                  Korean Series
                </NavLink>
              </ul>

              <div className="px-3 py-4">
                <h3 className="px-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Categories
                </h3>
                {Object.entries(categoryTypes).map(([type, categories]) => (
                  <div key={type} className="mb-2">
                    <button
                      onClick={() => toggleCategoryType(type)}
                      className="flex justify-between items-center w-full py-2.5 px-3 text-gray-100 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                      aria-expanded={activeType === type}
                    >
                      <span className="font-medium">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                      <span className="transform transition-transform duration-200">
                        {activeType === type ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </span>
                    </button>
                    <div
                      className={`mt-1 overflow-hidden transition-all duration-200 ${
                        activeType === type ? 'max-h-64' : 'max-h-0'
                      }`}
                    >
                      <div className="pl-4 py-1 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        <ul className="space-y-1">
                          {categories.map((category) => (
                            <li key={category}>
                              <Link
                                href={`/category-page${
                                  type === "movies" ? "" : "-"
                                }${
                                  type === "korean Series"
                                    ? "kdrama"
                                    : type === "movies"
                                    ? ""
                                    : type
                                }?category=${encodeURIComponent(
                                  category
                                )}&limit=30&skip=1&currentPage=1`}
                                className="block py-2 px-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                                onClick={toggleSidebar}
                              >
                                {category}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;



