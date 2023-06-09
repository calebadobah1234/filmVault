import { BsFacebook, BsInstagram, BsTwitter } from "react-icons/bs";
import Link from "next/link";

const Footer = () => {
  return (
    <>
      <div className="border-t-4 mt-28 pb-20 bg-black text-white">
        <div className="flex justify-center mt-10 flex-col items-center">
          <div className="text-lg font-bold mb-4">
            All rights reserved &copy; 2023
          </div>
          <div className="flex space-x-4">
            <div className="cursor-pointer text-2xl hover:text-blue-500">
              <Link href="https://www.facebook.com/profile.php?id=100093211403930">
                <BsFacebook />
              </Link>
            </div>
            {/* <div className="cursor-pointer text-2xl hover:text-pink-500">
              <BsInstagram />
            </div> */}
            <div className="cursor-pointer text-2xl hover:text-blue-400">
              <Link href="https://twitter.com/adobah102">
                <BsTwitter />{" "}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
