import React from "react";
import { Carousel } from "react-bootstrap";
import Image from "next/image";

const SlideShow = async () => {
  let data = [];
  let currentImage = 1;

  try {
    const res = await fetch("http://localhost:3001/slideShow", {
      next: { revalidate: 60000 },
    });
    const mainData = await res.json();
    console.log(mainData);
    data = mainData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return (
    <div>
      <Carousel>
        {data.map((item) => {
          <Carousel.Item>
            <Image src={item.img} alt={item.title} />
          </Carousel.Item>;
        })}
      </Carousel>
    </div>
  );
};

export default SlideShow;
