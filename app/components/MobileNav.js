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
  const toggleCategoryType = (type) =>
    setActiveType(activeType === type ? null : type);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  const NavLink = ({ href, children }) => (
    <li>
      <Link
        href={href}
        className="block py-3 px-4 text-lg font-semibold text-white hover:bg-gray-700 rounded transition-colors duration-200"
        onClick={toggleSidebar}
      >
        {children}
      </Link>
    </li>
  );

  return (
    <>
      <button
        className="md:hidden text-white focus:outline-none hover:text-green-400 transition-colors duration-200"
        onClick={toggleSidebar}
        aria-label="Open menu"
      >
        <Menu size={28} />
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-gray-800 shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              className="text-white focus:outline-none hover:text-green-400 transition-colors duration-200"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-grow overflow-y-auto">
            <ul className="py-2">
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
                <NavLink href="https://www.craacksoft.xyz/">
                Korean Series
              </NavLink>
            </ul>
            <div className="px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Categories
              </h3>
              {Object.entries(categoryTypes).map(([type, categories]) => (
                <div key={type} className="mb-2">
                  <button
                    onClick={() => toggleCategoryType(type)}
                    className="flex justify-between items-center w-full py-2 px-3 text-white hover:bg-gray-700 rounded transition-colors duration-200"
                  >
                    <span className="font-medium">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    {activeType === type ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                  {activeType === type && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {categories.map((category) => (
                        <li key={category}>
                          <Link
                            href={`/category-page${
                              type == "movies" ? "" : "-"
                            }${
                              type === "korean Series"
                                ? "kdrama"
                                : type == "movies"
                                ? ""
                                : type
                            }?category=${encodeURIComponent(
                              category
                            )}&limit=30&skip=1&currentPage=1`}
                            className="block py-2 px-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                            onClick={toggleSidebar}
                          >
                            {category}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
