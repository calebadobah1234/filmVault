"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from 'lucide-react';

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

const Categories = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState("movies");
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleCategories = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <li className="relative group">
      <button
        ref={buttonRef}
        onClick={toggleCategories}
        className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-all duration-200 flex items-center gap-1 group"
      >
        <span>Categories</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
      </button>
      
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute left-1/2 transform -translate-x-1/2 mt-4 z-10 bg-gray-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl w-72 md:w-[48rem] max-h-[80vh] overflow-y-auto border border-gray-800 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          {/* Category Type Tabs */}
          <div className="flex justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900/95 backdrop-blur-md z-10">
            <div className="flex gap-2 w-full justify-between">
              {Object.keys(categoryTypes).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeType === type
                      ? "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg shadow-green-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryTypes[activeType].map((category, index) => (
                <Link
                  key={index}
                  href={`/category-page${activeType == "movies" ? "" : "-"}${
                    activeType === "korean Series"
                      ? "kdrama"
                      : activeType == "movies"
                      ? ""
                      : activeType
                  }?category=${encodeURIComponent(
                    category
                  )}&limit=30&skip=1&currentPage=1`}
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-400 hover:text-white px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-800/50 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400/20 group"
                >
                  <span className="relative">
                    {category}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default Categories;
