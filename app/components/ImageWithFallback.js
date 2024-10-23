"use client";

import React, { useState } from "react";
import Image from "next/image";

const ImageWithFallback = ({ src, alt, ...props }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <img
        src={src}
        alt={alt}
        {...props}
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop
          e.target.src =
            "https://th.bing.com/th/id/OIP.vemXta-UoBudoiVJZZgKZgHaHa?rs=1&pid=ImgDetMain"; // Replace with your placeholder image path
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={(e) => {
        e.target.onerror = null; // Prevent infinite loop
        e.target.src =
          "https://th.bing.com/th/id/OIP.vemXta-UoBudoiVJZZgKZgHaHa?rs=1&pid=ImgDetMain"; // Replace with your placeholder image path
      }}
    />
  );
};

export default ImageWithFallback;
