"use client";
import React from "react";
import { FaArrowCircleRight } from "react-icons/fa";

const ScrollHorizontal = ({ className }) => {
  const scrollRight = () => {
    const selector = `.${className}`;
    const scrollElement = document.querySelector(selector);
    if (scrollElement) {
      scrollElement.scrollBy({ left: 700, behavior: "smooth" });
    }
  };

  return (
    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-black z-10">
      <FaArrowCircleRight
        onClick={scrollRight}
        className="cursor-pointer text-4xl font-bold"
      />
    </div>
  );
};

export default ScrollHorizontal;
