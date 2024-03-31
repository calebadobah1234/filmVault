import React from "react";
import TopItems from "../../components/TopItems";

export const generateMetadata = async ({ params }) => {
  const res = await fetch(
    `https://byteread-final.onrender.com/get-item-details/${params.id}`,
    {
      next: { revalidate: 0 },
    }
  );
  const data = await res.json();
  return {
    title: `${data.title}`,
    description: `${data.description}`,
  };
};

const page = ({ params }) => {
  return (
    <>
      <TopItems id={params.id} />
    </>
  );
};

export default page;
