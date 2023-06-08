import Link from "next/link";
import Image from "next/image";

import Searchbar from "./Searchbar";

const Navbar = () => {
  return (
    <>
      <div className="bg-black text-white max-md:w-[100%]">
        <div className="flex justify-center items-center">
          <Link href="/">
            <Image
              src="/finalLogo.png"
              width={200}
              height={200}
              alt="Byte-Read"
            />
          </Link>
        </div>
        <nav className="bg-black text-white py-5">
          <div className="container mx-auto flex justify-center items-center">
            <ul className="flex space-x-8">
              <li>
                <Link href="/" className="hover:text-blue-500">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-blue-500">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <Searchbar />
    </>
  );
};

export default Navbar;
