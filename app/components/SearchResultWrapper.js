"use client";

import React from "react";

const SearchResultWrapper = ({ children, title, isSearchPage }) => {
  const handleResultClick = async () => {
    try {
      const response = await fetch(
        `https://filmvaultbackend.onrender.com/increase-search-priority?title=${encodeURIComponent(
          title
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update search priority");
      }

      const result = await response.json();
      console.log("Search priority updated successfully", result);
    } catch (error) {
      console.error("Error updating search priority:", error);
    }
  };

  if (isSearchPage) {
    return <div onClick={handleResultClick}>{children}</div>;
  } else {
    return <>{children}</>;
  }
};

export default SearchResultWrapper;
