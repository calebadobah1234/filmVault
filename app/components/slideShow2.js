"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const SlideShow = () => {
  const [data, setData] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://filmvaultbackend-4.onrender.com/slideShow"
        );
        const mainData = await res.json();
        console.log(mainData);
        setData(mainData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const changeSlideRight = () => {
    setCurrentImage((prevIndex) => (prevIndex + 1) % data.length);
  };

  useEffect(() => {
    const intervalId = setInterval(changeSlideRight, 5000);

    return () => {
      clearInterval(intervalId); // Clear the interval when the component unmounts
    };
  }, [data]);

  return (
    <div className="flex justify-center mt-5 min-h-[450px] max-h-[450px] overflow-hidden">
      <div className="max-w-full ">
        {data.map((item, index) => (
          <Image
            key={item._id}
            src={item.img}
            width={1920}
            height={1080}
            alt={item.title}
            className={`${currentImage === index ? "w-[750px]" : "hidden"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideShow;
