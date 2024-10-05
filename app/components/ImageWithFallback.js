"use client";

import React, { useState } from "react";
import Image from "next/image";

const ImageWithFallback = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [imgError, setImgError] = useState(false);

  const handleError = () => {
    if (!imgError) {
      setImgSrc("/placeholder.jpg"); // Replace with your placeholder image path
      setImgError(true);
    }
  };

  return <Image src={imgSrc} alt={alt} {...props} onError={handleError} />;
};

export default ImageWithFallback;
