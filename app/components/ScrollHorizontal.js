"use client";

import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ScrollHorizontal = ({ className }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const scrollContainer = document.querySelector(`.${className}`);
    if (scrollContainer) {
      const checkScrollPosition = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
      };

      scrollContainer.addEventListener("scroll", checkScrollPosition);
      // Initial check
      checkScrollPosition();

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
      };
    }
  }, [className]);

  const scroll = (direction) => {
    const container = document.querySelector(`.${className}`);
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      const targetScroll =
        container.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);

      const startTime = performance.now();
      const startScrollLeft = container.scrollLeft;

      const animateScroll = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / 300, 1); // 300ms duration
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        container.scrollLeft =
          startScrollLeft + (targetScroll - startScrollLeft) * easeProgress;

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  return (
    <>
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md transition-all duration-300 hover:bg-opacity-100"
          aria-label="Scroll left"
        >
          <FaChevronLeft className="text-gray-800 text-xl" />
        </button>
      )}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md transition-all duration-300 hover:bg-opacity-100"
          aria-label="Scroll right"
        >
          <FaChevronRight className="text-gray-800 text-xl" />
        </button>
      )}
    </>
  );
};

export default ScrollHorizontal;
