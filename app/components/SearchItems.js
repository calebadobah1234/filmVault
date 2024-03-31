import React from "react";
import Link from "next/link";
import Image from "next/image";
const SearchItems = (props) => {
  return (
    <>
      {" "}
      <h2 className="flex justify-center text-white font-bold text-2xl my-4">
        You Searched for
      </h2>
      <div className="grid grid-cols-12">
        <div className="col-span-1"></div>
        <div className="flex flex-wrap col-span-10">
          {props.data.map((item) => {
            let image = item.img.split(",")[0];
            let imdb = item.imdb;
            const imdbNumber = parseFloat(imdb.match(/IMDb\n\n([\d.]+)/)[1]);
            const modifiedImg = decodeURIComponent(
              image.replace("/_next/image?url=", "").split("&")[0]
            );
            console.log(modifiedImg);
            return (
              <div
                key={item._id}
                className="flex-none shadow-2xl relative mb-4 mr-5 cursor-pointer overflow-hidden"
                style={{ flex: "0 0 auto" }}
              >
                <Link href={`/more/${item._id}`}>
                  <Image
                    src={modifiedImg}
                    width={400}
                    height={300}
                    className="h-[250px] rounded-md w-full object-cover transition duration-500 ease-in-out transform hover:scale-110"
                  />
                </Link>

                <div className="absolute left-0 bottom-0 text-blue-300 mb-7 rounded-sm ml-3 bg-red-500 px-2 text-xs ">
                  <p>Action</p>
                </div>
                <div className="absolute right-0 bottom-0 text-red-500 mb-7 rounded-sm mr-3 bg-yellow-500 px-2 text-xs ">
                  <p>{imdbNumber + "/10"}</p>
                </div>
                <div className="absolute bottom-0 text-white font-sans font-bold antialiased text-sm bg-black bg-opacity-30 line-clamp-1">
                  <div className="mx-3">
                    <h3>{item.title}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div></div>
      </div>
    </>
  );
};

export default SearchItems;
