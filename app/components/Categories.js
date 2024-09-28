"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

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
    <li className="relative group mb-2 md:mb-0">
      <button
        ref={buttonRef}
        onClick={toggleCategories}
        className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
      >
        Categories
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
      </button>
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-gray-800 text-white p-6 rounded-lg shadow-xl w-72 md:w-[48rem] max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between mb-6 border-b border-gray-700 pb-4 sticky top-0 bg-gray-800">
            {Object.keys(categoryTypes).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`text-sm px-3 py-2 rounded-full transition-colors duration-200 ${
                  activeType === type
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                className="text-sm hover:text-green-400 transition-colors duration-200"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}
    </li>
  );
};

export default Categories;
