import Link from "next/link";
import Image from "next/image";
import Categories from "./Categories";
import Searchbar from "./Searchbar";

const Navbar = () => {
  let hoveredOn = false;
  return (
    <>
      <div className="bg-gray-900 text-white w-full">
        <div className="flex justify-center items-center"></div>
        <nav className="text-white py-6 px-4">
          <div className="container mx-auto">
            <ul className="flex flex-wrap justify-center items-center space-x-2 md:space-x-8">
              <li className="relative group mb-2 md:mb-0">
                <Link
                  href="/"
                  className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
                >
                  home
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </Link>
              </li>

              <li className="relative group mb-2 md:mb-0">
                <Link
                  href={`/category-page?category=all&limit=30=&skip=1&currentPage=1`}
                  className="hover:text-green-400 uppercase text-lg md:text-xl font-bold relative px-2 py-1 transition-colors duration-300 ease-in-out"
                >
                  movies
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </Link>
              </li>
              <Categories />
            </ul>
          </div>
        </nav>
      </div>
      <Searchbar />
    </>
  );
};

export default Navbar;
