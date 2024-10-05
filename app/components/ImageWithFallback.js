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
          e.target.src = "/placeholder.jpg"; // Replace with your placeholder image path
        }}
      />
    );
  }

  return (
    <Image src={src} alt={alt} {...props} onError={() => setError(true)} />
  );
};

export default ImageWithFallback;
