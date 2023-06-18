"use client";
import React from "react";

const TopTableOfContent = (props) => {
  const handleCLick = (index) => {
    const id = document.getElementById(index);
    id.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="mb-10">
      {props.data.entrys.map((item, index) => {
        return (
          <div
            className="hover:underline font-sans text-md antialiased font-bold my-1 max-w-3xl max-md:ml-2 text-blue-800 hover:cursor-pointer"
            key={item._id}
            onClick={() => {
              handleCLick(index);
            }}
          >
            {index + 1 + "." + " " + item.title}
          </div>
        );
      })}
    </div>
  );
};

export default TopTableOfContent;
