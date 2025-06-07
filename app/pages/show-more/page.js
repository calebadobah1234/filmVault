import React from "react";
import Image from "next/image";
const page = () => {
  return (
    <>
      <div className="grid grid-cols-4">
        <div></div>
        <div className="col-span-3">
          <div className="flex">
            <h1 className="font-display text-4xl antialiased font-bold mt-8 ">
              Where to Watch John Wick Chapter 4
            </h1>
          </div>
          <div className="flex mt-14">
            <Image src="/jw4.webp" width={600} height={400} className="" />
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
};

export default page;
