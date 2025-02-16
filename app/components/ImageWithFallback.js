"use client"

import React, { useState } from 'react';

const ImageWithFallback = ({ src, title, fallbackUrl }) => {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc('https://th.bing.com/th/id/OIP.vemXta-UoBudoiVJZZgKZgHaHa?rs=1&pid=ImgDetMain');
  };

  return (
    <img
      src={imgSrc}
      alt={title || "Movie poster"}
      className="rounded-md transition duration-500 ease-in-out transform group-hover:brightness-75 relative w-full h-full object-cover aspect-[2/3]"
      width={180}
      height={250}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
    />
  );
};

export default ImageWithFallback;