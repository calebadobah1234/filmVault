import React from "react";
import Image from "next/image";
import ChangeSlideRight from "./ChangeSlideRight";

const SlideShow = async (props) => {
  let currentImage = 0;

  const changeSlideRight = () => {
    currentImage = (currentImage + 1) % props.data.length;
    return currentImage;
  };
  setTimeout(changeSlideRight, 5000); // Change slide every 5 seconds

  // clearInterval(intervalId); // Clear the interval when the component unmounts

  return (
    <div className="flex justify-center mt-5 min-h-[450px] max-h-[450px] overflow-hidden">
      <ChangeSlideRight currentImage={changeSlideRight} />
      <div className="max-w-full ">
        {props.data.map((item, index) => (
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
